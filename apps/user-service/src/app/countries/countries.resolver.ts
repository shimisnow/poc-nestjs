import { Args, Query, Resolver } from '@nestjs/graphql';
import { CountryModel } from './models/country.model';
import { CountriesService } from './countries.service';
import { CountryCodeEnum } from '../database/enums/country-code.enum';

@Resolver((of) => CountryModel)
export class CountriesResolver {
  constructor(private countriesService: CountriesService) {}

  @Query((returns) => CountryModel, { name: 'country' })
  async getCountry(
    @Args('countryCode', { type: () => CountryCodeEnum })
    countryCode: CountryCodeEnum,
  ) {
    return await this.countriesService.findOneByCountryCode(countryCode);
  }
}
