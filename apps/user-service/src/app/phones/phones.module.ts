import { Module, forwardRef } from '@nestjs/common';
import { PhonesService } from './phones.service';
import { PhonesResolver } from './phones.resolver';
import { PhonesRepositoryModule } from '../repositories/phones/phones-repository.module';
import { CountriesModule } from '../countries/countries.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PhonesRepositoryModule,
    CountriesModule,
    forwardRef(() => UsersModule),
  ],
  providers: [PhonesService, PhonesResolver],
  exports: [PhonesService],
})
export class PhonesModule {}
