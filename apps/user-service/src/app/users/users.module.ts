import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersRepositoryModule } from '../repositories/users/users-repository.module';

@Module({
  imports: [UsersRepositoryModule],
  providers: [UsersService, UsersResolver],
})
export class UsersModule {}
