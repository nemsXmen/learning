import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { UuidParam } from '../params.pipe';
import { createZodDto } from '../zod-validation.pipe';
import {
  BoostService,
  type BoostCompletion,
  type BoostPreview,
  type BoostSessionView,
  type BoostStepResult,
} from './boost.service';

const createSchema = z.object({ availableMinutes: z.number().int() });
const answerSchema = z.object({
  given: z.union([z.array(z.number().int().min(0)), z.boolean(), z.string().max(4000), z.null()]),
});

class CreateBoostDto extends createZodDto(createSchema) {}
class AnswerStepDto extends createZodDto(answerSchema) {}

@Controller('me/boost')
@UseGuards(JwtAuthGuard)
export class BoostController {
  constructor(private readonly boost: BoostService) {}

  /** 200 either way: "nothing to reinforce" is an answer, not a failure. */
  @Get('preview')
  preview(@Req() request: AuthenticatedRequest): Promise<BoostPreview> {
    return this.boost.preview(request.user.sub);
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateBoostDto,
  ): Promise<BoostSessionView> {
    return this.boost.create(request.user.sub, body.availableMinutes);
  }

  @Get('sessions/:id')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', UuidParam) id: string,
  ): Promise<BoostSessionView> {
    return this.boost.get(request.user.sub, id);
  }

  @Post('sessions/:id/steps/:index')
  @HttpCode(HttpStatus.OK)
  answer(
    @Req() request: AuthenticatedRequest,
    @Param('id', UuidParam) id: string,
    @Param('index', ParseIntPipe) index: number,
    @Body() body: AnswerStepDto,
  ): Promise<BoostStepResult> {
    return this.boost.answerStep(request.user.sub, id, index, body.given);
  }

  @Post('sessions/:id/complete')
  @HttpCode(HttpStatus.OK)
  complete(
    @Req() request: AuthenticatedRequest,
    @Param('id', UuidParam) id: string,
  ): Promise<BoostCompletion> {
    return this.boost.complete(request.user.sub, id);
  }
}
