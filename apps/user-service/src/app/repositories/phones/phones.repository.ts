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
   * @returns {PhoneEntity | null} Found entity or null
   */
  async findOneById(phoneId: number): Promise<PhoneEntity | null> {
    return await this.repository.findOneBy({
      phoneId,
    });
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
    return await this.repository
      .createQueryBuilder('PhoneEntity')
      .select(queryFields.map((field) => `PhoneEntity.${field}`))
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
