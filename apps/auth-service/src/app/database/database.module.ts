import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthServiceDataSource } from './data-source';

@Module({
  imports: [TypeOrmModule.forRoot(AuthServiceDataSource.options)],
})
export class DatabaseModule {}
