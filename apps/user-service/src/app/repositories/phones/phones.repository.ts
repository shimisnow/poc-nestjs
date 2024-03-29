import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneEntity } from '../../database/entities/phone.entity';

/**
 * Provides access to the database phone entity
 */
@Injectable()
export class PhonesRepository {
  /** @ignore */
  constructor(
    @InjectRepository(PhoneEntity)
    private repository: Repository<PhoneEntity>,
  ) {}

  /**
   * Finds a phone by its unique id
   *
   * @param {number} phoneId Unique identifier
   * @param {[keyof PhoneEntity]} queryFields Entity fields to be retrieved
   * @returns {PhoneEntity | null} Found entity or null
   */
  async findOneById(
    phoneId: number,
    queryFields: [keyof PhoneEntity] = null,
  ): Promise<PhoneEntity | null> {
    if (queryFields === null) {
      return await this.repository.findOneBy({
        phoneId,
      });
    }

    // removes all elements from queryFields that does not exists at the entity
    // adds the primary key
    const select = this.filterEntityProperties(queryFields).concat(['phoneId']);

    const result = await this.repository.find({
      select,
      where: {
        phoneId,
      },
    });

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }

  /**
   * Finds a phone by its unique id and verifies the addresses owner
   *
   * @param {number} phoneId Unique identifier
   * @param {string} userId Resource owner id
   * @param {[keyof PhoneEntity]} queryFields Entity fields to be retrieved
   * @returns {PhoneEntity | null} Found entity or null
   */
  async findOneByIdWithUserId(
    phoneId: number,
    userId: string,
    queryFields: [keyof PhoneEntity] = null,
  ): Promise<PhoneEntity | null> {
    if (queryFields === null) {
      return await this.repository
        .createQueryBuilder()
        .where('phone_id = :phoneId', { phoneId })
        .andWhere('user_id = :userId', { userId })
        .getOne();
    }

    return await this.repository
      .createQueryBuilder('PhoneEntity')
      .select(queryFields.map((field) => `PhoneEntity.${field}`))
      .where('phone_id = :phoneId', { phoneId })
      .andWhere('user_id = :userId', { userId })
      .getOne();
  }

  /**
   * Finds all phones associated with the given user
   *
   * @param {string} userId Phone owner id
   * @param {[keyof PhoneEntity]} queryFields Entity fields to be retrieved
   * @returns {PhoneEntity[]} List with the found phones
   */
  async findByUserId(
    userId: string,
    queryFields: [keyof PhoneEntity] = null,
  ): Promise<PhoneEntity[]> {
    if (queryFields === null) {
      return await this.repository
        .createQueryBuilder()
        .where('user_id = :userId', { userId })
        .getMany();
    }

    return await this.repository
      .createQueryBuilder('PhoneEntity')
      .select(queryFields.map((field) => `PhoneEntity.${field}`))
      .where('user_id = :userId', { userId })
      .getMany();
  }

  /**
   * Remove all elements from an array that does not exists at the entity
   * properties list
   *
   * @param {string[]} fields Elements to be analized
   * @returns {[keyof PhoneEntity]} Filtered list
   */
  private filterEntityProperties(fields: string[]): [keyof PhoneEntity] {
    // get the entity properties name
    const entityProperties = this.repository.metadata.ownColumns.map(
      (column) => column.propertyName,
    );

    const filteredFields = fields.filter((field) =>
      entityProperties.includes(field),
    );

    return filteredFields as [keyof PhoneEntity];
  }
}
