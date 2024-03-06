import { UserEntity } from '../../database/entities/user.entity';

export class UsersRepositoryMock {
  async findOneById(userId: string): Promise<UserEntity | null> {
    return;
  }
}
