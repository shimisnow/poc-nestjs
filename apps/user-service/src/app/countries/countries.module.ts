import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesRepositoryModule } from '../repositories/countries/countries-repository.module';
import { CountriesResolver } from './countries.resolver';

@Module({
  imports: [CountriesRepositoryModule],
  providers: [CountriesService, CountriesResolver],
  exports: [CountriesService],
})
export class CountriesModule {}
