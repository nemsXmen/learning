import { loadContentGraph, type ContentGraph } from '@app/content';
import { CONTENT_DIR } from '../config/env';
import { buildSyncPlan, idsToPrune, moduleKey } from './sync-plan';

async function seedGraph(): Promise<ContentGraph> {
  const result = await loadContentGraph(CONTENT_DIR);
  if (!result.ok) throw new Error('Le contenu de départ doit être valide');
  return result.value;
}

describe('buildSyncPlan', () => {
  it('projects every node of the graph', async () => {
    const graph = await seedGraph();
    const plan = buildSyncPlan(graph);

    expect(plan.technologies.map((t) => t.slug).sort()).toEqual(['ai-engineering', 'javascript', 'typescript']);
    // Counted against the graph, not hard-coded: writing a chapter must not break a
    // test about the projection.
    expect(plan.modules).toHaveLength(graph.modules.length);
    expect(plan.chapters).toHaveLength(graph.chapters.length);
    expect(plan.skills).toHaveLength(graph.skills.length);
    expect(plan.quizzes).toHaveLength(graph.quizzes.length);
    expect(plan.chapters.length).toBeGreaterThan(0);
  });

  it('is pure: the same graph yields an identical plan', async () => {
    const graph = await seedGraph();
    expect(buildSyncPlan(graph)).toEqual(buildSyncPlan(graph));
  });

  it('keys modules by technology and slug so a sync cannot collide', async () => {
    const plan = buildSyncPlan(await seedGraph());
    const ids = plan.modules.map((module) => module.id);

    // Two technologies may share a module slug; the key is namespaced so they never collide.
    for (const module of plan.modules) {
      expect(module.id).toBe(moduleKey(module.technologySlug, module.slug));
    }
    expect(ids).toContain('typescript/01-introduction-to-typescript');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('flattens the skill graph into edges', async () => {
    const plan = buildSyncPlan(await seedGraph());
    expect(plan.skillPrerequisites).toContainEqual({
      skillId: 'closures',
      requiresSkillId: 'scope',
    });
    expect(plan.skillPrerequisites).toContainEqual({
      skillId: 'closures',
      requiresSkillId: 'functions',
    });
  });

  it('links chapters to every skill they teach', async () => {
    const plan = buildSyncPlan(await seedGraph());
    const closures = plan.chapterSkills.filter((link) => link.chapterId === 'javascript-closures');
    expect(closures.map((link) => link.skillId).sort()).toEqual([
      'closures',
      'lexical-environment',
      'scope',
    ]);
  });

  it('records chapter prerequisites as edges', async () => {
    const plan = buildSyncPlan(await seedGraph());
    expect(plan.chapterPrerequisites).toContainEqual({
      chapterId: 'javascript-closures',
      requiresChapterId: 'javascript-functions',
    });
  });

  it('carries the content path and version, never the body', async () => {
    const plan = buildSyncPlan(await seedGraph());
    const chapter = plan.chapters.find((item) => item.id === 'javascript-closures');

    expect(chapter?.contentPath).toBe('javascript/closures/closures/lesson.md');
    expect(chapter?.contentVersion).toMatch(/^[0-9a-f]{12}$/);
    expect(JSON.stringify(plan)).not.toContain('## Concept');
  });

  it('changes the version of an edited chapter and nothing else', async () => {
    const graph = await seedGraph();
    const before = buildSyncPlan(graph);

    const edited: ContentGraph = {
      ...graph,
      chapters: graph.chapters.map((chapter) =>
        chapter.id === 'javascript-closures'
          ? { ...chapter, contentVersion: 'ffffffffffff' }
          : chapter,
      ),
    };
    const after = buildSyncPlan(edited);

    const changed = after.chapters.filter((chapter, index) => {
      const previous = before.chapters[index];
      return previous?.contentVersion !== chapter.contentVersion;
    });
    expect(changed.map((chapter) => chapter.id)).toEqual(['javascript-closures']);
  });
});

describe('moduleKey', () => {
  it('namespaces a module slug by its technology', () => {
    expect(moduleKey('javascript', 'fundamentals')).toBe('javascript/fundamentals');
  });
});

describe('idsToPrune', () => {
  it('returns rows the content tree no longer contains', () => {
    expect(idsToPrune(['a', 'b'], ['a', 'b', 'c'])).toEqual(['c']);
  });

  it('returns nothing when the database matches the plan', () => {
    expect(idsToPrune(['a', 'b'], ['b', 'a'])).toEqual([]);
  });

  it('never prunes rows the plan introduces', () => {
    expect(idsToPrune(['a', 'b', 'nouveau'], ['a', 'b'])).toEqual([]);
  });
});
