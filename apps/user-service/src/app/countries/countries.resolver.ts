import { Args, Query, Resolver } from '@nestjs/graphql';
import { CountryModel } from './models/country.model';
import { CountriesService } from './countries.service';
import { CountryCodeEnum } from '../database/enums/country-code.enum';

@Resolver(() => CountryModel)
export class CountriesResolver {
  constructor(private countriesService: CountriesService) {}

  @Query(() => CountryModel, { name: 'country' })
  async getCountry(
    @Args('code', { type: () => CountryCodeEnum })
    code: CountryCodeEnum,
  ) {
    return await this.countriesService.findOneByCode(code);
  }
}
