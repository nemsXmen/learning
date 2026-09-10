import { Injectable, Logger } from '@nestjs/common';
import type { ProgressStatus } from '@app/types';

/**
 * A typed, in-process event bus.
 *
 * Deliberately hand-rolled rather than pulling @nestjs/event-emitter: the only
 * feature needed is emit/subscribe with types, and a listener that throws must
 * never take down the action that emitted (docs/decisions.md).
 */

export interface ChapterCompleted {
  userId: string;
  chapterId: string;
  technologySlug: string;
  skillIds: string[];
  xp: number;
  occurredAt: Date;
}

export interface ProgressReported {
  userId: string;
  chapterId: string;
  status: ProgressStatus;
  progressPercent: number;
  occurredAt: Date;
}

export interface QuizAttemptGraded {
  userId: string;
  attemptId: string;
  quizId: string;
  chapterId: string;
  source: string;
  scorePercent: number;
  passed: boolean;
  skillOutcomes: Array<{ skillId: string; correct: number; incorrect: number }>;
  occurredAt: Date;
}

export interface DomainEventMap {
  'quiz.attempt.graded': QuizAttemptGraded;
  'chapter.completed': ChapterCompleted;
  'progress.reported': ProgressReported;
}

export type DomainEventName = keyof DomainEventMap;
type Listener<K extends DomainEventName> = (payload: DomainEventMap[K]) => void | Promise<void>;

@Injectable()
export class DomainEvents {
  private readonly logger = new Logger(DomainEvents.name);
  private readonly listeners = new Map<DomainEventName, Array<Listener<DomainEventName>>>();

  on<K extends DomainEventName>(event: K, listener: Listener<K>): () => void {
    const current = this.listeners.get(event) ?? [];
    current.push(listener as Listener<DomainEventName>);
    this.listeners.set(event, current);

    return () => {
      const remaining = (this.listeners.get(event) ?? []).filter((item) => item !== listener);
      this.listeners.set(event, remaining);
    };
  }

  /**
   * Awaits every listener, so a consumer that must run inside the same request
   * can (grading, mastery, XP). A listener that throws is logged and skipped:
   * an achievement failing must not undo a completed chapter.
   */
  async emit<K extends DomainEventName>(event: K, payload: DomainEventMap[K]): Promise<void> {
    for (const listener of this.listeners.get(event) ?? []) {
      try {
        await listener(payload);
      } catch (error) {
        this.logger.error(`Écouteur de « ${event} » en échec : ${(error as Error).message}`);
      }
    }
  }
}
