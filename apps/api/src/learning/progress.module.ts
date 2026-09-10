import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import { LEARNING_ENTITIES } from './learning.entities';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ChapterAccessService } from './chapter-access.service';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';

@Module({
  imports: [TypeOrmModule.forFeature(LEARNING_ENTITIES), ContentModule, AuthModule],
  controllers: [ProgressController, MasteryController],
  providers: [ProgressService, ChapterAccessService, MasteryService],
  exports: [ProgressService, MasteryService],
})
export class ProgressModule {}
