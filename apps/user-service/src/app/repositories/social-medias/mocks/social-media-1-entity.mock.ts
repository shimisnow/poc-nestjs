import { SocialMediaTypeEnum } from '../../../database/enums/social-media-type.enum';
import { UserOneEntityMock } from '../../users/mocks';

export const SocialMediaOneEntityMock = {
  socialMediaId: 1,
  type: SocialMediaTypeEnum.INSTAGRAM,
  identifier: '@insta.one',
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
