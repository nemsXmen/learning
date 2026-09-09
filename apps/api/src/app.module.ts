import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { ContentModule } from './content/content.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({ imports: [DatabaseModule, RedisModule, HealthModule, ContentModule, AuthModule, CatalogModule] })
export class AppModule {}
