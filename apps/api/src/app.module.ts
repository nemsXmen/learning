import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { ContentModule } from './content/content.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { ProgressModule } from './learning/progress.module';
import { EventsModule } from './events/events.module';
import { QuizModule } from './quiz/quiz.module';
import { GamificationModule } from './gamification/gamification.module';
import { BoostModule } from './boost/boost.module';
import { ZodValidationPipe } from './zod-validation.pipe';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    HealthModule,
    ContentModule,
    AuthModule,
    CatalogModule,
    ProgressModule,
    EventsModule,
    QuizModule,
    GamificationModule,
    BoostModule,
  ],
  // Global: a handler that forgets to validate its body is a bug waiting, and a
  // per-parameter pipe made that easy to forget.
  providers: [{ provide: APP_PIPE, useClass: ZodValidationPipe }],
})
export class AppModule {}
