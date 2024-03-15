import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneEntity } from '../../database/entities/phone.entity';
import { PhonesRepository } from './phones.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneEntity])],
  providers: [PhonesRepository],
  exports: [PhonesRepository],
})
export class PhonesRepositoryModule {}
