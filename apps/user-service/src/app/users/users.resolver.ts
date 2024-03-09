import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
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
import { GraphQLUser } from '@shared/authentication/decorators/graphql-user.decorator';
import { GraphQLAuthGuard } from '@shared/authentication/guards/graphql-auth.guard';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { GraphQLQueryFields } from '../utils/decorators/graphql-query-fields.decorator';

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
  async getAuthenticatedUser(@GraphQLUser() user: UserPayload) {
    return await this.usersService.findOneById(user.userId);
  }

  @Query(() => UserModel, { name: 'user' })
  // @UseGuards(GraphQLAuthGuard)
  async getUser(
    // @GraphQLUser() user: UserPayload,
    @Args('userId', { type: () => String })
    userId: string,
    @GraphQLQueryFields() queryFields: string[],
  ) {
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
