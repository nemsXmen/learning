import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import { QuizController } from './quiz.controller';
import { QUIZ_ENTITIES } from './quiz.entities';
import { QuizService } from './quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature(QUIZ_ENTITIES), ContentModule, AuthModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
