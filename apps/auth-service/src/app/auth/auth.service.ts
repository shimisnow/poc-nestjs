import {
  BadGatewayException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import * as bcrypt from 'bcrypt';
import { UserAuthsRepository } from './repositories/user-auths/user-auths.repository';
import { SignUpSerializer } from './serializers/signup.serializer';
import { UserAuthEntity } from '@shared/database/entities/user-auth.entity';
import { LoginSerializer } from './serializers/login.serializer';
import { UserAuthStatusEnum } from '@shared/database/enums/user-auth-status.enum';

@Injectable()
export class AuthService {
  /** @ignore */
  constructor(
    private userAuthsRepository: UserAuthsRepository,
    private jwtService: JwtService
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
    const user = await this.userAuthsRepository.findByUsername(username);

    if (user?.status !== UserAuthStatusEnum.ACTIVE) {
      throw new UnauthorizedException();
    }

    if (await bcrypt.compare(user?.password, password)) {
      throw new UnauthorizedException();
    }

    const payload = {
      username: user.username,
      sub: user.userId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    } as LoginSerializer;
  }

  async signup(
    userId: number,
    username: string,
    password: string
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
