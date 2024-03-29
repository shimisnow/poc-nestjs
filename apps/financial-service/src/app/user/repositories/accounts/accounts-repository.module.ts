import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../../../database/entities/account.entity';
import { AccountsRepository } from './accounts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity])],
  providers: [AccountsRepository],
  exports: [AccountsRepository],
})
export class AccountsRepositoryModule {}
