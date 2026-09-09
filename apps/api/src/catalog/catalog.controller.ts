import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt.guard';
import { SlugParam } from '../content/slug.pipe';
import { CatalogService } from './catalog.service';
import type { SkillGraphView, TechnologyDetail, TechnologySummary } from './catalog.view';

@Controller('learn/technologies')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest): Promise<TechnologySummary[]> {
    return this.catalog.listTechnologies(request.user.sub);
  }

  @Get(':slug')
  detail(
    @Req() request: AuthenticatedRequest,
    @Param('slug', SlugParam) slug: string,
  ): Promise<TechnologyDetail> {
    return this.catalog.getTechnology(request.user.sub, slug);
  }

  @Get(':slug/skills')
  skills(
    @Req() request: AuthenticatedRequest,
    @Param('slug', SlugParam) slug: string,
  ): Promise<SkillGraphView> {
    return this.catalog.getSkillGraph(request.user.sub, slug);
  }
}
