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
   * @returns {AddressEntity | null} Found entity or null
   */
  async findOneById(addressId: number): Promise<AddressEntity | null> {
    return await this.repository.findOneBy({
      addressId,
    });
  }

  /**
   * Finds all addresses associated with the given user
   *
   * @param {string} userId Address owner id
   * @returns {AddressEntity[]} List with the found addresses
   */
  async findByUserId(userId: string): Promise<AddressEntity[]> {
    return await this.repository
      .createQueryBuilder()
      .select()
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
