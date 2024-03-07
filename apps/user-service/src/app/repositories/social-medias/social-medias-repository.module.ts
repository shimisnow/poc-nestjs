import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialMediaEntity } from '../../database/entities/social-media.entity';
import { SocialMediasRepository } from './social-medias.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SocialMediaEntity])],
  providers: [SocialMediasRepository],
  exports: [SocialMediasRepository],
})
export class SocialMediasRepositoryModule {}
