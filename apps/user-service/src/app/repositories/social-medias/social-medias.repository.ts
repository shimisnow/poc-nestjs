import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialMediaEntity } from '../../database/entities/social-media.entity';

@Injectable()
export class SocialMediasRepository {
  constructor(
    @InjectRepository(SocialMediaEntity)
    private repository: Repository<SocialMediaEntity>,
  ) {}

  async findOneById(socialMediaId: number): Promise<SocialMediaEntity | null> {
    return await this.repository.findOneBy({
      socialMediaId,
    });
  }

  async findByUserId(userId: string): Promise<SocialMediaEntity[]> {
    return await this.repository
      .createQueryBuilder()
      .select()
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
