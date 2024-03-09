import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../database/entities/address.entity';

/**
 * Provides access to the database address entity
 */
@Injectable()
export class AddressesRepository {
  /** @ignore */
  constructor(
    @InjectRepository(AddressEntity)
    private repository: Repository<AddressEntity>,
  ) {}

  /**
   * Finds an address by its unique id
   *
   * @param {number} addressId Unique identifier
   * @param {[keyof AddressEntity]} queryFields Entity fields to be retrieved
   * @returns {AddressEntity | null} Found entity or null
   */
  async findOneById(
    addressId: number,
    queryFields: [keyof AddressEntity] = null,
  ): Promise<AddressEntity | null> {
    if (queryFields === null) {
      return await this.repository.findOneBy({
        addressId,
      });
    }

    // removes all elements from queryFields that does not exists at the entity
    // adds the primary key
    const select = this.filterEntityProperties(queryFields).concat([
      'addressId',
    ]);

    const result = await this.repository.find({
      select,
      where: {
        addressId,
      },
    });

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }

  /**
   * Finds all addresses associated with the given user
   *
   * @param {string} userId Address owner id
   * @param {[keyof AddressEntity]} queryFields Entity fields to be retrieved
   * @returns {AddressEntity[]} List with the found addresses
   */
  async findByUserId(
    userId: string,
    queryFields: [keyof AddressEntity] = null,
  ): Promise<AddressEntity[]> {
    if (queryFields === null) {
      return await this.repository
        .createQueryBuilder()
        .where('user_id = :userId', { userId })
        .getMany();
    }

    return await this.repository
      .createQueryBuilder('AddressEntity')
      .select(queryFields.map((field) => `AddressEntity.${field}`))
      .where('user_id = :userId', { userId })
      .getMany();
  }

  /**
   * Remove all elements from an array that does not exists at the entity
   * properties list
   *
   * @param {string[]} fields Elements to be analized
   * @returns {[keyof AddressEntity]} Filtered list
   */
  private filterEntityProperties(fields: string[]): [keyof AddressEntity] {
    // get the entity properties name
    const entityProperties = this.repository.metadata.ownColumns.map(
      (column) => column.propertyName,
    );

    const filteredFields = fields.filter((field) =>
      entityProperties.includes(field),
    );

    return filteredFields as [keyof AddressEntity];
  }
}
