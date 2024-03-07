import { SocialMediaEntity } from '../../database/entities/social-media.entity';

export class SocialMediasRepositoryMock {
  async findOneById(socialMediaId: number): Promise<SocialMediaEntity | null> {
    return;
  }

  async findByUserId(userId: string): Promise<SocialMediaEntity[]> {
    return;
  }
}
