import { loadContentGraph, type ContentGraph } from '@app/content';
import { PARAMETERS } from '@app/learning-engine';
import { CONTENT_DIR } from '../config/env';
import {
  buildSkillGraph,
  buildTechnologyDetail,
  buildTechnologyList,
  prerequisiteSkillsOf,
  resolveLock,
  type MasteryRow,
  type ProgressRow,
} from './catalog.view';

let graph: ContentGraph;

beforeAll(async () => {
  const result = await loadContentGraph(CONTENT_DIR);
  if (!result.ok) throw new Error('Le contenu de départ doit être valide');
  graph = result.value;
});

const UNLOCK = PARAMETERS.mastery.unlockThreshold;

function progress(rows: Array<Partial<ProgressRow> & { chapterId: string }>): ProgressRow[] {
  return rows.map((row) => ({
    status: 'IN_PROGRESS',
    progressPercent: 50,
    lastAccessedAt: null,
    ...row,
  }));
}

function mastery(entries: Record<string, number>): MasteryRow[] {
  return Object.entries(entries).map(([skillId, masteryScore]) => ({ skillId, masteryScore }));
}

/* -------------------------------------------------------------------------- */
/* Lock resolution                                                             */
/* -------------------------------------------------------------------------- */

describe('resolveLock', () => {
  const names = new Map([['scope', 'Portée']]);

  it('unlocks when there is no prerequisite at all', () => {
    expect(resolveLock([], new Map(), names)).toEqual({ locked: false, lockReason: null });
  });

  it('unlocks when every prerequisite reaches the threshold', () => {
    const result = resolveLock(['scope'], new Map([['scope', UNLOCK]]), names);
    expect(result.locked).toBe(false);
  });

  it('locks one point below the threshold and names the failing skill', () => {
    const result = resolveLock(['scope'], new Map([['scope', UNLOCK - 1]]), names);
    expect(result.locked).toBe(true);
    expect(result.lockReason).toEqual({
      code: 'PREREQUISITE_SKILLS',
      skills: [{ id: 'scope', name: 'Portée', mastery: UNLOCK - 1, required: UNLOCK }],
    });
  });

  it('treats an unknown skill as zero mastery rather than as satisfied', () => {
    const result = resolveLock(['jamais-vue'], new Map(), new Map());
    expect(result.locked).toBe(true);
    expect(result.lockReason?.skills[0]).toMatchObject({ id: 'jamais-vue', mastery: 0 });
  });

  it('lists only the failing prerequisites', () => {
    const result = resolveLock(
      ['scope', 'functions'],
      new Map([
        ['scope', 90],
        ['functions', 10],
      ]),
      new Map(),
    );
    expect(result.lockReason?.skills.map((s) => s.id)).toEqual(['functions']);
  });
});

