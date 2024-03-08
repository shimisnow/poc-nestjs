import { Injectable } from '@nestjs/common';
import { CountryCodeEnum } from '../database/enums/country-code.enum';
import { CountriesRepository } from '../repositories/countries/countries.repository';
import { CountryEntity } from '../database/entities/country.entity';

@Injectable()
export class CountriesService {
  constructor(private countriesRepository: CountriesRepository) {}

  async findOneByCode(
    code: CountryCodeEnum,
    queryFields: string[] = null,
  ): Promise<CountryEntity | null> {
    return await this.countriesRepository.findOneByCode(
      code,
      queryFields as [keyof CountryEntity],
    );
  }
}
