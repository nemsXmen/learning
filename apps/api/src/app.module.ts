import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { ContentModule } from './content/content.module';
import { AuthModule } from './auth/auth.module';

@Module({ imports: [DatabaseModule, RedisModule, HealthModule, ContentModule, AuthModule] })
export class AppModule {}
