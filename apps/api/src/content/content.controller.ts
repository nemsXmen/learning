import { Controller, Get, Param } from '@nestjs/common';
import { ContentService, type ChapterPayload, type QuizPayload } from './content.service';
import { SlugParam } from './slug.pipe';

/**
 * Read-only content endpoints. Slugs are validated at the boundary and looked up
 * in the in-memory graph — no request path ever reaches the filesystem.
 */
@Controller('content/chapters')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get(':technologySlug/:chapterSlug')
  getChapter(
    @Param('technologySlug', SlugParam) technologySlug: string,
    @Param('chapterSlug', SlugParam) chapterSlug: string,
  ): Promise<ChapterPayload> {
    return this.content.getChapter(technologySlug, chapterSlug);
  }

  @Get(':technologySlug/:chapterSlug/quiz')
  getQuiz(
    @Param('technologySlug', SlugParam) technologySlug: string,
    @Param('chapterSlug', SlugParam) chapterSlug: string,
  ): Promise<QuizPayload> {
    return this.content.getQuiz(technologySlug, chapterSlug);
  }
}
