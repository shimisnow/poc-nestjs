import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalDocEntity } from '../../database/entities/legaldoc.entity';
import { LegalDocsRepository } from './legal-docs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LegalDocEntity])],
  providers: [LegalDocsRepository],
  exports: [LegalDocsRepository],
})
export class LegalDocsRepositoryModule {}
