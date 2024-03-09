import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { SocialMediaModel } from './models/social-media.model';
import { SocialMediasService } from './social-medias.service';
import { UsersService } from '../users/users.service';
import { UserModel } from '../users/models/user.model';
import { GraphQLQueryFields } from '../utils/decorators/graphql-query-fields.decorator';

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
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.socialMediasService.findOneById(
      socialMediaId,
      queryFields,
    );
  }

  @ResolveField('user', () => UserModel)
  async getUser(
    @Parent() socialMedia: SocialMediaModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return this.usersService.findOneById(socialMedia.user.userId, queryFields);
  }
}
