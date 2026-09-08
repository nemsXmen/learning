import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      // A slow database must not kill the boot. A database that dies afterwards is
      // reported by GET /health rather than crashing the process.
      retryAttempts: 5,
      retryDelay: 2000,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
