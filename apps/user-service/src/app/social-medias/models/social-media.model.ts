import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';
import { SocialMediaTypeEnum } from '../../database/enums/social-media-type.enum';

registerEnumType(SocialMediaTypeEnum, { name: 'SocialMediaTypeEnum' });

/**
 * Social media information
 */
@ObjectType({
  description: 'Social media information',
})
export class SocialMediaModel {
  /**
   * Unique identifier
   */
  @Field(() => Int, { description: 'Unique identifier' })
  socialMediaId: number;

  /**
   * Social media type as in facebook, instagram
   */
  @Field(() => SocialMediaTypeEnum, {
    description: 'Social media type as in facebook, instagram',
  })
  type: SocialMediaTypeEnum;

  /**
   * Social media profile/identifier
   */
  @Field(() => String, { description: 'Social media profile/identifier' })
  identifier: string;

  /**
   * User associated with the social media
   */
  @Field(() => UserModel, {
    description: 'User associated with the social media',
  })
  user: UserModel;
}
