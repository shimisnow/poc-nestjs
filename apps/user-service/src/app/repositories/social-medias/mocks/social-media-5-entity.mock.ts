import { SocialMediaTypeEnum } from '../../../database/enums/social-media-type.enum';
import { UserThreeEntityMock } from '../../users/mocks';

export const SocialMediaFiveEntityMock = {
  socialMediaId: 5,
  type: SocialMediaTypeEnum.LINKEDIN,
  identifier: '/linkedin.five',
  user: UserThreeEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
