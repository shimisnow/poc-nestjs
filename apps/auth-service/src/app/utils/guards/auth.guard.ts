import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { CacheKeyPrefix } from '@shared/cache/enums/cache-key-prefix.enum';
import { PasswordChangeCachePayload } from '@shared/cache/payloads/password-change-cache.payload';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    request['user'] = await this.extractPayloadFromJwtToken(token);

    return true;
  }

  protected extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  protected async extractPayloadFromJwtToken(
    token: string,
  ): Promise<UserPayload> {
    if (!token) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        data: {
          name: AuthErrorNames.JWT_EMPTY_ERROR,
        },
      });
    }

    let payload: UserPayload;

    // JWT verification
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
        maxAge: process.env.JWT_MAX_AGE ?? '1h',
      });
    } catch (error) {
      const exceptionBody = {
        statusCode: HttpStatus.UNAUTHORIZED,
        data: error,
      };

      // if there is a message at the body, change it to the errors key
      // done for the sake of pattern
      if (exceptionBody.data?.message) {
        exceptionBody.data.errors = [exceptionBody.data?.message];

        delete exceptionBody.data['message'];
      }

      throw new UnauthorizedException(exceptionBody);
    }

    // verifies if the payload has the correct structure
    try {
      payload = plainToClass(UserPayload, payload);
      await validateOrReject(payload);
    } catch (errors) {
      const messages = [];

      errors.forEach((error) => {
        Object.keys(error.constraints).forEach((key) => {
          messages.push(error.constraints[key]);
        });
      });

      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        data: {
          name: AuthErrorNames.JWT_PAYLOAD_STRUCTURE_ERROR,
          errors: messages,
        },
      });
    }

    // verify if the combination of userId with loginId is marked in cache as invalid
    const logoutVerification = await this.cacheService.get(
      [
        CacheKeyPrefix.AUTH_SESSION_LOGOUT,
        payload.userId,
        payload.loginId,
      ].join(':'),
    );

    if (typeof logoutVerification !== 'undefined') {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        data: {
          name: AuthErrorNames.JWT_INVALIDATED_BY_SERVER,
          errors: [AuthErrorMessages.INVALIDATED_BY_LOGOUT],
        },
      });
    }

    // verify if the user had a password change event
    const passwordChangeVerification =
      await this.cacheService.get<PasswordChangeCachePayload>(
        [CacheKeyPrefix.AUTH_PASSWORD_CHANGE, payload.userId].join(':'),
      );

    // if there is an cache entry
    if (typeof passwordChangeVerification !== 'undefined') {
      // if this token was not issued after the password change
      // iat is in seconds and changedAt at milliseconds
      if (payload.iat * 1000 <= passwordChangeVerification.changedAt) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          data: {
            name: AuthErrorNames.JWT_INVALIDATED_BY_SERVER,
            errors: [AuthErrorMessages.INVALIDATED_BY_PASSWORD_CHANGE],
          },
        });
      }
    }

    return payload;
  }
}
