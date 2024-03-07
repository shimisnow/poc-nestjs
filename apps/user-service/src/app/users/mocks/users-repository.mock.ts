import { UserEntity } from '../../database/entities/user.entity';

export class UsersRepositoryMock {
  async findOneById(userId: string): Promise<UserEntity | null> {
    switch (userId) {
      case 'b0b6065a-dbbf-46a5-8db5-4c089aa17ec1':
        return {
          userId: 'b0b6065a-dbbf-46a5-8db5-4c089aa17ecf',
          name: 'Paul',
          surname: 'Atreides',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserEntity;
    }

    return null;
  }
}
