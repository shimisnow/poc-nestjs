import {
  BadGatewayException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { AUTHENTICATION_ERROR } from '@shared/authentication/enums/authentication-error.enum';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { CacheKeyPrefix } from '@shared/cache/enums/cache-key-prefix.enum';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { SignUpSerializer } from './serializers/signup.serializer';
import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';
import { LoginSerializer } from './serializers/login.serializer';
import { UserAuthStatusEnum } from '@shared/database/authentication/enums/user-auth-status.enum';
import { RefreshSerializer } from './serializers/refresh.serializer';
import { LogoutSerializer } from './serializers/logout.serializer';
import { PasswordChangeSerializer } from './serializers/password-change.serializer';

@Injectable()
export class AuthService {
  /** @ignore */
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private userAuthsRepository: UserAuthsRepository,
    private jwtService: JwtService,
  ) {}

  /**
   * Generates and signs a JWT token using the JWT_SECRET_KEY.
   * 
   * @param userId User id as UUID.
   * @returns Signed JWT token.
   */
  async generateAccessToken(userId: string): Promise<string> {
    const payload = {
      userId,
      iss: new Date().getTime(),
    } as UserPayload;

    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  /**
   * Generates and signs a JWT token using the JWT_REFRESH_SECRET_KEY.
   * 
   * @param userId User id as UUID.
   * @returns Signed JWT token.
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const payload = {
      userId,
      iss: new Date().getTime(),
    } as UserPayload;

    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  }

  /**
   * Verifies if the provided username is already registered into database.
   *
   * @param username Username to be verified.
   * @returns Information if username is already registered into database.
   * @throws BadGatewayException Database error.
   */
  async verifyIfUsernameExists(username: string): Promise<boolean> {
    let result: UserAuthEntity = null;

    try {
      result = await this.userAuthsRepository.findByUsername(username);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }

    if (!result) {
      return false;
    }

    return true;
  }

  /**
   * Gets token to be used at API requests.
   * 
   * @param username Username.
   * @param password Password in plain text.
   * @returns Data with token to be used at the private endpoints.
   * @throws BadGatewayException Database error.
   * @throws UnauthorizedException User do not exists, is inactive or password is incorrect.
   */
  async login(username: string, password: string): Promise<LoginSerializer> {
    let user: UserAuthEntity = null;

    try {
      user = await this.userAuthsRepository.findByUsername(username);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }

    // if the user does not exists, will throw this if error
    if (user?.status !== UserAuthStatusEnum.ACTIVE) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.UserPasswordError,
          errors: [
            'wrong user or password information',
          ],
        },
      });
    }

    if ((await bcrypt.compare(password, user?.password)) === false) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.UserPasswordError,
          errors: [
            'wrong user or password information',
          ],
        },
      });
    }

    return {
      accessToken: await this.generateAccessToken(user.userId),
      refreshToken: await this.generateRefreshToken(user.userId),
    };
  }

  /**
   * Invalidate access and refresh tokens for an user session.
   * 
   * @param userId User id as UUID.
   * @param sessionId iss information from jwt.
   * @returns Information if the process was perfomed.
   * @throws UnauthorizedException User does not exists or is inactive.
   */
  async logout(userId: string, sessionId: number): Promise<LogoutSerializer> {
    let userEntity: UserAuthEntity = null;

    try {
      userEntity = await this.userAuthsRepository.findById(userId);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }

    if (userEntity?.status !== UserAuthStatusEnum.ACTIVE) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.TokenInvalidatedByServer,
          errors: [
            'user is inactive',
          ]
        },
      });
    }

    const performedAt = new Date().getTime()
    
    await this.cacheService.set([
      CacheKeyPrefix.AUTH_SESSION_LOGOUT,
      userId,
      sessionId
    ].join(':'), {
      performedAt,
    });

    return {
      performed: true,
      performedAt, 
    };
  }

  /**
   * Generates a new JWT access token.
   * 
   * @param user User information as JWT payload. 
   * @returns Data with a JWT signed token.
   * @throws BadGatewayException Database error.
   * @throws UnauthorizedException User do not exists, is inactive or password is incorrect.
   */
  async refresh(user: UserPayload): Promise<RefreshSerializer> {
    let userEntity: UserAuthEntity = null;

    try {
      userEntity = await this.userAuthsRepository.findById(user.userId);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }

    if (userEntity?.status !== UserAuthStatusEnum.ACTIVE) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.UserPasswordError,
          errors: [
            'user is inactive or does not exists',
          ],
        },
      });
    }

    return {
      accessToken: await this.generateAccessToken(user.userId),
    }
  }

  /**
   * Register an user authentication information.
   * 
   * @param userId UUID user information.
   * @param username Username.
   * @param password Password in plain text.
   * @returns Information if the user was registered.
   * @throws ConflictException Username or userId duplicated.
   * @throws UnprocessableEntityException Database error from query parser.
   * @throws BadGatewayException Database error.
   */
  async signup(
    userId: string,
    username: string,
    password: string,
  ): Promise<SignUpSerializer> {
    const response = {
      status: false,
    };

    const entity = new UserAuthEntity();
    entity.userId = userId;
    entity.username = username;
    entity.password = password;

    try {
      const result = await this.userAuthsRepository.insert(entity);

      if (result.identifiers.length > 0) {
        response.status = true;
      }
    } catch (error) {
      switch (error.constructor) {
        case QueryFailedError:
          if (error.message.startsWith('duplicate key')) {
            throw new ConflictException();
          } else {
            throw new UnprocessableEntityException();
          }
        default:
          throw new BadGatewayException();
      }
    }

    return response;
  }

  async passwordChange(
    userId: string,
    sessionId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<PasswordChangeSerializer> {
    let userEntity: UserAuthEntity = null;
    const resultStatus: PasswordChangeSerializer = {
      performed: false,
    }

    try {
      userEntity = await this.userAuthsRepository.findById(userId);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }

    if (userEntity?.status !== UserAuthStatusEnum.ACTIVE) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.UserPasswordError,
          errors: [
            'user is inactive or does not exists',
          ],
        },
      });
    }

    if ((await bcrypt.compare(currentPassword, userEntity?.password)) === false) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AUTHENTICATION_ERROR.UserPasswordError,
          errors: [
            'wrong user or password information',
          ],
        },
      });
    }

    userEntity.password = newPassword;

    try {
      const result = await this.userAuthsRepository.save(userEntity);

      if (result != null) {
        resultStatus.performed = true;
      }
    } catch (error) {
      console.log(error);
      switch (error.constructor) {
        case QueryFailedError:
          throw new UnprocessableEntityException();
        default:
          throw new BadGatewayException();
      }
    }

    await this.cacheService.set([
      CacheKeyPrefix.AUTH_PASSWORD_CHANGE,
      userId,
    ].join(':'), {
      sessionId,
      changedAt: new Date().getTime(),
    });

    return resultStatus;
  }
}
