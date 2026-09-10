import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { bundledGraph, type ChapterNode } from '@app/content';
import { prerequisiteSkillsOf, resolveLock } from '../catalog/catalog.view';
import { SkillMasteryEntity } from './learning.entities';

/**
 * The one place a chapter's availability is decided.
 *
 * It reads the bundled graph directly rather than ContentService, so any module
 * can depend on it without a cycle — serving content, recording progress and
 * grading all need the same answer, and it must be the same answer.
 */
@Injectable()
export class ChapterAccessService {
  constructor(
    @InjectRepository(SkillMasteryEntity)
    private readonly mastery: Repository<SkillMasteryEntity>,
  ) {}

  /** Throws 404 for an unknown chapter, 403 with the reason for a locked one. */
  async requireUnlocked(userId: string, chapterId: string): Promise<ChapterNode> {
    const chapter = bundledGraph.chapters.find((item) => item.id === chapterId);
    if (!chapter) {
      throw new NotFoundException({
        code: 'CHAPTER_NOT_FOUND',
        message: `Chapitre introuvable : ${chapterId}`,
      });
    }

    const prerequisites = prerequisiteSkillsOf(bundledGraph, chapterId);
    if (prerequisites.length === 0) return chapter;

    const rows = await this.mastery.find({ where: { userId } });
    const scores = new Map(rows.map((row) => [row.skillId, row.masteryScore]));
    const names = new Map(bundledGraph.skills.map((skill) => [skill.id, skill.name]));
    const lock = resolveLock(prerequisites, scores, names);

    if (lock.locked) {
      // The reason travels with the refusal: the screen explains, it does not guess.
      throw new ForbiddenException({
        code: 'CHAPTER_LOCKED',
        message: 'Ce chapitre est encore verrouillé.',
        lockReason: lock.lockReason,
      });
    }

    return chapter;
  }

  /** Same decision, addressed by slug — what a URL carries. */
  async requireUnlockedBySlug(
    userId: string,
    technologySlug: string,
    chapterSlug: string,
  ): Promise<ChapterNode> {
    const chapter = bundledGraph.chapters.find(
      (item) => item.technology === technologySlug && item.slug === chapterSlug,
    );
    if (!chapter) {
      throw new NotFoundException({
        code: 'CONTENT_NOT_FOUND',
        message: `Chapitre introuvable : ${technologySlug}/${chapterSlug}`,
      });
    }
    return this.requireUnlocked(userId, chapter.id);
  }
}
