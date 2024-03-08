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
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { UserPayload } from '@shared/authentication/payloads/user.payload';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private addressesService: AddressesService,
    private phonesService: PhonesService,
    private legalDocsService: LegalDocsService,
    private socialMediasService: SocialMediasService,
  ) {}

  @Query(() => UserModel, { name: 'user' })
  @UseGuards(AuthGuard)
  async getUser(
    @User() user: UserPayload,
    @Args('userId', { type: () => String })
    userId: string,
  ) {
    return await this.usersService.findOneById(userId);
  }

  @ResolveField('addresses', () => [AddressModel])
  async getAddresses(@Parent() user: UserModel) {
    return await this.addressesService.findByUserId(user.userId);
  }

  @ResolveField('phones', () => [PhoneModel])
  async getPhones(@Parent() user: UserModel) {
    return await this.phonesService.findByUserId(user.userId);
  }

  @ResolveField('legalDocs', () => [LegalDocModel])
  async getLegalDocs(@Parent() user: UserModel) {
    return await this.legalDocsService.findByUserId(user.userId);
  }

  @ResolveField('socialMedias', () => [SocialMediaModel])
  async getSocialMedias(@Parent() user: UserModel) {
    return await this.socialMediasService.findByUserId(user.userId);
  }
}
