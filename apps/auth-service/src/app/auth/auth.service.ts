import {
  BadGatewayException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { AuthErrorNames } from '@shared/authentication/enums/auth-error-names.enum';
import { AuthErrorMessages } from '@shared/authentication/enums/auth-error-messages.enum';
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
import { PasswordChangeCachePayload } from '@shared/cache/payloads/password-change-cache.payload';

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
   * @param loginId Defined by each login request.
   * @returns Signed JWT token.
   */
  async generateAccessToken(userId: string, loginId: string): Promise<string> {
    const payload = {
      userId,
      loginId,
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
   * @param loginId Defined by each login request.
   * @returns Signed JWT token.
   */
  async generateRefreshToken(userId: string, loginId: string): Promise<string> {
    const payload = {
      userId,
      loginId,
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
   * @param username Username
   * @param password Password in plain text
   * @param requestAccessToken If a refreshToken should be generated
   * @returns Data with token to be used at the private endpoints
   * @throws BadGatewayException Database error
   * @throws UnauthorizedException User do not exists, is inactive or password is incorrect
   */
  async login(username: string, password: string, requestAccessToken: boolean): Promise<LoginSerializer> {
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
          name: AuthErrorNames.CREDENTIAL_ERROR,
          errors: [
            AuthErrorMessages.WRONG_USER_PASSWORD,
          ],
        },
      });
    }

    if ((await bcrypt.compare(password, user?.password)) === false) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AuthErrorNames.CREDENTIAL_ERROR,
          errors: [
            AuthErrorMessages.WRONG_USER_PASSWORD,
          ],
        },
      });
    }

    const loginId = new Date().getTime().toString();

    if(requestAccessToken) {
      return {
        accessToken: await this.generateAccessToken(user.userId, loginId),
        refreshToken: await this.generateRefreshToken(user.userId, loginId),
      };
    } else {
      return {
        accessToken: await this.generateAccessToken(user.userId, loginId),
      };
    }
  }

  /**
   * Invalidate access and refresh tokens for an user session.
   * 
   * @param userId User id as UUID.
   * @param loginId Login identification from JWT token.
   * @returns Information if the process was perfomed.
   * @throws UnauthorizedException User does not exists or is inactive.
   */
  async logout(userId: string, loginId: string): Promise<LogoutSerializer> {
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
          name: AuthErrorNames.JWT_INVALIDATED_BY_SERVER,
          errors: [
            AuthErrorMessages.INACTIVE_USER,
          ]
        },
      });
    }

    const performedAt = new Date().getTime()
    
    await this.cacheService.set([
        CacheKeyPrefix.AUTH_SESSION_LOGOUT,
        userId,
        loginId,
      ].join(':'), {
        performedAt,
      },
      {
        // the refreshToken is the one with the greater expire time
        ttl: this.convertStringToSeconds(process.env.JWT_REFRESH_EXPIRES_IN),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    );

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
          name: AuthErrorNames.CREDENTIAL_ERROR,
          errors: [
            AuthErrorMessages.INACTIVE_USER,
          ],
        },
      });
    }

    return {
      accessToken: await this.generateAccessToken(user.userId, user.loginId),
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

  /**
   * Changes user password and invalidates already issued JWT tokens.
   * 
   * @param userId UUID user information.
   * @param loginId ID do request.
   * @param currentPassword Actual password in plain text.
   * @param newPassword New password in plain text.
   * @returns Information if the password was changed.
   * @throws BadGatewayException Database error.
   * @throws UnauthorizedException User do not exists, is inactive or password is incorrect.
   * @throws UnprocessableEntityException Database error from query parser.
   */
  async passwordChange(
    userId: string,
    loginId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<PasswordChangeSerializer> {
    let userEntity: UserAuthEntity = null;

    // if the user exists into database
    try {
      userEntity = await this.userAuthsRepository.findById(userId);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }

    // if it does not exists or is inactive
    if (userEntity?.status !== UserAuthStatusEnum.ACTIVE) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AuthErrorNames.CREDENTIAL_ERROR,
          errors: [
            AuthErrorMessages.INACTIVE_USER,
          ],
        },
      });
    }

    // verify if the provided password is correct
    if ((await bcrypt.compare(currentPassword, userEntity?.password)) === false) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {
          name: AuthErrorNames.CREDENTIAL_ERROR,
          errors: [
            AuthErrorMessages.WRONG_USER_PASSWORD,
          ],
        },
      });
    }

    // sets the new password
    userEntity.password = newPassword;

    try {
      // stores the retrieved user with the new password
      await this.userAuthsRepository.save(userEntity);
    } catch (error) {
      switch (error.constructor) {
        case QueryFailedError:
          throw new UnprocessableEntityException();
        default:
          throw new BadGatewayException();
      }
    }

    // adds the timestamp to cache to invalidate tokens issued before this
    await this.cacheService.set([
        CacheKeyPrefix.AUTH_PASSWORD_CHANGE,
        userId,
      ].join(':'), {
        changedAt: new Date().getTime(),
      } as PasswordChangeCachePayload,
      {
        // the refreshToken is the one with the greater expire time
        ttl: this.convertStringToSeconds(process.env.JWT_REFRESH_EXPIRES_IN),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    );

    // sleeps one second to garantee that the new token timestamp will be greater than the cached one  
    await new Promise(response => setTimeout(response, 1000));

    return {
      performed: true,
      accessToken: await this.generateAccessToken(userEntity.userId, loginId),
      refreshToken: await this.generateRefreshToken(userEntity.userId, loginId),
    };
  }

  /**
   * Convertes a string to seconds
   * 
   * @param timeString Time to be converted. Ex: 3m, 1h, 2d
   * @returns Time converted to seconds
   */
  convertStringToSeconds(timeString: string): number {
    const [value, type] = timeString.split(/(\d+)/).filter(Boolean);

    let multiply = 1;

    switch (type) {
      case 'd':
        multiply = 86400; // 24 * 60 * 60;
        break;
      case 'h':
        multiply = 3600; // 60 * 60;
        break;
      case 'm':
        multiply = 60;
        break;
      default:
        Logger.log(`The time ${timeString} cannot be converted to seconds`);
    }

    return parseInt(value) * multiply;
  }
}