describe('prerequisiteSkillsOf', () => {
  it('resolves a chapter prerequisite into the skills it teaches', () => {
    // Derived from the graph on purpose: a hard-coded skill list only records
    // what the programme happened to contain the day the test was written, and
    // breaks every time a chapter gains a prerequisite.
    const closures = graph.chapters.find((chapter) => chapter.id === 'javascript-closures')!;
    const taught = [
      ...new Set(
        closures.prerequisites.flatMap(
          (id) => graph.chapters.find((chapter) => chapter.id === id)?.skills ?? [],
        ),
      ),
    ];

    expect(taught.length).toBeGreaterThan(0);
    expect(prerequisiteSkillsOf(graph, 'javascript-closures')).toEqual(taught);
  });

  it('returns nothing for a chapter without prerequisites or for an unknown chapter', () => {
    expect(prerequisiteSkillsOf(graph, 'javascript-variables')).toEqual([]);
    expect(prerequisiteSkillsOf(graph, 'inconnu')).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* Technology list                                                             */
/* -------------------------------------------------------------------------- */

describe('buildTechnologyList', () => {
  it('lists published technologies in order, with counts', () => {
    const list = buildTechnologyList(graph, [], []);
    expect(list.map((item) => item.slug)).toEqual(['javascript', 'typescript']);

    const javascript = list[0]!;
    // Counted against the graph: writing content must not break a test about counting.
    const ofJavascript = <T extends { technology: string }>(nodes: T[]) =>
      nodes.filter((node) => node.technology === 'javascript').length;
    expect(javascript.chapterCount).toBe(ofJavascript(graph.chapters));
    expect(javascript.moduleCount).toBe(ofJavascript(graph.modules));
    expect(javascript.skillCount).toBe(ofJavascript(graph.skills));
    expect(javascript.chapterCount).toBeGreaterThan(0);
  });

  it('reports zero progress for a learner with no rows', () => {
    expect(buildTechnologyList(graph, [], [])[0]!.progressPercent).toBe(0);
  });

  it('averages chapter progress across the technology', () => {
    const list = buildTechnologyList(
      graph,
      progress([{ chapterId: 'javascript-variables', progressPercent: 100 }]),
      [],
    );
    // One chapter at 100 %, every other chapter at zero.
    const chapterCount = graph.chapters.filter((c) => c.technology === 'javascript').length;
    expect(list[0]!.progressPercent).toBe(Math.round(100 / chapterCount));
  });

  it('counts only skills at or above the mastered threshold', () => {
    const list = buildTechnologyList(
      graph,
      [],
      mastery({
        closures: PARAMETERS.mastery.masteredThreshold,
        scope: PARAMETERS.mastery.masteredThreshold - 1,
      }),
    );
    expect(list[0]!.masteredSkillCount).toBe(1);
  });
});

/* -------------------------------------------------------------------------- */
/* Technology detail                                                           */
/* -------------------------------------------------------------------------- */

describe('buildTechnologyDetail', () => {
  it('groups modules into their parts, in order, with progress derived from chapters', () => {
    for (const technology of graph.technologies) {
      const detail = buildTechnologyDetail(graph, technology.slug, [], mastery({}))!;
      const declared = technology.parts.map((part) => part.slug);

      expect(detail.parts.map((part) => part.order)).toEqual(
        [...detail.parts.map((part) => part.order)].sort((a, b) => a - b),
      );
      for (const module of detail.modules) {
        if (declared.length === 0) expect(module.part).toBeNull();
        else expect(declared).toContain(module.part);
      }
      for (const part of detail.parts) {
        const members = detail.modules.filter((module) => module.part === part.slug);
        expect(part.moduleSlugs).toEqual(members.map((module) => module.slug));
        // No progress rows: every level agrees on zero.
        expect(part.progressPercent).toBe(0);
      }
    }
  });

  it('returns null for an unknown technology', () => {
    expect(buildTechnologyDetail(graph, 'ruby', [], [])).toBeNull();
  });

  it('orders modules and chapters, and derives module progress from its chapters', () => {
    const detail = buildTechnologyDetail(
      graph,
      'javascript',
      progress([
        { chapterId: 'javascript-variables', progressPercent: 100, status: 'COMPLETED' },
        { chapterId: 'javascript-types-primitifs', progressPercent: 50 },
      ]),
      [],
    )!;

    const moduleOrders = detail.modules.map((m) => m.order);
    expect(moduleOrders).toEqual([...moduleOrders].sort((a, b) => a - b));

    const module = detail.modules.find((m) => m.slug === 'variables-et-valeurs')!;
    const chapterOrders = module.chapters.map((c) => c.order);
    expect(chapterOrders).toEqual([...chapterOrders].sort((a, b) => a - b));
    expect(module.chapters[0]!.slug).toBe('variables');

    const average = Math.round(
      module.chapters.reduce((total, c) => total + c.progressPercent, 0) / module.chapters.length,
    );
    expect(module.progressPercent).toBe(average);
    expect(module.progressPercent).toBeGreaterThan(0);
  });

  it('keeps technology, module and chapter progress consistent', () => {
    const detail = buildTechnologyDetail(
      graph,
      'javascript',
      progress([{ chapterId: 'javascript-variables', progressPercent: 100 }]),
      [],
    )!;

    const chapters = detail.modules.flatMap((m) => m.chapters);
    const average = Math.round(
      chapters.reduce((total, c) => total + c.progressPercent, 0) / chapters.length,
    );
    expect(detail.progressPercent).toBe(average);
  });

  it('locks a chapter whose prerequisite skill is weak, and unlocks it once mastered', () => {
    const locked = buildTechnologyDetail(graph, 'javascript', [], [])!;
    const closuresLocked = locked.modules
      .flatMap((m) => m.chapters)
      .find((c) => c.slug === 'closures')!;
    const required = prerequisiteSkillsOf(graph, 'javascript-closures');
    expect(closuresLocked.locked).toBe(true);
    expect(closuresLocked.lockReason?.skills.map((skill) => skill.id)).toEqual(required);
    // A locked chapter still exposes its title: only the content is withheld.
    expect(closuresLocked.title).toBe('Comprendre les closures');

    const unlocked = buildTechnologyDetail(
      graph,
      'javascript',
      [],
      mastery(Object.fromEntries(required.map((skillId) => [skillId, 90]))),
    )!;
    expect(
      unlocked.modules.flatMap((m) => m.chapters).find((c) => c.slug === 'closures')!.locked,
    ).toBe(false);
  });

  it('leaves a chapter with no prerequisites unlocked from the start', () => {
    const detail = buildTechnologyDetail(graph, 'javascript', [], [])!;
    expect(detail.modules[0]!.chapters[0]!.locked).toBe(false);
  });

  describe('continue', () => {
    it('points at the first unlocked chapter for a new learner', () => {
      const detail = buildTechnologyDetail(graph, 'javascript', [], [])!;
      expect(detail.continue).toEqual({
        chapterSlug: 'introduction-javascript',
        moduleSlug: 'introduction',
        progressPercent: 0,
      });
    });

    it('prefers the most recently opened chapter in progress', () => {
      const detail = buildTechnologyDetail(
        graph,
        'javascript',
        progress([
          {
            chapterId: 'javascript-variables',
            progressPercent: 40,
            lastAccessedAt: new Date('2026-09-01T10:00:00Z'),
          },
          {
            chapterId: 'javascript-functions',
            progressPercent: 20,
            lastAccessedAt: new Date('2026-09-05T10:00:00Z'),
          },
        ]),
        // Without mastery on `variables`, functions stays locked and is skipped —
        // which is the behaviour asserted in the next test.
        mastery({ variables: 90 }),
      )!;
      expect(detail.continue?.chapterSlug).toBe('functions');
    });

    it('never points at a locked chapter', () => {
      // Without any mastery, finish every chapter that is open: only locked ones remain.
      const fresh = buildTechnologyDetail(graph, 'javascript', [], [])!;
      const chapters = fresh.modules.flatMap((m) => m.chapters);
      const open = chapters.filter((c) => !c.locked);
      expect(chapters.some((c) => c.locked)).toBe(true);

      const detail = buildTechnologyDetail(
        graph,
        'javascript',
        progress(open.map((c) => ({ chapterId: c.id, progressPercent: 100, status: 'COMPLETED' as const }))),
        [],
      )!;
      expect(detail.continue).toBeNull();
    });
  });
});

/* -------------------------------------------------------------------------- */
/* Skill graph                                                                 */
/* -------------------------------------------------------------------------- */

describe('buildSkillGraph', () => {
  it('returns the technology skills with their edges and mastery', () => {
    const view = buildSkillGraph(graph, 'javascript', mastery({ closures: 72 }))!;
    const closures = view.skills.find((skill) => skill.id === 'closures')!;

    expect(closures.mastery).toBe(72);
    expect(closures.requires).toEqual(['scope', 'functions']);
    expect(view.skills.find((s) => s.id === 'scope')!.mastery).toBe(0);
  });

  it('returns null for an unknown technology', () => {
    expect(buildSkillGraph(graph, 'ruby', [])).toBeNull();
  });

  it('does not leak skills from another technology', () => {
    const view = buildSkillGraph(graph, 'typescript', [])!;
    expect(view.skills.map((s) => s.id)).not.toContain('closures');
  });
});
