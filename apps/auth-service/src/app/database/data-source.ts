import { DataSource } from 'typeorm';
import path from 'path';
import { entities } from './entities';

export const AuthServiceDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_AUTH_HOST,
  port: parseInt(process.env.DATABASE_AUTH_PORT),
  username: process.env.DATABASE_AUTH_USERNAME,
  password: process.env.DATABASE_AUTH_PASSWORD,
  database: process.env.DATABASE_AUTH_DBNAME,
  logging: true,
  entities,
  migrations: [path.resolve(__dirname, 'migrations/*.ts')],
});
