import { CountryEntity } from '../../database/entities/country.entity';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

export class CountriesRepositoryMock {
  async findOneByCode(code: CountryCodeEnum): Promise<CountryEntity | null> {
    return;
  }
}
