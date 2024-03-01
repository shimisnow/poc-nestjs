import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthsRepositoryModule } from './repositories/user-auths/user-auths-repository.module';

@Module({
  imports: [UserAuthsRepositoryModule],
  controllers: [AuthController],
  providers: [AuthService, Logger],
  exports: [AuthService],
})
export class AuthModule {}
