import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UserAuthEntity } from '@shared/database/authentication/entities/user-auth.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_AUTH_HOST,
      port: parseInt(process.env.DATABASE_AUTH_PORT),
      username: process.env.DATABASE_AUTH_USERNAME,
      password: process.env.DATABASE_AUTH_PASSWORD,
      database: process.env.DATABASE_AUTH_DBNAME,
      entities: [UserAuthEntity],
    }),
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AppModule {}
