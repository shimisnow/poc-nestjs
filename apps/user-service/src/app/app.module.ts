import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { entities } from './database/entities';
import { CountriesModule } from './countries/countries.module';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { PhonesModule } from './phones/phones.module';
import { LegalDocsModule } from './legal-docs/legal-docs.module';
import { SocialMediasModule } from './social-medias/social-medias.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_USER_HOST,
      port: parseInt(process.env.DATABASE_USER_PORT),
      username: process.env.DATABASE_USER_USERNAME,
      password: process.env.DATABASE_USER_PASSWORD,
      database: process.env.DATABASE_USER_DBNAME,
      entities,
      synchronize: true,
      logging: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: 'api',
      autoSchemaFile: true,
    }),
    CountriesModule,
    UsersModule,
    AddressesModule,
    PhonesModule,
    LegalDocsModule,
    SocialMediasModule,
  ],
})
export class AppModule {}
