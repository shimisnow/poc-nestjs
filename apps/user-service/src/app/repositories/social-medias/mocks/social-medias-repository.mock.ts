import { SocialMediaEntity } from '../../../database/entities/social-media.entity';
import {
  SocialMediaOneEntityMock,
  SocialMediaTwoEntityMock,
  SocialMediaThreeEntityMock,
  SocialMediaFourEntityMock,
  SocialMediaFiveEntityMock,
} from '.';

/**
 * Mocks the social medias repository to use in tests
 */
export class SocialMediasRepositoryMock {
  socialMedias = [
    SocialMediaOneEntityMock,
    SocialMediaTwoEntityMock,
    SocialMediaThreeEntityMock,
    SocialMediaFourEntityMock,
    SocialMediaFiveEntityMock,
  ];

  async findOneById(
    socialMediaId: number,
    queryFields: [keyof SocialMediaEntity] = null,
  ): Promise<SocialMediaEntity | null> {
    return this.socialMedias.find(
      (value) => value.socialMediaId == socialMediaId,
    );
  }

  async findOneByIdWithUserId(
    socialMediaId: number,
    userId: string,
    queryFields: [keyof SocialMediaEntity] = null,
  ): Promise<SocialMediaEntity | null> {
    return this.socialMedias.find((value) => {
      return (
        value.socialMediaId == socialMediaId && value.user.userId == userId
      );
    });
  }

  async findByUserId(
    userId: string,
    queryFields: [keyof SocialMediaEntity] = null,
  ): Promise<SocialMediaEntity[]> {
    return this.socialMedias.filter((value) => value.user.userId == userId);
  }
}
