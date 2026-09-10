import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { SlugParam } from '../content/slug.pipe';
import { createZodDto } from '../zod-validation.pipe';
import { ContentIdParam, UuidParam } from '../params.pipe';
import {
  QuizService,
  type AttemptResult,
  type AttemptSummary,
  type StartedAttempt,
} from './quiz.service';

/** An answer is an index list, a boolean or a string, depending on the type. */
const givenSchema = z.union([
  z.array(z.number().int().min(0)),
  z.boolean(),
  z.string().max(4000),
  z.null(),
]);

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(96),
        given: givenSchema,
        timeSpentMs: z.number().int().min(0).max(3_600_000).optional(),
      }),
    )
    .max(100),
});

class SubmitDto extends createZodDto(submitSchema) {}

@Controller()
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quiz: QuizService) {}

  /** Starts an attempt for the quiz attached to a chapter. */
  @Post('learn/:technology/:chapter/quiz/attempts')
  @HttpCode(HttpStatus.CREATED)
  start(
    @Req() request: AuthenticatedRequest,
    @Param('technology', SlugParam) technology: string,
    @Param('chapter', SlugParam) chapter: string,
  ): Promise<StartedAttempt> {
    const quiz = this.quiz.quizForChapter(technology, chapter);
    return this.quiz.start(request.user.sub, quiz.id);
  }

  @Post('quizzes/attempts/:attemptId/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @Req() request: AuthenticatedRequest,
    @Param('attemptId', UuidParam) attemptId: string,
    @Body() body: SubmitDto,
  ): Promise<AttemptResult> {
    return this.quiz.submit(request.user.sub, attemptId, body.answers);
  }

  @Get('me/quizzes/:quizId/attempts')
  history(
    @Req() request: AuthenticatedRequest,
    @Param('quizId', ContentIdParam) quizId: string,
  ): Promise<AttemptSummary[]> {
    return this.quiz.history(request.user.sub, quizId);
  }
}
