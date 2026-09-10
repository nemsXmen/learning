import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ChapterAccessService } from '../learning/chapter-access.service';
import { SkillMasteryEntity } from '../learning/learning.entities';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [TypeOrmModule.forFeature([SkillMasteryEntity]), AuthModule],
  controllers: [ContentController],
  providers: [ContentService, ChapterAccessService],
  exports: [ContentService, ChapterAccessService],
})
export class ContentModule {}
