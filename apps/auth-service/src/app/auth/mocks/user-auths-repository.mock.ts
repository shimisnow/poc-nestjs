import { UserAuthEntity } from '@shared/database/entities/user-auth.entity';
import { UserAuthStatusEnum } from '@shared/database/enums/user-auth-status.enum';
import { InsertResult, QueryFailedError } from 'typeorm';

export class UserAuthsRepositoryMock {
  async findByUsername(username: string): Promise<UserAuthEntity> {
    switch (username) {
      case 'anderson':
        return {
          userId: 42,
          username,
          password:
            // test@1234
            '$2b$10$C8.WgVhIpd5NY81.b1GH1uCI53mggPdxrrIvyLyMjvZ68WOgOBQBW',
          status: UserAuthStatusEnum.ACTIVE,
        } as UserAuthEntity;
      case 'beatrice':
        return null;
      case 'thomas':
        return {
          userId: 33,
          username,
          password:
            // test@1234
            '$2b$10$C8.WgVhIpd5NY81.b1GH1uCI53mggPdxrrIvyLyMjvZ68WOgOBQBW',
          status: UserAuthStatusEnum.INACTIVE,
        } as UserAuthEntity;
      default:
        throw new QueryFailedError('', null, new Error('some error'));
    }
  }

  async insert(entity: UserAuthEntity): Promise<InsertResult> {
    switch (entity.username) {
      case 'anderson':
        return {
          identifiers: [
            {
              userId: entity.userId,
            },
          ],
          generatedMaps: [
            {
              status: 'inactive',
              created_at: new Date('2023-06-15T02:36:39.129Z'),
              updated_at: new Date('2023-06-15T02:36:39.129Z'),
            },
          ],
          raw: [
            {
              status: 'inactive',
              created_at: new Date('2023-06-15T02:36:39.129Z'),
              updated_at: new Date('2023-06-15T02:36:39.129Z'),
            },
          ],
        };
      case 'thomas':
        throw new QueryFailedError('', null, new Error('duplicate key'));
      case 'jonas':
        throw new QueryFailedError('', null, new Error('some error'));
      default:
        throw new Error('some error');
    }
  }
}
