import { CountryEntity } from '../../../database/entities/country.entity';
import { CountryCodeEnum } from '../../../database/enums/country-code.enum';
import { CountryBraEntityMock, CountryUsaEntityMock } from '.';

/**
 * Mocks the countries repository to use in tests
 */
export class CountriesRepositoryMock {
  countries = [CountryBraEntityMock, CountryUsaEntityMock];

  async findOneByCode(
    code: CountryCodeEnum,
    queryFields: [keyof CountryEntity] = null,
  ): Promise<CountryEntity | null> {
    return this.countries.find((value) => value.code == code);
  }
}
