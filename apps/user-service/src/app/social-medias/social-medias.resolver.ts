import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { SocialMediaModel } from './models/social-media.model';
import { SocialMediasService } from './social-medias.service';
import { UsersService } from '../users/users.service';
import { UserModel } from '../users/models/user.model';
import { GraphQLQueryFields } from '../utils/decorators/graphql-query-fields.decorator';
import { UseGuards } from '@nestjs/common';
import {
  AuthRoleEnum,
  GraphQLAuthGuard,
  GraphQLUser,
  UserPayload,
} from '@shared/authentication/graphql';

@Resolver(() => SocialMediaModel)
export class SocialMediasResolver {
  constructor(
    private socialMediasService: SocialMediasService,
    private usersService: UsersService,
  ) {}

  @Query(() => SocialMediaModel, { name: 'socialmedia', nullable: true })
  @UseGuards(GraphQLAuthGuard)
  async getSocialMedia(
    @GraphQLUser() user: UserPayload,
    @Args('socialMediaId', { type: () => Number })
    socialMediaId: number,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    if (user.role == AuthRoleEnum.USER) {
      return await this.socialMediasService.findOneByIdWithUserId(
        socialMediaId,
        user.userId,
        queryFields,
      );
    }

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
