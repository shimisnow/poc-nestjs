import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryEntity } from '../../database/entities/country.entity';
import { Repository } from 'typeorm';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

@Injectable()
export class CountriesRepository {
  constructor(
    @InjectRepository(CountryEntity)
    private repository: Repository<CountryEntity>,
  ) {}

  async findOneByCountryCode(
    countryCode: CountryCodeEnum,
  ): Promise<CountryEntity | null> {
    return await this.repository.findOneBy({
      countryCode,
    });
  }
}
