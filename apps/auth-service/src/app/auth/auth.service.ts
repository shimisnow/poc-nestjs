import {
  BadGatewayException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { SignUpSerializer } from './serializers/signup.serializer';
import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';
import { LoginSerializer } from './serializers/login.serializer';
import { UserAuthStatusEnum } from '@shared/database/authentication/enums/user-auth-status.enum';

@Injectable()
export class AuthService {
  /** @ignore */
  constructor(
    private userAuthsRepository: UserAuthsRepository,
    private jwtService: JwtService,
  ) {}

  /**
   * Verifies if the provided username is already registered into database.
   *
   * @param username Username to be verified.
   * @returns Information if username is already registered into database.
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

  async login(username: string, password: string): Promise<LoginSerializer> {
    let user: UserAuthEntity = null;

    try {
      user = await this.userAuthsRepository.findByUsername(username);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }

    if (user?.status !== UserAuthStatusEnum.ACTIVE) {
      throw new UnauthorizedException();
    }

    if ((await bcrypt.compare(password, user?.password)) === false) {
      throw new UnauthorizedException();
    }

    const payload: UserPayload = {
      userId: user.userId,
      iat: 1696354363,
      exp: 1917279163,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    } as LoginSerializer;
  }

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
}
