import { Injectable } from '@nestjs/common';
import { CountryCodeEnum } from '../database/enums/country-code.enum';
import { CountriesRepository } from '../repositories/countries/countries.repository';

@Injectable()
export class CountriesService {
  constructor(private countriesRepository: CountriesRepository) {}

  async findOneByCountryCode(countryCode: CountryCodeEnum) {
    return await this.countriesRepository.findOneByCountryCode(countryCode);
  }
}
