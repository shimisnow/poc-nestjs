import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersRepositoryModule } from '../repositories/users/users-repository.module';
import { AddressesModule } from '../addresses/addresses.module';
import { PhonesModule } from '../phones/phones.module';
import { LegalDocsModule } from '../legal-docs/legal-docs.module';

@Module({
  imports: [
    UsersRepositoryModule,
    forwardRef(() => AddressesModule),
    PhonesModule,
    LegalDocsModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
