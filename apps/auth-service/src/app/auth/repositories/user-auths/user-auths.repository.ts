import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class UserAuthsRepository {
  constructor(
    @InjectRepository(UserAuthEntity)
    private repository: Repository<UserAuthEntity>,
  ) {}

  async findById(userId: string): Promise<UserAuthEntity> {
    return await this.repository.findOne({
      where: {
        userId,
      },
    });
  }

  /**
   * Finds a entity (user) by its username.
   *
   * @param username Username to be found.
   * @returns Found entity or null.
   */
  async findByUsername(username: string): Promise<UserAuthEntity | null> {
    return await this.repository.findOne({
      where: {
        username,
      },
    });
  }

  async insert(entity: UserAuthEntity): Promise<InsertResult> {
    return await this.repository.insert(entity);
  }

  async save(entity: UserAuthEntity): Promise<UserAuthEntity> {
    return await this.repository.save(entity);
  }
}
