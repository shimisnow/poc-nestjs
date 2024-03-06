import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AddressModel } from './models/address.model';
import { AddressesService } from './addresses.service';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { CountryModel } from '../countries/models/country.model';
import { UserModel } from '../users/models/user.model';

@Resolver((of) => AddressModel)
export class AddressesResolver {
  constructor(
    private addressesService: AddressesService,
    private countriesService: CountriesService,
    private usersService: UsersService,
  ) {}

  @Query((returns) => AddressModel, { name: 'address' })
  async getAddress(
    @Args('addressId', { type: () => Number })
    addressId: number,
  ) {
    return await this.addressesService.findOneById(addressId);
  }

  @ResolveField('country', (returns) => CountryModel)
  async getCountry(@Parent() address: AddressModel) {
    return this.countriesService.findOneByCountryCode(
      address.country.countryCode,
    );
  }

  @ResolveField('user', (returns) => UserModel)
  async getUser(@Parent() address: AddressModel) {
    return this.usersService.findOneById(address.user.userId);
  }
}
