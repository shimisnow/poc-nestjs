import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryEntity } from '../../database/entities/country.entity';
import { Repository } from 'typeorm';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

/**
 * Provides access to the database country entity
 */
@Injectable()
export class CountriesRepository {
  /** @ignore */
  constructor(
    @InjectRepository(CountryEntity)
    private repository: Repository<CountryEntity>,
  ) {}

  /**
   * Finds a country by its unique code
   *
   * @param {CountryCodeEnum} code Unique identifier
   * @returns {CountryEntity | null} Found entity or null
   */
  async findOneByCode(code: CountryCodeEnum): Promise<CountryEntity | null> {
    return await this.repository.findOneBy({
      code,
    });
  }
}
