import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { recommendNextAction, type ChapterRef, type Recommendation, type SkillGraph } from '@app/learning-engine';
import { bundledGraph } from '@app/content';
import { UserEntity } from '../auth/auth.entities';
import { CatalogService } from '../catalog/catalog.service';
import { MasteryService } from '../learning/mastery.service';
import { UserProgressEntity } from '../learning/learning.entities';
import { StreakService, type StreakView } from '../gamification/streak.service';
import { XpService, type XpSummary } from '../gamification/xp.service';

export interface DashboardAction {
  type: string;
  label: string;
  href: string;
  estimatedMinutes: number;
  reason: string;
}

export interface DashboardView {
  user: { displayName: string; dailyMinutesTarget: number; emailVerified: boolean };
  xp: XpSummary | null;
  streak: StreakView | null;
  overallProgressPercent: number;
  continue: { technologySlug: string; chapterSlug: string; title: string; progressPercent: number } | null;
  nextBestAction: DashboardAction;
  attention: Array<{ skillId: string; name: string; mastery: number; reason: string }>;
  todayPlan: Array<{ kind: string; label: string; estimatedMinutes: number; href: string }>;
  technologies: Array<{ slug: string; name: string; progressPercent: number }>;
  /** Panels whose source failed. The page renders without them (CDC §85). */
  degraded: string[];
}

