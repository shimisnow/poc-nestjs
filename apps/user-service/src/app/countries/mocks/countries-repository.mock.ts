import { CountryEntity } from '../../database/entities/country.entity';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

/**
 * Mocks the countries repository to use in tests
 */
export class CountriesRepositoryMock {
  async findOneByCode(code: CountryCodeEnum): Promise<CountryEntity | null> {
    return;
  }
}
