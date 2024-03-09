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
   * @param {[keyof SocialMediaEntity]} queryFields Entity fields to be retrieved
   * @returns {SocialMediaEntity | null} Found entity or null
   */
  async findOneById(
    socialMediaId: number,
    queryFields: [keyof SocialMediaEntity] = null,
  ): Promise<SocialMediaEntity | null> {
    if (queryFields === null) {
      return await this.repository.findOneBy({
        socialMediaId,
      });
    }

    // removes all elements from queryFields that does not exists at the entity
    // adds the primary key
    const select = this.filterEntityProperties(queryFields).concat([
      'socialMediaId',
    ]);

    const result = await this.repository.find({
      select,
      where: {
        socialMediaId,
      },
    });

    if (result.length > 0) {
      return result[0];
    }

    return null;
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
    if (queryFields === null) {
      return await this.repository
        .createQueryBuilder()
        .where('user_id = :userId', { userId })
        .getMany();
    }

    return await this.repository
      .createQueryBuilder('SocialMediaEntity')
      .select(queryFields.map((field) => `SocialMediaEntity.${field}`))
      .where('user_id = :userId', { userId })
      .getMany();
  }

  /**
   * Remove all elements from an array that does not exists at the entity
   * properties list
   *
   * @param {string[]} fields Elements to be analized
   * @returns {[keyof SocialMediaEntity]} Filtered list
   */
  private filterEntityProperties(fields: string[]): [keyof SocialMediaEntity] {
    // get the entity properties name
    const entityProperties = this.repository.metadata.ownColumns.map(
      (column) => column.propertyName,
    );

    const filteredFields = fields.filter((field) =>
      entityProperties.includes(field),
    );

    return filteredFields as [keyof SocialMediaEntity];
  }
}
