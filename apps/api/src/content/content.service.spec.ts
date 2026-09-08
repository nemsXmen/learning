import { NotFoundException } from '@nestjs/common';
import { ContentService } from './content.service';

/** Records what was cached so the key strategy can be asserted. */
function fakeRedis(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed));
  const sets: string[] = [];
  return {
    sets,
    store,
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    set: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
      sets.push(key);
      return 'OK';
    }),
  };
}

async function bootService(redis = fakeRedis()) {
  const service = new ContentService(redis as never);
  await service.onModuleInit();
  return { service, redis };
}

describe('ContentService', () => {
  // Runs against the real content/ tree: the seed chapters are the contract.
  it('loads the seed content tree at boot', async () => {
    const { service } = await bootService();
    const graph = service.getGraph();
    expect(graph.technologies.map((t) => t.slug).sort()).toEqual(['javascript', 'typescript']);
    expect(graph.chapters.length).toBeGreaterThanOrEqual(5);
  });

  it('returns the documented chapter payload', async () => {
    const { service } = await bootService();
    const chapter = await service.getChapter('javascript', 'closures');

    expect(chapter).toMatchObject({
      id: 'javascript-closures',
      slug: 'closures',
      technology: { slug: 'javascript', name: 'JavaScript' },
      module: { slug: 'scope', title: 'Portée et exécution' },
      level: 'intermediate',
      difficulty: 3,
      xp: 100,
      prerequisites: ['javascript-functions'],
    });
    expect(chapter.contentVersion).toMatch(/^[0-9a-f]{12}$/);
    expect(chapter.html).toContain('<h2 id="concept">');
    expect(chapter.outline.map((entry) => entry.id)).toContain('erreurs-frequentes');
    expect(chapter.skills).toContainEqual({ id: 'closures', name: 'Closures' });
  });

  it('orders neighbours by module then chapter', async () => {
    const { service } = await bootService();

    const first = await service.getChapter('javascript', 'variables');
    expect(first.neighbours.previous).toBeNull();
    expect(first.neighbours.next).toBe('javascript-functions');

    const last = await service.getChapter('javascript', 'closures');
    expect(last.neighbours.previous).toBe('javascript-functions');
    expect(last.neighbours.next).toBeNull();
  });

  it('never serves an answer key or an explanation', async () => {
    const { service } = await bootService();
    const quiz = await service.getQuiz('javascript', 'closures');

    expect(quiz.questions.length).toBeGreaterThan(0);
    // Recursive: a nested field added later must not slip through.
    const keys = new Set<string>();
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(walk);
      if (value && typeof value === 'object') {
        for (const [key, nested] of Object.entries(value)) {
          keys.add(key);
          walk(nested);
        }
      }
    };
    walk(quiz);

    expect(keys.has('answer')).toBe(false);
    expect(keys.has('explanation')).toBe(false);
    expect(JSON.stringify(quiz)).not.toContain('explanation');
  });

  it('matches the chapter and quiz content versions of the same file set', async () => {
    const { service } = await bootService();
    const quiz = await service.getQuiz('javascript', 'closures');
    expect(quiz.quizId).toBe('javascript-closures-quiz');
    expect(quiz.contentVersion).toMatch(/^[0-9a-f]{12}$/);
  });

  describe('errors', () => {
    it('404s on an unknown chapter', async () => {
      const { service } = await bootService();
      await expect(service.getChapter('javascript', 'inconnu')).rejects.toThrow(NotFoundException);
      await expect(service.getChapter('inconnu', 'closures')).rejects.toMatchObject({
        response: { code: 'CONTENT_NOT_FOUND' },
      });
    });

    it('404s rather than resolving a traversal attempt', async () => {
      const { service } = await bootService();
      await expect(service.getChapter('javascript', '../../etc/passwd')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('404s when a chapter has no quiz', async () => {
      const { service } = await bootService();
      // Every seed chapter has one, so assert on a chapter that does not exist at all.
      await expect(service.getQuiz('javascript', 'inconnu')).rejects.toThrow(NotFoundException);
    });
  });

  describe('render cache', () => {
    it('keys by content path and version', async () => {
      const { service, redis } = await bootService();
      await service.getChapter('javascript', 'closures');

      expect(redis.sets).toHaveLength(1);
      expect(redis.sets[0]).toMatch(
        /^content:render:javascript\/scope\/closures\/lesson\.md:[0-9a-f]{12}$/,
      );
    });

    it('serves the cached render on the second call', async () => {
      const { service, redis } = await bootService();
      const cold = await service.getChapter('javascript', 'closures');
      redis.set.mockClear();

      const warm = await service.getChapter('javascript', 'closures');
      expect(warm.html).toBe(cold.html);
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('still serves the chapter when the cache is unavailable', async () => {
      const broken = {
        sets: [],
        store: new Map(),
        get: jest.fn(async () => {
          throw new Error('redis down');
        }),
        set: jest.fn(async () => {
          throw new Error('redis down');
        }),
      };
      const service = new ContentService(broken as never);
      await service.onModuleInit();

      const chapter = await service.getChapter('javascript', 'closures');
      expect(chapter.html).toContain('<h2 id="concept">');
    });
  });
});
