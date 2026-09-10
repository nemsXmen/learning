import { resolve } from 'node:path';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { loadContentGraph, type ContentGraph } from '@app/content';
import { DomainEvents, type ChapterCompleted } from '../events/domain-events';
import { ChapterAccessService } from './chapter-access.service';
import {
  MAX_DAILY_SECONDS,
  MAX_REPORT_SECONDS,
  ProgressService,
} from './progress.service';
import type { UserProgressEntity } from './learning.entities';

const USER = '00000000-0000-4000-8000-000000000001';
const NOW = new Date('2026-09-10T10:00:00Z');

let graph: ContentGraph;

beforeAll(async () => {
  const result = await loadContentGraph(resolve(__dirname, '../../../../content'));
  if (!result.ok) throw new Error('Le contenu de départ doit être valide');
  graph = result.value;
});

/** An in-memory stand-in for `user_progress`, keyed like the real primary key. */
function progressRepo(seed: Partial<UserProgressEntity>[] = []) {
  const rows = new Map<string, UserProgressEntity>();
  for (const row of seed) {
    rows.set(`${row.userId}:${row.chapterId}`, {
      status: 'IN_PROGRESS',
      progressPercent: 0,
      timeSpentSeconds: 0,
      lastAccessedAt: null,
      completedAt: null,
      updatedAt: NOW,
      ...row,
    } as UserProgressEntity);
  }

  const repo = {
    rows,
    findOne: jest.fn(async ({ where }: { where: { userId: string; chapterId: string } }) =>
      rows.get(`${where.userId}:${where.chapterId}`) ?? null,
    ),
    find: jest.fn(async ({ where }: { where: { userId: string } }) =>
      [...rows.values()].filter((row) => row.userId === where.userId),
    ),
    upsert: jest.fn(async (row: UserProgressEntity) => {
      rows.set(`${row.userId}:${row.chapterId}`, row);
    }),
    insert: jest.fn(async (row: UserProgressEntity) => {
      rows.set(`${row.userId}:${row.chapterId}`, row);
    }),
    createQueryBuilder: () => {
      let patch: Partial<UserProgressEntity> = {};
      let criteria: { userId: string; chapterId: string } = { userId: '', chapterId: '' };
      const builder = {
        update: () => builder,
        set: (value: Partial<UserProgressEntity>) => {
          patch = value;
          return builder;
        },
        where: (_sql: string, params: { userId: string; chapterId: string }) => {
          criteria = params;
          return builder;
        },
        // Mirrors `WHERE status <> 'COMPLETED'`: the conditional update is the
        // whole concurrency guard, so the fake must honour it.
        execute: async () => {
          const key = `${criteria.userId}:${criteria.chapterId}`;
          const existing = rows.get(key);
          if (!existing || existing.status === 'COMPLETED') return { affected: 0 };
          rows.set(key, { ...existing, ...patch } as UserProgressEntity);
          return { affected: 1 };
        },
      };
      return builder;
    },
  };
  return repo;
}

function masteryRepo(scores: Record<string, number> = {}) {
  return {
    find: jest.fn(async () =>
      Object.entries(scores).map(([skillId, masteryScore]) => ({ skillId, masteryScore })),
    ),
  };
}

function redisStub() {
  const store = new Map<string, number>();
  return {
    store,
    get: jest.fn(async (key: string) => (store.has(key) ? String(store.get(key)) : null)),
    incrby: jest.fn(async (key: string, by: number) => {
      store.set(key, (store.get(key) ?? 0) + by);
      return store.get(key)!;
    }),
    expire: jest.fn(async () => 1),
  };
}

function build(options: {
  seed?: Partial<UserProgressEntity>[];
  mastery?: Record<string, number>;
  redis?: ReturnType<typeof redisStub>;
} = {}) {
  const progress = progressRepo(options.seed);
  const mastery = masteryRepo(options.mastery);
  const redis = options.redis ?? redisStub();
  const events = new DomainEvents();
  const content = { getGraph: () => graph } as never;

  // The real guard, not a stub: locking is the behaviour under test.
  const access = new ChapterAccessService(mastery as never);

  const service = new ProgressService(
    content,
    events,
    access,
    redis as never,
    progress as never,
  );
  return { service, progress, redis, events, access };
}

/* -------------------------------------------------------------------------- */
/* Reporting                                                                   */
/* -------------------------------------------------------------------------- */

