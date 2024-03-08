import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';

/**
 * Provides access to the database user entity
 */
@Injectable()
export class UsersRepository {
  /** @ignore */
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  /**
   * Finds a user by its unique id
   *
   * @param {string} userId Unique identifier
   * @returns {UserEntity | null} Found entity or null
   */
  async findOneById(
    userId: string,
    queryFields: [keyof UserEntity] = null,
  ): Promise<UserEntity | null> {
    if (queryFields === null) {
      return await this.repository.findOneBy({
        userId,
      });
    } else {
      const result = await this.repository.find({
        select: queryFields,
        where: {
          userId,
        },
      });

      if (result.length > 0) {
        return result[0];
      }

      return null;
    }
  }
}
