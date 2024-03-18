import { SocialMediaTypeEnum } from '../../../database/enums/social-media-type.enum';
import { UserOneEntityMock } from '../../users/mocks';

export const SocialMediaTwoEntityMock = {
  socialMediaId: 2,
  type: SocialMediaTypeEnum.YOUTUBE,
  identifier: '/yt.two',
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
