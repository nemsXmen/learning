import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { DashboardService, type DashboardView } from './dashboard.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  /** One request for the whole screen, not six. */
  @Get('dashboard')
  get(@Req() request: AuthenticatedRequest): Promise<DashboardView> {
    return this.dashboard.build(request.user.sub);
  }
}
