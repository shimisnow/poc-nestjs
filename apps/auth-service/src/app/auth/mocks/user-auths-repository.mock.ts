import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';
import { UserAuthStatusEnum } from '@shared/database/authentication/enums/user-auth-status.enum';
import { InsertResult, QueryFailedError } from 'typeorm';

export class UserAuthsRepositoryMock {
  async findOne(options): Promise<UserAuthEntity> {
    if (options.where.username) {
      const username = options.where.username;
      switch (username) {
        case 'anderson':
          return {
            userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
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
            userId: 'fcf5cccf-c217-4502-8cc3-cc24270ae0b7',
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

    if (options.where.userId) {
      const userId = options.where.userId;
      switch (userId) {
        case '4b3c74ae-57aa-4752-9452-ed083b6d4b04':
          return null;
        case '4b3c74ae-57aa-4752-9452-ed083b6d4bfa':
          return {
            userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
            username: 'anderson',
            password:
              // test@1234
              '$2b$10$C8.WgVhIpd5NY81.b1GH1uCI53mggPdxrrIvyLyMjvZ68WOgOBQBW',
            status: UserAuthStatusEnum.ACTIVE,
          } as UserAuthEntity;
        default:
          return null;
      }
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

  async save(entity: UserAuthEntity): Promise<UserAuthEntity> {
    switch (entity.userId) {
      case '4b3c74ae-57aa-4752-9452-ed083b6d4bfa':
          return {
            userId: '4b3c74ae-57aa-4752-9452-ed083b6d4bfa',
            username: 'anderson',
            password:
              // test@1234
              '$2b$10$C8.WgVhIpd5NY81.b1GH1uCI53mggPdxrrIvyLyMjvZ68WOgOBQBW',
            status: UserAuthStatusEnum.ACTIVE,
          } as UserAuthEntity;
        default:
          return null;
    }
  }

  async find(options): Promise<UserAuthEntity[]> {
    // typeorm where with OR clause
    if(Array.isArray(options.where)) {
      for(let i = 0; i < options.where.length; i++) {
        if(options.where[i].userId !== undefined) {
          switch(options.where[i].userId) {
            case 'c3914f88-9a70-4775-9e32-7bcc8fbaeaaa':
              return [{
                userId: 'c3914f88-9a70-4775-9e32-7bcc8fbaeaaa',
                username: 'nathan',
              } as UserAuthEntity];
          }
        }

        if(options.where[i].username !== undefined) {
          switch(options.where[i].username) {
            case 'thomas':
              return [{
                userId: 'c3914f88-9a70-4775-9e32-7bcc8fbaeccd',
                username: 'thomas',
              } as UserAuthEntity];
          }
        }
      }

      return [];
    }
  }
}
