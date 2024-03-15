import { Module, forwardRef } from '@nestjs/common';
import { SocialMediasService } from './social-medias.service';
import { SocialMediasResolver } from './social-medias.resolver';
import { SocialMediasRepositoryModule } from '../repositories/social-medias/social-medias-repository.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SocialMediasRepositoryModule, forwardRef(() => UsersModule)],
  providers: [SocialMediasService, SocialMediasResolver],
  exports: [SocialMediasService],
})
export class SocialMediasModule {}
