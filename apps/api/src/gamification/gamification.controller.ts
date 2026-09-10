import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { AchievementsService, type AchievementView } from './achievements.service';
import { StreakService, type StreakView } from './streak.service';
import { XpService, type XpEntry, type XpSummary } from './xp.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(
    private readonly xp: XpService,
    private readonly streaks: StreakService,
    private readonly achievements: AchievementsService,
  ) {}

  @Get('xp')
  summary(@Req() request: AuthenticatedRequest): Promise<XpSummary> {
    return this.xp.summary(request.user.sub);
  }

  @Get('xp/history')
  history(
    @Req() request: AuthenticatedRequest,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<XpEntry[]> {
    return this.xp.history(request.user.sub, limit);
  }

  @Get('streak')
  streak(@Req() request: AuthenticatedRequest): Promise<StreakView> {
    return this.streaks.view(request.user.sub);
  }

  @Get('achievements')
  list(@Req() request: AuthenticatedRequest): Promise<AchievementView[]> {
    return this.achievements.list(request.user.sub);
  }
}
