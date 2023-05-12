import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthEntity } from '@shared/database/entities/user-auth.entity';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class UserAuthsRepository {
  constructor(
    @InjectRepository(UserAuthEntity)
    private repository: Repository<UserAuthEntity>
  ) {}

  async findById(userId: number): Promise<UserAuthEntity> {
    return await this.repository.findOne({
      where: {
        userId,
      },
    });
  }

  async findByUsername(username: string): Promise<UserAuthEntity> {
    return await this.repository.findOne({
      where: {
        username,
      },
    });
  }

  async insert(entity: UserAuthEntity): Promise<InsertResult> {
    return await this.repository.insert(entity);
  }
}
