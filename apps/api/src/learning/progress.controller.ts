import { Body, Controller, Get, HttpCode, HttpStatus, Param, Put, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { SlugParam } from '../content/slug.pipe';
import { ZodValidationPipe } from '../zod-validation.pipe';
import {
  ProgressService,
  type CompletionResult,
  type ProgressView,
  type TechnologyProgress,
} from './progress.service';

const reportSchema = z.object({
  progressPercent: z.number().int().min(0).max(100).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

const chapterIdSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

@Controller('me/progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Put('chapters/:chapterId')
  report(
    @Req() request: AuthenticatedRequest,
    @Param('chapterId', new ZodValidationPipe(chapterIdSchema)) chapterId: string,
    @Body(new ZodValidationPipe(reportSchema)) body: z.infer<typeof reportSchema>,
  ): Promise<ProgressView> {
    // The user comes from the token, never the body (docs/rules.md #30).
    return this.progress.report(request.user.sub, chapterId, body);
  }

  @Post('chapters/:chapterId/complete')
  @HttpCode(HttpStatus.OK)
  complete(
    @Req() request: AuthenticatedRequest,
    @Param('chapterId', new ZodValidationPipe(chapterIdSchema)) chapterId: string,
  ): Promise<CompletionResult> {
    return this.progress.complete(request.user.sub, chapterId);
  }

  @Get('chapters/:chapterId')
  getChapter(
    @Req() request: AuthenticatedRequest,
    @Param('chapterId', new ZodValidationPipe(chapterIdSchema)) chapterId: string,
  ): Promise<ProgressView> {
    return this.progress.getChapter(request.user.sub, chapterId);
  }

  @Get('technologies/:slug')
  getTechnology(
    @Req() request: AuthenticatedRequest,
    @Param('slug', SlugParam) slug: string,
  ): Promise<TechnologyProgress> {
    return this.progress.getTechnology(request.user.sub, slug);
  }
}
