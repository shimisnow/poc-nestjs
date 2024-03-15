import { Module, forwardRef } from '@nestjs/common';
import { LegalDocsService } from './legal-docs.service';
import { LegalDocsResolver } from './legal-docs.resolver';
import { LegalDocsRepositoryModule } from '../repositories/legal-docs/legal-docs-repository.module';
import { CountriesModule } from '../countries/countries.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    LegalDocsRepositoryModule,
    CountriesModule,
    forwardRef(() => UsersModule),
  ],
  providers: [LegalDocsService, LegalDocsResolver],
  exports: [LegalDocsService],
})
export class LegalDocsModule {}
