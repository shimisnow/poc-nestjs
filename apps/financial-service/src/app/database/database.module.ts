import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialServiceDataSource } from './data-source';

@Module({
  imports: [TypeOrmModule.forRoot(FinancialServiceDataSource.options)],
})
export class DatabaseModule {}
