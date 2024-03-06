import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesResolver } from './addresses.resolver';
import { AddressesRepositoryModule } from '../repositories/addresses/addresses-repository.module';
import { CountriesModule } from '../countries/countries.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AddressesRepositoryModule, CountriesModule, UsersModule],
  providers: [AddressesService, AddressesResolver],
})
export class AddressesModule {}
