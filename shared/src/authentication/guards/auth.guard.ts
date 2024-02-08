import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { UserPayload } from '../payloads/user.payload';
import { AUTHENTICATION_ERROR } from '../enums/authentication-error.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

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
        maxAge: process.env.JWT_MAX_AGE,
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

    request['user'] = payload;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