/**
 * One round trip for the whole screen. A panel whose source fails comes back
 * null with its name in `degraded`: the dashboard still renders, and the primary
 * action never disappears (features/13-dashboard-next-best-action/CONTRACT.md).
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly catalog: CatalogService,
    private readonly mastery: MasteryService,
    private readonly xp: XpService,
    private readonly streaks: StreakService,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(UserProgressEntity)
    private readonly progress: Repository<UserProgressEntity>,
  ) {}

  async build(userId: string, now = new Date()): Promise<DashboardView> {
    const degraded: string[] = [];
    const soften = async <T>(name: string, work: Promise<T>): Promise<T | null> => {
      try {
        return await work;
      } catch (error) {
        this.logger.warn(`Panneau « ${name} » indisponible : ${(error as Error).message}`);
        degraded.push(name);
        return null;
      }
    };

    const user = await this.users.findOne({ where: { id: userId } });
    const dailyMinutesTarget = user?.dailyMinutesTarget ?? 30;

    const [technologies, snapshots, progressRows, weak, xp, streak] = await Promise.all([
      this.catalog.listTechnologies(userId),
      this.mastery.snapshotsFor(userId),
      this.progress.find({ where: { userId } }),
      soften('attention', this.mastery.weakSkills(userId, 3, now)),
      soften('xp', this.xp.summary(userId, now)),
      soften('streak', this.streaks.view(userId, now)),
    ]);

    const recommendation = recommendNextAction({
      skills: snapshots,
      graph: this.skillGraph(),
      chapters: this.chapterRefs(progressRows),
      availableMinutes: dailyMinutesTarget,
      now,
    });

    const resume = await this.resumable(userId, technologies.map((item) => item.slug));

    return {
      user: {
        displayName: user?.displayName ?? '',
        dailyMinutesTarget,
        emailVerified: user?.emailVerifiedAt !== null,
      },
      xp,
      streak,
      overallProgressPercent:
        technologies.length === 0
          ? 0
          : Math.round(
              technologies.reduce((total, item) => total + item.progressPercent, 0) /
                technologies.length,
            ),
      continue: resume,
      nextBestAction: this.toAction(recommendation, resume),
      attention: (weak ?? []).map((skill) => ({
        skillId: skill.skillId,
        name: skill.name,
        mastery: skill.mastery,
        reason: skill.reason,
      })),
      todayPlan: this.buildPlan(recommendation, weak ?? [], dailyMinutesTarget),
      technologies: technologies.map((item) => ({
        slug: item.slug,
        name: item.name,
        progressPercent: item.progressPercent,
      })),
      degraded,
    };
  }

  /** The most advanced technology's resume point, if any. */
  private async resumable(
    userId: string,
    slugs: string[],
  ): Promise<DashboardView['continue']> {
    for (const slug of slugs) {
      const detail = await this.catalog.getTechnology(userId, slug);
      if (!detail.continue) continue;

      const chapter = detail.modules
        .flatMap((module) => module.chapters)
        .find((item) => item.slug === detail.continue?.chapterSlug);

      return {
        technologySlug: slug,
        chapterSlug: detail.continue.chapterSlug,
        title: chapter?.title ?? detail.continue.chapterSlug,
        progressPercent: detail.continue.progressPercent,
      };
    }
    return null;
  }

  /**
   * The engine's recommendation, turned into something a screen can render.
   * Its reason travels verbatim — the dashboard explains, it does not invent.
   */
  private toAction(
    recommendation: Recommendation,
    resume: DashboardView['continue'],
  ): DashboardAction {
    const names = new Map(bundledGraph.skills.map((skill) => [skill.id, skill.name]));

    switch (recommendation.type) {
      case 'BOOST':
      case 'REVIEW':
        return {
          type: recommendation.type,
          label: `Renforcer ${names.get(recommendation.ref ?? '') ?? 'une compétence'}`,
          href: '/boost',
          estimatedMinutes: recommendation.estimatedMinutes,
          reason: recommendation.reason,
        };

      case 'CAUGHT_UP':
        return {
          type: 'CAUGHT_UP',
          label: 'Explorer les parcours',
          href: '/learn',
          estimatedMinutes: 0,
          reason: recommendation.reason,
        };

      default: {
        const chapter = bundledGraph.chapters.find((item) => item.id === recommendation.ref);
        return {
          type: recommendation.type,
          label: chapter ? `Continuer : ${chapter.title}` : 'Continuer ton parcours',
          href: chapter
            ? `/learn/${chapter.technology}/${chapter.slug}`
            : resume
              ? `/learn/${resume.technologySlug}/${resume.chapterSlug}`
              : '/learn',
          estimatedMinutes: recommendation.estimatedMinutes,
          reason: recommendation.reason,
        };
      }
    }
  }

  /** Fits the day's target: a plan that overruns is a plan nobody follows. */
  private buildPlan(
    recommendation: Recommendation,
    weak: Array<{ skillId: string; name: string; estimatedMinutes: number }>,
    dailyMinutesTarget: number,
  ): DashboardView['todayPlan'] {
    const plan: DashboardView['todayPlan'] = [];
    let spent = 0;

    if (recommendation.type !== 'CAUGHT_UP' && recommendation.estimatedMinutes <= dailyMinutesTarget) {
      plan.push({
        kind: recommendation.type,
        label: this.toAction(recommendation, null).label,
        estimatedMinutes: recommendation.estimatedMinutes,
        href: this.toAction(recommendation, null).href,
      });
      spent += recommendation.estimatedMinutes;
    }

    for (const skill of weak) {
      if (spent + skill.estimatedMinutes > dailyMinutesTarget) break;
      if (plan.some((item) => item.label.includes(skill.name))) continue;

      plan.push({
        kind: 'REVIEW',
        label: `Réviser ${skill.name}`,
        estimatedMinutes: skill.estimatedMinutes,
        href: '/boost',
      });
      spent += skill.estimatedMinutes;
    }

    return plan;
  }

  private skillGraph(): SkillGraph {
    return {
      requires: Object.fromEntries(bundledGraph.skills.map((skill) => [skill.id, skill.requires])),
    };
  }

  /** The engine needs the learner's status per chapter to recommend the next one. */
  private chapterRefs(progressRows: UserProgressEntity[]): ChapterRef[] {
    const byId = new Map(bundledGraph.chapters.map((chapter) => [chapter.id, chapter]));
    const statusOf = new Map(progressRows.map((row) => [row.chapterId, row.status]));

    return bundledGraph.chapters.map((chapter) => ({
      chapterId: chapter.id,
      technologySlug: chapter.technology,
      estimatedMinutes: chapter.estimatedMinutes,
      skillIds: chapter.skills,
      prerequisiteSkillIds: chapter.prerequisites.flatMap(
        (prerequisiteId) => byId.get(prerequisiteId)?.skills ?? [],
      ),
      status: statusOf.get(chapter.id) ?? 'NOT_STARTED',
    }));
  }
}
