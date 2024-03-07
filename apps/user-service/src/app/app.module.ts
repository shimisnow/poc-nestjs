import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { entities } from './database/entities';
import { CountriesModule } from './countries/countries.module';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { PhonesModule } from './phones/phones.module';
import { LegalDocsModule } from './legal-docs/legal-docs.module';

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
  ],
})
export class AppModule {}
