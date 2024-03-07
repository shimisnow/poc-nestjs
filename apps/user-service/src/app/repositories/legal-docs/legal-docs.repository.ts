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
   * @returns {LegalDocEntity | null} Found entity or null
   */
  async findOneById(legalDocId: number): Promise<LegalDocEntity | null> {
    return await this.repository.findOneBy({
      legalDocId,
    });
  }

  /**
   * Finds all legal docs associated with the given user
   *
   * @param {string} userId Legal doc owner id
   * @returns {LegalDocEntity[]} List with the found legal docs
   */
  async findByUserId(userId: string): Promise<LegalDocEntity[]> {
    return await this.repository
      .createQueryBuilder()
      .select()
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
