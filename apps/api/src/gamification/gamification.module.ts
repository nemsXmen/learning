import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_ENTITIES } from '../auth/auth.entities';
import { AuthModule } from '../auth/auth.module';
import { LEARNING_ENTITIES } from '../learning/learning.entities';
import { AchievementsService } from './achievements.service';
import { GAMIFICATION_ENTITIES } from './gamification.entities';
import { GamificationController } from './gamification.controller';
import { StreakService } from './streak.service';
import { XpService } from './xp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([...GAMIFICATION_ENTITIES, ...LEARNING_ENTITIES, ...AUTH_ENTITIES]),
    AuthModule,
  ],
  controllers: [GamificationController],
  providers: [XpService, StreakService, AchievementsService],
  exports: [XpService, StreakService, AchievementsService],
})
export class GamificationModule {}
