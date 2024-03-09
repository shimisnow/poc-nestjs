import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalDocEntity } from '../../database/entities/legaldoc.entity';

/**
 * Provides access to the database legal doc entity
 */
@Injectable()
export class LegalDocsRepository {
  /** @ignore */
  constructor(
    @InjectRepository(LegalDocEntity)
    private repository: Repository<LegalDocEntity>,
  ) {}

  /**
   * Finds a legal doc by its unique id
   *
   * @param {number} legalDocId Unique identifier
   * @param {[keyof LegalDocEntity]} queryFields Entity fields to be retrieved
   * @returns {LegalDocEntity | null} Found entity or null
   */
  async findOneById(
    legalDocId: number,
    queryFields: [keyof LegalDocEntity] = null,
  ): Promise<LegalDocEntity | null> {
    if (queryFields === null) {
      return await this.repository.findOneBy({
        legalDocId,
      });
    }

    // removes all elements from queryFields that does not exists at the entity
    // adds the primary key
    const select = this.filterEntityProperties(queryFields).concat([
      'legalDocId',
    ]);

    const result = await this.repository.find({
      select,
      where: {
        legalDocId,
      },
    });

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }

  /**
   * Finds all legal docs associated with the given user
   *
   * @param {string} userId Legal doc owner id
   * @param {[keyof LegalDocEntity]} queryFields Entity fields to be retrieved
   * @returns {LegalDocEntity[]} List with the found legal docs
   */
  async findByUserId(
    userId: string,
    queryFields: [keyof LegalDocEntity] = null,
  ): Promise<LegalDocEntity[]> {
    if (queryFields === null) {
      return await this.repository
        .createQueryBuilder()
        .where('user_id = :userId', { userId })
        .getMany();
    }

    return await this.repository
      .createQueryBuilder('LegalDocEntity')
      .select(queryFields.map((field) => `LegalDocEntity.${field}`))
      .where('user_id = :userId', { userId })
      .getMany();
  }

  /**
   * Remove all elements from an array that does not exists at the entity
   * properties list
   *
   * @param {string[]} fields Elements to be analized
   * @returns {[keyof LegalDocEntity]} Filtered list
   */
  private filterEntityProperties(fields: string[]): [keyof LegalDocEntity] {
    // get the entity properties name
    const entityProperties = this.repository.metadata.ownColumns.map(
      (column) => column.propertyName,
    );

    const filteredFields = fields.filter((field) =>
      entityProperties.includes(field),
    );

    return filteredFields as [keyof LegalDocEntity];
  }
}