describe('ProgressService.report', () => {
  it('starts a chapter that had no row', async () => {
    const { service } = build();
    const view = await service.report(USER, 'javascript-variables', { progressPercent: 30 }, NOW);

    expect(view).toMatchObject({ status: 'IN_PROGRESS', progressPercent: 30 });
    expect(view.lastAccessedAt).toEqual(NOW);
  });

  it('never rewinds progress: a stale report is ignored', async () => {
    const { service } = build({
      seed: [{ userId: USER, chapterId: 'javascript-variables', progressPercent: 72 }],
    });
    const view = await service.report(USER, 'javascript-variables', { progressPercent: 10 }, NOW);
    expect(view.progressPercent).toBe(72);
  });

  it('clamps a percentage outside 0..100', async () => {
    const { service } = build();
    expect(
      (await service.report(USER, 'javascript-variables', { progressPercent: 480 }, NOW))
        .progressPercent,
    ).toBe(100);
  });

  it('keeps a completed chapter completed', async () => {
    const { service } = build({
      seed: [
        {
          userId: USER,
          chapterId: 'javascript-variables',
          status: 'COMPLETED',
          progressPercent: 100,
        },
      ],
    });
    const view = await service.report(USER, 'javascript-variables', { progressPercent: 50 }, NOW);
    expect(view.status).toBe('COMPLETED');
    expect(view.progressPercent).toBe(100);
  });

  it('404s on an unknown chapter', async () => {
    const { service } = build();
    await expect(service.report(USER, 'chapitre-fantome', {}, NOW)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('403s on a locked chapter, with the reason', async () => {
    const { service } = build();
    // `closures` needs the `functions` skill, and nothing is mastered here.
    const error = await service.report(USER, 'javascript-closures', {}, NOW).catch((e) => e);
    expect(error).toBeInstanceOf(ForbiddenException);
    expect(error.getResponse()).toMatchObject({ code: 'CHAPTER_LOCKED' });
  });

  it('allows a chapter once its prerequisite skill is mastered', async () => {
    const { service } = build({ mastery: { functions: 90 } });
    await expect(
      service.report(USER, 'javascript-closures', { progressPercent: 10 }, NOW),
    ).resolves.toMatchObject({ status: 'IN_PROGRESS' });
  });
});

/* -------------------------------------------------------------------------- */
/* Time accounting                                                             */
/* -------------------------------------------------------------------------- */

describe('time accounting', () => {
  it('caps a single report', async () => {
    const { service } = build();
    const view = await service.report(
      USER,
      'javascript-variables',
      { timeSpentSeconds: 99_999 },
      NOW,
    );
    expect(view.timeSpentSeconds).toBe(MAX_REPORT_SECONDS);
  });

  it('accumulates across reports', async () => {
    const { service } = build();
    await service.report(USER, 'javascript-variables', { timeSpentSeconds: 60 }, NOW);
    const view = await service.report(USER, 'javascript-variables', { timeSpentSeconds: 30 }, NOW);
    expect(view.timeSpentSeconds).toBe(90);
  });

  it('stops granting time once the daily budget is spent', async () => {
    const redis = redisStub();
    redis.store.set(`progress:time:${USER}:2026-09-10`, MAX_DAILY_SECONDS);

    const { service } = build({ redis });
    const view = await service.report(
      USER,
      'javascript-variables',
      { timeSpentSeconds: 300 },
      NOW,
    );
    // An idle tab reporting all night must not become eight hours of study.
    expect(view.timeSpentSeconds).toBe(0);
  });

  it('grants only what is left of the daily budget', async () => {
    const redis = redisStub();
    redis.store.set(`progress:time:${USER}:2026-09-10`, MAX_DAILY_SECONDS - 100);

    const { service } = build({ redis });
    const view = await service.report(USER, 'javascript-variables', { timeSpentSeconds: 300 }, NOW);
    expect(view.timeSpentSeconds).toBe(100);
  });

  it('counts each day separately', async () => {
    const redis = redisStub();
    const { service } = build({ redis });

    await service.report(USER, 'javascript-variables', { timeSpentSeconds: 120 }, NOW);
    expect(redis.store.get(`progress:time:${USER}:2026-09-10`)).toBe(120);

    await service.report(
      USER,
      'javascript-variables',
      { timeSpentSeconds: 120 },
      new Date('2026-09-11T10:00:00Z'),
    );
    expect(redis.store.get(`progress:time:${USER}:2026-09-11`)).toBe(120);
  });

  it('falls back to the per-report cap when Redis is unavailable', async () => {
    const broken = {
      get: jest.fn(async () => {
        throw new Error('redis down');
      }),
      incrby: jest.fn(),
      expire: jest.fn(),
    };
    const { service } = build({ redis: broken as never });
    const view = await service.report(
      USER,
      'javascript-variables',
      { timeSpentSeconds: 99_999 },
      NOW,
    );
    // Degraded, not refused.
    expect(view.timeSpentSeconds).toBe(MAX_REPORT_SECONDS);
  });
});

/* -------------------------------------------------------------------------- */
/* Completion                                                                  */
/* -------------------------------------------------------------------------- */

describe('ProgressService.complete', () => {
  it('completes a chapter and emits the event once', async () => {
    const { service, events } = build({
      seed: [{ userId: USER, chapterId: 'javascript-variables', progressPercent: 80 }],
    });

    const seen: ChapterCompleted[] = [];
    events.on('chapter.completed', (payload) => {
      seen.push(payload);
    });

    const result = await service.complete(USER, 'javascript-variables', NOW);

    expect(result).toMatchObject({ status: 'COMPLETED', alreadyCompleted: false });
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      userId: USER,
      chapterId: 'javascript-variables',
      technologySlug: 'javascript',
      skillIds: ['variables'],
      xp: 60,
    });
  });

  it('completes a chapter that was never started', async () => {
    const { service, progress } = build();
    const result = await service.complete(USER, 'javascript-variables', NOW);

    expect(result.alreadyCompleted).toBe(false);
    expect(progress.rows.get(`${USER}:javascript-variables`)).toMatchObject({
      status: 'COMPLETED',
      progressPercent: 100,
    });
  });

  it('is idempotent: the second call emits nothing', async () => {
    const { service, events } = build();
    let count = 0;
    events.on('chapter.completed', () => {
      count += 1;
    });

    await service.complete(USER, 'javascript-variables', NOW);
    const second = await service.complete(USER, 'javascript-variables', NOW);

    expect(second.alreadyCompleted).toBe(true);
    expect(count).toBe(1);
  });

  it('emits exactly once under concurrent completion', async () => {
    const { service, events } = build({
      seed: [{ userId: USER, chapterId: 'javascript-variables' }],
    });
    let count = 0;
    events.on('chapter.completed', () => {
      count += 1;
    });

    await Promise.all([
      service.complete(USER, 'javascript-variables', NOW),
      service.complete(USER, 'javascript-variables', NOW),
    ]);

    expect(count).toBe(1);
  });

  it('refuses to complete a locked chapter', async () => {
    const { service } = build();
    await expect(service.complete(USER, 'javascript-closures', NOW)).rejects.toThrow(
      ForbiddenException,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Reads                                                                       */
/* -------------------------------------------------------------------------- */

describe('reads', () => {
  it('reports an unstarted chapter as NOT_STARTED rather than failing', async () => {
    const { service } = build();
    await expect(service.getChapter(USER, 'javascript-variables')).resolves.toMatchObject({
      status: 'NOT_STARTED',
      progressPercent: 0,
    });
  });

  it('averages technology progress over every chapter, counting absent rows as zero', async () => {
    const { service } = build({
      seed: [{ userId: USER, chapterId: 'javascript-variables', progressPercent: 90 }],
    });
    const view = await service.getTechnology(USER, 'javascript');

    expect(view.chapters).toHaveLength(3);
    expect(view.progressPercent).toBe(30);
  });

  it('404s on an unknown technology', async () => {
    const { service } = build();
    await expect(service.getTechnology(USER, 'ruby')).rejects.toThrow(NotFoundException);
  });

  it('never mixes learners', async () => {
    const { service } = build({
      seed: [
        { userId: USER, chapterId: 'javascript-variables', progressPercent: 90 },
        { userId: 'autre', chapterId: 'javascript-functions', progressPercent: 100 },
      ],
    });
    const view = await service.getTechnology(USER, 'javascript');
    expect(view.chapters.find((c) => c.chapterId === 'javascript-functions')?.progressPercent).toBe(
      0,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Event bus                                                                   */
/* -------------------------------------------------------------------------- */

describe('DomainEvents', () => {
  it('does not let a failing listener break the emitter', async () => {
    const events = new DomainEvents();
    const seen: string[] = [];

    events.on('chapter.completed', () => {
      throw new Error('écouteur cassé');
    });
    events.on('chapter.completed', () => {
      seen.push('second');
    });

    await events.emit('chapter.completed', {
      userId: USER,
      chapterId: 'x',
      technologySlug: 'javascript',
      skillIds: [],
      xp: 0,
      occurredAt: NOW,
    });

    // An achievement failing must not undo a completed chapter.
    expect(seen).toEqual(['second']);
  });

  it('stops calling a listener once unsubscribed', async () => {
    const events = new DomainEvents();
    let count = 0;
    const off = events.on('progress.reported', () => {
      count += 1;
    });

    const payload = {
      userId: USER,
      chapterId: 'x',
      status: 'IN_PROGRESS' as const,
      progressPercent: 1,
      occurredAt: NOW,
    };
    await events.emit('progress.reported', payload);
    off();
    await events.emit('progress.reported', payload);

    expect(count).toBe(1);
  });
});
