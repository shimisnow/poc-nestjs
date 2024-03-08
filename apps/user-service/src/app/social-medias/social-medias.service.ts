import { Injectable } from '@nestjs/common';
import { SocialMediasRepository } from '../repositories/social-medias/social-medias.repository';
import { SocialMediaEntity } from '../database/entities/social-media.entity';

@Injectable()
export class SocialMediasService {
  constructor(private socialMediasRepository: SocialMediasRepository) {}

  async findOneById(
    socialMediaId: number,
    queryFields: string[] = null,
  ): Promise<SocialMediaEntity | null> {
    return await this.socialMediasRepository.findOneById(
      socialMediaId,
      queryFields as [keyof SocialMediaEntity],
    );
  }

  async findByUserId(
    userId: string,
    queryFields: string[] = null,
  ): Promise<SocialMediaEntity[]> {
    return await this.socialMediasRepository.findByUserId(
      userId,
      queryFields as [keyof SocialMediaEntity],
    );
  }
}
