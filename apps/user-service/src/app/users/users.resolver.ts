import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { AddressesService } from '../addresses/addresses.service';
import { AddressModel } from '../addresses/models/address.model';
import { PhoneModel } from '../phones/models/phone.model';
import { PhonesService } from '../phones/phones.service';
import { LegalDocModel } from '../legal-docs/models/legal-doc.model';
import { LegalDocsService } from '../legal-docs/legal-docs.service';
import { SocialMediaModel } from '../social-medias/models/social-media.model';
import { SocialMediasService } from '../social-medias/social-medias.service';
import { GraphQLQueryFields } from '../utils/decorators/graphql-query-fields.decorator';
import { UseGuards } from '@nestjs/common';
import {
  AuthRoleEnum,
  GraphQLAuthGuard,
  GraphQLUser,
  UserPayload,
} from '@shared/authentication/graphql';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private addressesService: AddressesService,
    private phonesService: PhonesService,
    private legalDocsService: LegalDocsService,
    private socialMediasService: SocialMediasService,
  ) {}

  @Query(() => UserModel, { name: 'me' })
  @UseGuards(GraphQLAuthGuard)
  async getAuthenticatedUser(
    @GraphQLUser() user: UserPayload,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.usersService.findOneById(user.userId, queryFields);
  }

  @Query(() => UserModel, { name: 'user', nullable: true })
  @UseGuards(GraphQLAuthGuard)
  async getUser(
    @GraphQLUser() user: UserPayload,
    @Args('userId', { type: () => String })
    userId: string,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    if (user.role == AuthRoleEnum.USER) {
      if (userId != user.userId) {
        return null;
      }
    }

    return await this.usersService.findOneById(userId, queryFields);
  }

  @ResolveField('addresses', () => [AddressModel])
  async getAddresses(
    @Parent() user: UserModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.addressesService.findByUserId(user.userId, queryFields);
  }

  @ResolveField('phones', () => [PhoneModel])
  async getPhones(
    @Parent() user: UserModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.phonesService.findByUserId(user.userId, queryFields);
  }

  @ResolveField('legalDocs', () => [LegalDocModel])
  async getLegalDocs(
    @Parent() user: UserModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.legalDocsService.findByUserId(user.userId, queryFields);
  }

  @ResolveField('socialMedias', () => [SocialMediaModel])
  async getSocialMedias(
    @Parent() user: UserModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.socialMediasService.findByUserId(
      user.userId,
      queryFields,
    );
  }
}
