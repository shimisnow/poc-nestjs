import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users/users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findOneById(userId: string) {
    return await this.usersRepository.findOneById(userId);
  }
}
