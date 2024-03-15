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
   * @param {string[]} queryFields Entity fields to be retrieved
   * @returns {UserEntity | null} Found entity or null
   */
  async findOneById(
    userId: string,
    queryFields: string[] = null,
  ): Promise<UserEntity | null> {
    if (queryFields === null) {
      return await this.repository.findOneBy({
        userId,
      });
    }

    // removes all elements from queryFields that does not exists at the entity
    // adds the primary key
    const select = this.filterEntityProperties(queryFields).concat(['userId']);

    const result = await this.repository.find({
      select,
      where: {
        userId,
      },
    });

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }

  /**
   * Remove all elements from an array that does not exists at the entity
   * properties list
   *
   * @param {string[]} fields Elements to be analized
   * @returns {[keyof UserEntity]} Filtered list
   */
  private filterEntityProperties(fields: string[]): [keyof UserEntity] {
    // get the entity properties name
    const entityProperties = this.repository.metadata.ownColumns.map(
      (column) => column.propertyName,
    );

    const filteredFields = fields.filter((field) =>
      entityProperties.includes(field),
    );

    return filteredFields as [keyof UserEntity];
  }
}
