import { DataSource } from 'typeorm';
import path from 'path';
import { entities } from './entities';

export const FinancialServiceDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_FINANCIAL_HOST,
  port: parseInt(process.env.DATABASE_FINANCIAL_PORT),
  username: process.env.DATABASE_FINANCIAL_USERNAME,
  password: process.env.DATABASE_FINANCIAL_PASSWORD,
  database: process.env.DATABASE_FINANCIAL_DBNAME,
  logging: true,
  entities,
  migrations: [path.resolve(__dirname, 'migrations/*.ts')],
});
