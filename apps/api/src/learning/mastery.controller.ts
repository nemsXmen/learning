import { Controller, DefaultValuePipe, Get, ParseIntPipe, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { SlugParam } from '../content/slug.pipe';
import {
  MasteryService,
  type TechnologyMastery,
  type WeakSkillView,
} from './mastery.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MasteryController {
  constructor(private readonly mastery: MasteryService) {}

  @Get('mastery/technologies/:slug')
  byTechnology(
    @Req() request: AuthenticatedRequest,
    @Param('slug', SlugParam) slug: string,
  ): Promise<TechnologyMastery> {
    return this.mastery.byTechnology(request.user.sub, slug);
  }

  /** The dashboard boost card: weak skills, ordered, each with its reason. */
  @Get('mastery/weak')
  weak(
    @Req() request: AuthenticatedRequest,
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ): Promise<WeakSkillView[]> {
    return this.mastery.weakSkills(request.user.sub, Math.min(20, Math.max(1, limit)));
  }

  @Get('reviews/due')
  due(@Req() request: AuthenticatedRequest): Promise<WeakSkillView[]> {
    return this.mastery.dueReviews(request.user.sub);
  }
}
