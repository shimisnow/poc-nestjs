import { Args, Query, Resolver } from '@nestjs/graphql';
import { Country } from './models/country.model';
import { CountriesService } from './countries.service';
import { CountryCodeEnum } from '../database/enums/country-code.enum';

@Resolver((of) => Country)
export class CountriesResolver {
  constructor(private countriesService: CountriesService) {}

  @Query((returns) => Country, { name: 'country' })
  async getCountry(
    @Args('countryCode', { type: () => CountryCodeEnum })
    countryCode: CountryCodeEnum,
  ) {
    return await this.countriesService.findOneByCountryCode(countryCode);
  }
}
