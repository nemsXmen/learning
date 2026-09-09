import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentService } from '../content/content.service';
import { SkillMasteryEntity, UserProgressEntity } from '../learning/learning.entities';
import {
  buildSkillGraph,
  buildTechnologyDetail,
  buildTechnologyList,
  type MasteryRow,
  type ProgressRow,
  type SkillGraphView,
  type TechnologyDetail,
  type TechnologySummary,
} from './catalog.view';

/**
 * Reads the content graph and the learner's state, and hands both to the pure
 * projection. Everything user-visible is scoped by the token subject; no user id
 * is ever accepted from a request (docs/rules.md #30).
 */
@Injectable()
export class CatalogService {
  constructor(
    private readonly content: ContentService,
    @InjectRepository(UserProgressEntity)
    private readonly progress: Repository<UserProgressEntity>,
    @InjectRepository(SkillMasteryEntity)
    private readonly mastery: Repository<SkillMasteryEntity>,
  ) {}

  async listTechnologies(userId: string): Promise<TechnologySummary[]> {
    const [progress, mastery] = await this.stateOf(userId);
    return buildTechnologyList(this.content.getGraph(), progress, mastery);
  }

  async getTechnology(userId: string, slug: string): Promise<TechnologyDetail> {
    const [progress, mastery] = await this.stateOf(userId);
    const detail = buildTechnologyDetail(this.content.getGraph(), slug, progress, mastery);
    if (!detail) throw this.notFound(slug);
    return detail;
  }

  async getSkillGraph(userId: string, slug: string): Promise<SkillGraphView> {
    const [, mastery] = await this.stateOf(userId);
    const view = buildSkillGraph(this.content.getGraph(), slug, mastery);
    if (!view) throw this.notFound(slug);
    return view;
  }

  /** An empty result is a new learner, not an error. */
  private async stateOf(userId: string): Promise<[ProgressRow[], MasteryRow[]]> {
    const [progress, mastery] = await Promise.all([
      this.progress.find({ where: { userId } }),
      this.mastery.find({ where: { userId } }),
    ]);
    return [
      progress.map((row) => ({
        chapterId: row.chapterId,
        status: row.status,
        progressPercent: row.progressPercent,
        lastAccessedAt: row.lastAccessedAt,
      })),
      mastery.map((row) => ({ skillId: row.skillId, masteryScore: row.masteryScore })),
    ];
  }

  private notFound(slug: string): NotFoundException {
    return new NotFoundException({
      code: 'TECHNOLOGY_NOT_FOUND',
      message: `Technologie introuvable : ${slug}`,
    });
  }
}
