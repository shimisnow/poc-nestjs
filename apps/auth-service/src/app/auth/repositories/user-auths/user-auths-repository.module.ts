import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthEntity } from '../../../database/entities/user-auth.entity';
import { UserAuthsRepository } from './user-auths.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthEntity])],
  providers: [UserAuthsRepository],
  exports: [UserAuthsRepository],
})
export class UserAuthsRepositoryModule {}
