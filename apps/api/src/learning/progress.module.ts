import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import { LEARNING_ENTITIES } from './learning.entities';
import { QUIZ_ENTITIES } from '../quiz/quiz.entities';
import { BOOST_ENTITIES } from '../boost/boost.entities';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ChapterAccessService } from './chapter-access.service';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';
import { MasteryReplayService } from './mastery-replay.service';

@Module({
  imports: [TypeOrmModule.forFeature([...LEARNING_ENTITIES, ...QUIZ_ENTITIES, ...BOOST_ENTITIES]), ContentModule, AuthModule],
  controllers: [ProgressController, MasteryController],
  providers: [ProgressService, ChapterAccessService, MasteryService, MasteryReplayService],
  exports: [ProgressService, MasteryService, MasteryReplayService],
})
export class ProgressModule {}
