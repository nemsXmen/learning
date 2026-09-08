import { DataSource, type DataSourceOptions } from 'typeorm';
import { env } from '../config/env';

/**
 * `synchronize` is false in every environment, local included: a schema change is
 * a reviewed migration or it does not exist (docs/rules.md #17).
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres' as const,
  url: env.DATABASE_URL,
  synchronize: false,
  migrationsRun: false,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  logging: env.NODE_ENV === 'development' ? (['warn', 'error'] as const) : (['error'] as const),
};

export default new DataSource(dataSourceOptions);
