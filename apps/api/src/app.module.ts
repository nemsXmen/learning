import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { ContentModule } from './content/content.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { ProgressModule } from './learning/progress.module';
import { EventsModule } from './events/events.module';

@Module({ imports: [DatabaseModule, RedisModule, HealthModule, ContentModule, AuthModule, CatalogModule, ProgressModule, EventsModule] })
export class AppModule {}
