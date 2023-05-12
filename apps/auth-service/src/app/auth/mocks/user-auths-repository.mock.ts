import { UserAuthEntity } from '@shared/database/entities/user-auth.entity';
import { UserAuthStatusEnum } from '@shared/database/enums/user-auth-status.enum';
import { QueryFailedError } from 'typeorm';

export class UserAuthsRepositoryMock {
  async findByUsername(username: string): Promise<UserAuthEntity> {
    switch (username) {
      case 'anderson':
        return {
          userId: 42,
          username,
          password:
            '$2b$10$JhiMsN9WN42gT7ofFBcJGO7q9PwhnmMpfz4yGNY1bc3WrHLep.r0W',
          status: UserAuthStatusEnum.ACTIVE,
        } as UserAuthEntity;
      case 'beatrice':
        return null;
      default:
        throw new QueryFailedError('', null, new Error('some error'));
    }
  }
}
