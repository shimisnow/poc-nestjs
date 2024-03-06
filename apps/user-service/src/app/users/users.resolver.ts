import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { AddressesService } from '../addresses/addresses.service';
import { AddressModel } from '../addresses/models/address.model';
import { PhoneModel } from '../phones/models/phone.model';
import { PhonesService } from '../phones/phones.service';

@Resolver((of) => UserModel)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private addressesService: AddressesService,
    private phonesService: PhonesService,
  ) {}

  @Query((returns) => UserModel, { name: 'user' })
  async getUser(
    @Args('userId', { type: () => String })
    userId: string,
  ) {
    return await this.usersService.findOneById(userId);
  }

  @ResolveField('addresses', (returns) => [AddressModel])
  async getAddresses(@Parent() user: UserModel) {
    return await this.addressesService.findByUserId(user.userId);
  }

  @ResolveField('phones', (returns) => [PhoneModel])
  async getPhones(@Parent() user: UserModel) {
    return await this.phonesService.findByUserId(user.userId);
  }
}
