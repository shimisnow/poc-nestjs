import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SocialMediaModel } from './models/social-media.model';
import { SocialMediasService } from './social-medias.service';
import { UsersService } from '../users/users.service';
import { UserModel } from '../users/models/user.model';
import { GraphQLResolveInfo } from 'graphql';
import { GraphQLUtils } from '../utils/graphql-utils';

@Resolver(() => SocialMediaModel)
export class SocialMediasResolver {
  constructor(
    private socialMediasService: SocialMediasService,
    private usersService: UsersService,
  ) {}

  @Query(() => SocialMediaModel, { name: 'socialmedias' })
  async getSocialMedia(
    @Args('socialMediaId', { type: () => Number })
    socialMediaId: number,
    @Info() info: GraphQLResolveInfo,
  ) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return await this.socialMediasService.findOneById(
      socialMediaId,
      queryFields,
    );
  }

  @ResolveField('user', () => UserModel)
  async getUser(@Parent() socialMedia: SocialMediaModel) {
    return this.usersService.findOneById(socialMedia.user.userId);
  }
}
