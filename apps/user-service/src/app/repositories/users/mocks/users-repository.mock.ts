import { UserEntity } from '../../../database/entities/user.entity';
import { UserOneEntityMock, UserTwoEntityMock, UserThreeEntityMock } from '.';

/**
 * Mocks the users repository to use in tests
 */
export class UsersRepositoryMock {
  users = [UserOneEntityMock, UserTwoEntityMock, UserThreeEntityMock];

  async findOneById(
    userId: string,
    queryFields: string[] = null,
  ): Promise<UserEntity | null> {
    return this.users.find((value) => value.userId == userId) ?? null;
  }
}
