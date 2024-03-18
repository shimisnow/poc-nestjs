import { SocialMediaTypeEnum } from '../../../database/enums/social-media-type.enum';
import { UserTwoEntityMock } from '../../users/mocks';

export const SocialMediaFourEntityMock = {
  socialMediaId: 4,
  type: SocialMediaTypeEnum.FACEBOOK,
  identifier: 'fb.four',
  user: UserTwoEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
