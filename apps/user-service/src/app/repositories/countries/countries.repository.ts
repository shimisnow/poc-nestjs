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
   * @param {[keyof CountryEntity]} queryFields Entity fields to be retrieved
   * @returns {CountryEntity | null} Found entity or null
   */
  async findOneByCode(
    code: CountryCodeEnum,
    queryFields: [keyof CountryEntity] = null,
  ): Promise<CountryEntity | null> {
    if (queryFields === null) {
      return await this.repository.findOneBy({
        code,
      });
    }

    const result = await this.repository.find({
      select: queryFields,
      where: {
        code,
      },
    });

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }
}
