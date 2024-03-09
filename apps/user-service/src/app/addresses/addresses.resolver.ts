import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AddressModel } from './models/address.model';
import { AddressesService } from './addresses.service';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { CountryModel } from '../countries/models/country.model';
import { UserModel } from '../users/models/user.model';
import { GraphQLQueryFields } from '../utils/decorators/graphql-query-fields.decorator';

@Resolver(() => AddressModel)
export class AddressesResolver {
  constructor(
    private addressesService: AddressesService,
    private countriesService: CountriesService,
    private usersService: UsersService,
  ) {}

  @Query(() => AddressModel, { name: 'address' })
  async getAddress(
    @Args('addressId', { type: () => Number })
    addressId: number,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.addressesService.findOneById(addressId, queryFields);
  }

  @ResolveField('country', () => CountryModel)
  async getCountry(
    @Parent() address: AddressModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return this.countriesService.findOneByCode(
      address.country.code,
      queryFields,
    );
  }

  @ResolveField('user', () => UserModel)
  async getUser(
    @Parent() address: AddressModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    console.log(address);
    return this.usersService.findOneById(address.user.userId, queryFields);
  }
}
