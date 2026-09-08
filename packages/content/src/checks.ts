import { isGradedQuestionType } from '@app/types';
import { issue, type ValidationIssue } from './issues';
import type { ContentGraph } from './graph';

/**
 * Cross-file checks. Everything here needs the whole tree, so it runs after the
 * per-file parsing in `loader.ts`.
 */
export function checkGraph(graph: ContentGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [
    ...checkUniqueness(graph),
    ...checkReferences(graph),
    ...checkSkillGraph(graph),
    ...checkAnswers(graph),
  ];
  return issues;
}

function checkUniqueness(graph: ContentGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const seenIds = new Map<string, string>();
  for (const chapter of graph.chapters) {
    const previous = seenIds.get(chapter.id);
    if (previous) {
      issues.push(
        issue(chapter.contentPath, 2, 'DUPLICATE_ID', `L’identifiant « ${chapter.id} » est déjà utilisé par ${previous}`),
      );
    } else {
      seenIds.set(chapter.id, chapter.contentPath);
    }
  }

  // A slug is unique within its technology, not globally: two technologies may
  // both teach "functions".
  const seenSlugs = new Map<string, string>();
  for (const chapter of graph.chapters) {
    const key = `${chapter.technology}/${chapter.slug}`;
    const previous = seenSlugs.get(key);
    if (previous) {
      issues.push(
        issue(chapter.contentPath, 4, 'DUPLICATE_SLUG', `Le slug « ${chapter.slug} » est déjà utilisé par ${previous} dans ${chapter.technology}`),
      );
    } else {
      seenSlugs.set(key, chapter.contentPath);
    }
  }

  const seenSkills = new Map<string, string>();
  for (const skill of graph.skills) {
    const previous = seenSkills.get(skill.id);
    if (previous) {
      issues.push(
        issue(`${skill.technology}/skills.yaml`, 0, 'DUPLICATE_ID', `La compétence « ${skill.id} » est déjà déclarée dans ${previous}`),
      );
    } else {
      seenSkills.set(skill.id, `${skill.technology}/skills.yaml`);
    }
  }

  return issues;
}

function checkReferences(graph: ContentGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const skillIds = new Set(graph.skills.map((skill) => skill.id));
  const chapterIds = new Set(graph.chapters.map((chapter) => chapter.id));
  const moduleKeys = new Set(graph.modules.map((module) => `${module.technology}/${module.slug}`));

  for (const chapter of graph.chapters) {
    for (const skillId of chapter.skills) {
      if (!skillIds.has(skillId)) {
        issues.push(
          issue(chapter.contentPath, 1, 'UNKNOWN_SKILL', `Compétence inconnue : « ${skillId} »`),
        );
      }
    }
    for (const prerequisite of chapter.prerequisites) {
      if (!chapterIds.has(prerequisite)) {
        issues.push(
          issue(chapter.contentPath, 1, 'UNKNOWN_PREREQUISITE', `Prérequis inconnu : « ${prerequisite} »`),
        );
      }
    }
    if (!moduleKeys.has(`${chapter.technology}/${chapter.module}`)) {
      issues.push(
        issue(chapter.contentPath, 1, 'UNKNOWN_PREREQUISITE', `Module inconnu : « ${chapter.module} »`),
      );
    }
  }

  for (const skill of graph.skills) {
    for (const required of skill.requires) {
      if (!skillIds.has(required)) {
        issues.push(
          issue(`${skill.technology}/skills.yaml`, 0, 'UNKNOWN_SKILL', `« ${skill.id} » requiert une compétence inconnue : « ${required} »`),
        );
      }
    }
  }

  for (const quiz of graph.quizzes) {
    for (const question of quiz.questions) {
      for (const skillId of question.skills) {
        if (!skillIds.has(skillId)) {
          issues.push(
            issue(quiz.contentPath, 0, 'UNKNOWN_SKILL', `Question « ${question.id} » : compétence inconnue « ${skillId} »`),
          );
        }
      }
    }
  }

  return issues;
}

/** Depth-first cycle detection. The graph drives unlocking, so it must be a DAG. */
function checkSkillGraph(graph: ContentGraph): ValidationIssue[] {
  const edges = new Map(graph.skills.map((skill) => [skill.id, skill.requires]));
  const owner = new Map(graph.skills.map((skill) => [skill.id, `${skill.technology}/skills.yaml`]));
  const state = new Map<string, 'visiting' | 'done'>();
  const issues: ValidationIssue[] = [];

  function visit(id: string, trail: string[]): void {
    const current = state.get(id);
    if (current === 'done') return;
    if (current === 'visiting') {
      const cycle = [...trail.slice(trail.indexOf(id)), id].join(' → ');
      issues.push(
        issue(owner.get(id) ?? 'skills.yaml', 0, 'CYCLIC_SKILL_GRAPH', `Cycle de prérequis : ${cycle}`),
      );
      return;
    }

    state.set(id, 'visiting');
    for (const next of edges.get(id) ?? []) {
      if (edges.has(next)) visit(next, [...trail, id]);
    }
    state.set(id, 'done');
  }

  for (const skill of graph.skills) visit(skill.id, []);
  return issues;
}

function checkAnswers(graph: ContentGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const quiz of graph.quizzes) {
    for (const question of quiz.questions) {
      if (!isGradedQuestionType(question.type)) continue;

      if (question.answer === undefined) {
        issues.push(
          issue(quiz.contentPath, 0, 'INVALID_QUIZ', `Question « ${question.id} » : réponse absente pour un type corrigé automatiquement`),
        );
        continue;
      }

      if (question.type === 'true_false') {
        if (typeof question.answer !== 'boolean') {
          issues.push(
            issue(quiz.contentPath, 0, 'INVALID_QUIZ', `Question « ${question.id} » : « answer » doit être true ou false`),
          );
        }
        continue;
      }

      if (question.type === 'predict_output') {
        if (typeof question.answer !== 'string') {
          issues.push(
            issue(quiz.contentPath, 0, 'INVALID_QUIZ', `Question « ${question.id} » : « answer » doit être la sortie attendue`),
          );
        }
        continue;
      }

      // multiple_choice and multiple_answer index into `options`.
      const options = question.options ?? [];
      if (options.length < 2) {
        issues.push(
          issue(quiz.contentPath, 0, 'INVALID_QUIZ', `Question « ${question.id} » : au moins deux options attendues`),
        );
        continue;
      }
      if (!Array.isArray(question.answer)) {
        issues.push(
          issue(quiz.contentPath, 0, 'INVALID_QUIZ', `Question « ${question.id} » : « answer » doit être une liste d’index`),
        );
        continue;
      }
      if (question.type === 'multiple_choice' && question.answer.length !== 1) {
        issues.push(
          issue(quiz.contentPath, 0, 'INVALID_QUIZ', `Question « ${question.id} » : un choix unique attend exactement une réponse`),
        );
      }
      for (const index of question.answer) {
        if (index >= options.length) {
          issues.push(
            issue(quiz.contentPath, 0, 'ANSWER_OUT_OF_RANGE', `Question « ${question.id} » : index ${index} hors des ${options.length} options`),
          );
        }
      }
    }
  }

  return issues;
}
