import { UserEntity } from '../../database/entities/user.entity';

/**
 * Mocks the users repository to use in tests
 */
export class UsersRepositoryMock {
  async findOneById(userId: string): Promise<UserEntity | null> {
    return;
  }
}
