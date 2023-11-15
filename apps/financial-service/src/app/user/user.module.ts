import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AccountsRepositoryModule } from './repositories/accounts/accounts-repository.module';

@Module({
  imports: [AccountsRepositoryModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
