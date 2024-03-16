import { SocialMediaTypeEnum } from '../../../database/enums/social-media-type.enum';
import { UserTwoEntityMock } from '../../users/mocks';

export const SocialMediaThreeEntityMock = {
  socialMediaId: 3,
  type: SocialMediaTypeEnum.YOUTUBE,
  identifier: '/yt.three',
  user: UserTwoEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
