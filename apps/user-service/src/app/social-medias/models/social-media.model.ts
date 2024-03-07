import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';
import { SocialMediaTypeEnum } from '../../database/enums/social-media-type.enum';

registerEnumType(SocialMediaTypeEnum, { name: 'SocialMediaTypeEnum' });

@ObjectType({
  description: 'Social media information',
})
export class SocialMediaModel {
  @Field(() => Int, { description: 'Unique identifier' })
  socialMediaId: number;

  @Field(() => SocialMediaTypeEnum, {
    description: 'Social media type as in facebook, instagram',
  })
  type: SocialMediaTypeEnum;

  @Field(() => String, { description: 'Social media profile/identifier' })
  identifier: string;

  @Field(() => UserModel, {
    description: 'User associated with the social media',
  })
  user: UserModel;
}
