import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from '../../database/entities/country.entity';
import { CountriesRepository } from './countries.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity])],
  providers: [CountriesRepository],
  exports: [CountriesRepository],
})
export class CountriesRepositoryModule {}
