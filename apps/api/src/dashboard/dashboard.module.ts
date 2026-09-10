import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_ENTITIES } from '../auth/auth.entities';
import { LEARNING_ENTITIES } from '../learning/learning.entities';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { GamificationModule } from '../gamification/gamification.module';
import { ProgressModule } from '../learning/progress.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([...AUTH_ENTITIES, ...LEARNING_ENTITIES]),
    AuthModule,
    CatalogModule,
    ProgressModule,
    GamificationModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
