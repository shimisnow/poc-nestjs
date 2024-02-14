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
import { UserPayload } from '../payloads/user.payload';
import { AUTHENTICATION_ERROR } from '../enums/authentication-error.enum';
import { CacheKeyPrefix } from '../../cache/enums/cache-key-prefix.enum';
import { AuthErrorMessages } from '../enums/auth-error-messages.enum';
import { PasswordChangeCachePayload } from '../../cache/payloads/password-change-cache.payload';

@Injectable()
export class AuthRefreshGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.EmptyJsonWebTokenError,
        },
      });
    }

    let payload: UserPayload;

    // JWT verification
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET_KEY,
        maxAge: process.env.JWT_REFRESH_MAX_AGE,
      });
    } catch (error) {
      const exceptionBody = {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: error,
      };

      // if there is a message at the body, change it to the errors key
      // done for the sake of pattern
      if (exceptionBody.data?.message) {
        exceptionBody.data.errors = [
          exceptionBody.data?.message,
        ];

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
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.JsonWebTokenPayloadStrutureError,
          errors: messages,
        },
      });
    }

    // verify if the combination of userId with loginId is marked in cache as invalid
    const logoutVerification = await this.cacheService.get([
      CacheKeyPrefix.AUTH_SESSION_LOGOUT,
      payload.userId,
      payload.loginId,
    ].join(':'));

    if (logoutVerification !== null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.TokenInvalidatedByServer,
          errors: [
            AuthErrorMessages.INVALIDATED_BY_LOGOUT,
          ],
        },
      });
    }

    // verify if the user had a password change event
    const passwordChangeVerification = await this.cacheService.get<PasswordChangeCachePayload>([
      CacheKeyPrefix.AUTH_PASSWORD_CHANGE,
      payload.userId
    ].join(':'));

    // if there is an cache entry  
    if (passwordChangeVerification != null) {
      // this token login id is not the one that made the password change
      if (payload.loginId != passwordChangeVerification.loginId) {
        // and this token was not issued after the password change
        // iat is in seconds and changedAt at milliseconds
        if ((payload.iat * 1000) <= passwordChangeVerification.changedAt) {
          throw new UnauthorizedException({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Unauthorized',
            data: {
              name: AUTHENTICATION_ERROR.TokenInvalidatedByServer,
              errors: [
                AuthErrorMessages.INVALIDATED_BY_PASSWORD_CHANGE,
              ],
            },
          });
        }
      }
    }

    request['user'] = payload;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
