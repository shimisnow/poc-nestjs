import { Module, forwardRef } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesResolver } from './addresses.resolver';
import { AddressesRepositoryModule } from '../repositories/addresses/addresses-repository.module';
import { CountriesModule } from '../countries/countries.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AddressesRepositoryModule,
    CountriesModule,
    forwardRef(() => UsersModule),
  ],
  providers: [AddressesService, AddressesResolver],
  exports: [AddressesService],
})
export class AddressesModule {}
