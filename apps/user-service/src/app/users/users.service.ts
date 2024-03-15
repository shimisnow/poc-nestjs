import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users/users.repository';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findOneById(
    userId: string,
    queryFields: string[] = null,
  ): Promise<UserEntity | null> {
    return await this.usersRepository.findOneById(
      userId,
      queryFields as [keyof UserEntity],
    );
  }
}
