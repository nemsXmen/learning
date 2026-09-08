import { z } from 'zod';
import { LEVELS, QUESTION_TYPES } from '@app/types';

/**
 * The content schema. Authors read errors produced by these messages, so they are
 * written for a content author, not for a developer (docs/content-model.md).
 */

const id = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Identifiant en kebab-case, minuscules et chiffres');

const slug = id;
const scale5 = z.number().int().min(1).max(5);

export const technologyFileSchema = z.object({
  slug,
  name: z.string().min(1),
  order: z.number().int().min(0),
  description: z.string().min(1),
  published: z.boolean().default(false),
});

export const moduleFileSchema = z.object({
  slug,
  title: z.string().min(1),
  order: z.number().int().min(0),
});

export const skillsFileSchema = z.object({
  skills: z
    .array(
      z.object({
        id,
        name: z.string().min(1),
        importance: scale5,
        requires: z.array(id).default([]),
      }),
    )
    .min(1, 'Déclare au moins une compétence'),
});

export const chapterFrontmatterSchema = z.object({
  id,
  title: z.string().min(1),
  slug,
  technology: slug,
  level: z.enum(LEVELS),
  module: slug,
  order: z.number().int().min(0),
  estimatedMinutes: z.number().int().min(1).max(240),
  difficulty: scale5,
  xp: z.number().int().min(0).max(1000),
  prerequisites: z.array(id).default([]),
  skills: z.array(id).min(1, 'Un chapitre doit enseigner au moins une compétence'),
  tags: z.array(z.string().min(1)).default([]),
});

export type ChapterFrontmatter = z.infer<typeof chapterFrontmatterSchema>;

/**
 * `explanation` is required on every question: the platform must never answer with
 * a bare "Incorrect" (CDC §76, docs/rules.md #3).
 */
export const questionSchema = z.object({
  id,
  type: z.enum(QUESTION_TYPES),
  difficulty: scale5,
  question: z.string().min(1),
  options: z.array(z.string().min(1)).optional(),
  answer: z.union([z.array(z.number().int().min(0)), z.boolean(), z.string()]).optional(),
  explanation: z.string().min(1, 'Chaque question doit expliquer sa réponse'),
  skills: z.array(id).min(1, 'Rattache la question à au moins une compétence'),
});

export type Question = z.infer<typeof questionSchema>;

export const quizFileSchema = z.object({
  id,
  kind: z.enum(['QUIZ', 'CHAPTER_TEST']).default('QUIZ'),
  questions: z.array(questionSchema).min(1, 'Un quiz vide n’a pas de sens'),
});

export type QuizFile = z.infer<typeof quizFileSchema>;

/** Level-2 headings a chapter must carry (CDC §6, §74). */
export const REQUIRED_SECTIONS = [
  'Objectifs',
  'Introduction',
  'Concept',
  'Exemple',
  'Comment ça fonctionne',
  'Erreurs fréquentes',
  'À retenir',
  'Exercices',
  "Questions d'entretien",
] as const;
