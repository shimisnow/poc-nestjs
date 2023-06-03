import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UserAuthEntity } from '@shared/database/entities/user-auth.entity';

console.log(process.env.DATABASE_AUTH_HOST);
console.log(parseInt(process.env.DATABASE_AUTH_PORT));
console.log(process.env.DATABASE_AUTH_USERNAME);
console.log(process.env.DATABASE_AUTH_PASSWORD);
console.log(process.env.DATABASE_AUTH_DBNAME);

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
  ],
})
export class AppModule {}
