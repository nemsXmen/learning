import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { ChapterAccessService } from '../learning/chapter-access.service';
import { ContentService, type ChapterPayload, type QuizPayload } from './content.service';
import { SlugParam } from './slug.pipe';

/**
 * Chapter content, for signed-in learners only.
 *
 * The lock is enforced here, not just displayed by the catalogue: a locked
 * chapter must not be readable by typing its URL
 * (features/06-chapter-reader/REQUIREMENTS.md).
 */
@Controller('content/chapters')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly content: ContentService,
    private readonly access: ChapterAccessService,
  ) {}

  @Get(':technologySlug/:chapterSlug')
  async getChapter(
    @Req() request: AuthenticatedRequest,
    @Param('technologySlug', SlugParam) technologySlug: string,
    @Param('chapterSlug', SlugParam) chapterSlug: string,
  ): Promise<ChapterPayload> {
    await this.access.requireUnlockedBySlug(request.user.sub, technologySlug, chapterSlug);
    return this.content.getChapter(technologySlug, chapterSlug);
  }

  @Get(':technologySlug/:chapterSlug/quiz')
  async getQuiz(
    @Req() request: AuthenticatedRequest,
    @Param('technologySlug', SlugParam) technologySlug: string,
    @Param('chapterSlug', SlugParam) chapterSlug: string,
  ): Promise<QuizPayload> {
    await this.access.requireUnlockedBySlug(request.user.sub, technologySlug, chapterSlug);
    return this.content.getQuiz(technologySlug, chapterSlug);
  }
}
