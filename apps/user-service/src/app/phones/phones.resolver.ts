import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PhoneModel } from './models/phone.model';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { PhonesService } from './phones.service';
import { CountryModel } from '../countries/models/country.model';
import { UserModel } from '../users/models/user.model';

@Resolver(() => PhoneModel)
export class PhonesResolver {
  constructor(
    private phonesService: PhonesService,
    private countriesService: CountriesService,
    private usersService: UsersService,
  ) {}

  @Query(() => PhoneModel, { name: 'phone' })
  async getPhone(
    @Args('phoneId', { type: () => Number })
    phoneId: number,
  ) {
    return await this.phonesService.findOneById(phoneId);
  }

  @ResolveField('country', () => CountryModel)
  async getCountry(@Parent() phone: PhoneModel) {
    return this.countriesService.findOneByCode(phone.country.code);
  }

  @ResolveField('user', () => UserModel)
  async getUser(@Parent() phone: PhoneModel) {
    return this.usersService.findOneById(phone.user.userId);
  }
}
