import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialMediaEntity } from '../../database/entities/social-media.entity';

/**
 * Provides access to the database social media entity
 */
@Injectable()
export class SocialMediasRepository {
  /** @ignore */
  constructor(
    @InjectRepository(SocialMediaEntity)
    private repository: Repository<SocialMediaEntity>,
  ) {}

  /**
   * Finds a social media by its unique id
   *
   * @param {number} socialMediaId Unique identifier
   * @returns {SocialMediaEntity | null} Found entity or null
   */
  async findOneById(socialMediaId: number): Promise<SocialMediaEntity | null> {
    return await this.repository.findOneBy({
      socialMediaId,
    });
  }

  /**
   * Finds all social medias associated with the given user
   *
   * @param {string} userId Social media owner id
   * @param {[keyof SocialMediaEntity]} queryFields Entity fields to be retrieved
   * @returns {SocialMediaEntity[]} List with the found social medias
   */
  async findByUserId(
    userId: string,
    queryFields: [keyof SocialMediaEntity] = null,
  ): Promise<SocialMediaEntity[]> {
    return await this.repository
      .createQueryBuilder('SocialMediaEntity')
      .select(queryFields.map((field) => `SocialMediaEntity.${field}`))
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
