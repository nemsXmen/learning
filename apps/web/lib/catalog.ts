import 'server-only';
import { cookies } from 'next/headers';
import { apiFetch } from './api';
import { ACCESS_COOKIE } from './session';

export interface LockReason {
  code: 'PREREQUISITE_SKILLS';
  skills: Array<{ id: string; name: string; mastery: number; required: number }>;
}

export interface ChapterView {
  id: string;
  slug: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  difficulty: number;
  xp: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercent: number;
  locked: boolean;
  lockReason: LockReason | null;
}

export interface ModuleView {
  slug: string;
  title: string;
  order: number;
  part: string | null;
  progressPercent: number;
  chapters: ChapterView[];
}

export interface TechnologySummary {
  slug: string;
  name: string;
  description: string;
  progressPercent: number;
  moduleCount: number;
  chapterCount: number;
  masteredSkillCount: number;
  skillCount: number;
}

export interface PartView {
  slug: string;
  title: string;
  order: number;
  description: string | null;
  progressPercent: number;
  moduleSlugs: string[];
}

export interface TechnologyDetail {
  parts: PartView[];
  slug: string;
  name: string;
  description: string;
  progressPercent: number;
  masteredSkillCount: number;
  skillCount: number;
  modules: ModuleView[];
  continue: { chapterSlug: string; moduleSlug: string; progressPercent: number } | null;
}

/** Server-side only: the access token never leaves this runtime. */
async function authorized<T>(path: string): Promise<T> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  return apiFetch<T>(path, { accessToken, cache: 'no-store' });
}

export function listTechnologies(): Promise<TechnologySummary[]> {
  return authorized<TechnologySummary[]>('/learn/technologies');
}

export function getTechnology(slug: string): Promise<TechnologyDetail> {
  return authorized<TechnologyDetail>(`/learn/technologies/${encodeURIComponent(slug)}`);
}

export interface OutlineEntry {
  depth: number;
  id: string;
  text: string;
}

export interface ChapterPayload {
  id: string;
  title: string;
  slug: string;
  technology: { slug: string; name: string };
  module: { slug: string; title: string };
  level: string;
  estimatedMinutes: number;
  difficulty: number;
  xp: number;
  skills: Array<{ id: string; name: string }>;
  outline: OutlineEntry[];
  html: string;
  contentVersion: string;
  neighbours: { previous: string | null; next: string | null };
  /** The test that closes the chapter, or null when none is written yet. */
  quiz: { id: string; kind: 'QUIZ' | 'CHAPTER_TEST'; questionCount: number } | null;
}

export interface AttemptSummary {
  attemptId: string;
  scorePercent: number | null;
  passed: boolean | null;
  submittedAt: string | null;
  startedAt: string;
}

export interface ChapterProgress {
  chapterId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercent: number;
  timeSpentSeconds: number;
  completedAt: string | null;
}

export function getQuizHistory(quizId: string): Promise<AttemptSummary[]> {
  return authorized<AttemptSummary[]>(`/me/quizzes/${encodeURIComponent(quizId)}/attempts`);
}

export function getChapter(technology: string, chapter: string): Promise<ChapterPayload> {
  return authorized<ChapterPayload>(
    `/content/chapters/${encodeURIComponent(technology)}/${encodeURIComponent(chapter)}`,
  );
}

export function getChapterProgress(chapterId: string): Promise<ChapterProgress> {
  return authorized<ChapterProgress>(`/me/progress/chapters/${encodeURIComponent(chapterId)}`);
}

export interface DashboardAction {
  type: string;
  label: string;
  href: string;
  estimatedMinutes: number;
  reason: string;
}

export interface DashboardView {
  user: { displayName: string; dailyMinutesTarget: number; emailVerified: boolean };
  xp: { total: number; level: number; levelProgressPercent: number; xpToNextLevel: number; todayXp: number } | null;
  streak: { currentDays: number; longestDays: number; activeToday: boolean; atRisk: boolean } | null;
  overallProgressPercent: number;
  continue: { technologySlug: string; chapterSlug: string; title: string; progressPercent: number } | null;
  nextBestAction: DashboardAction;
  attention: Array<{ skillId: string; name: string; mastery: number; reason: string }>;
  todayPlan: Array<{ kind: string; label: string; estimatedMinutes: number; href: string }>;
  technologies: Array<{ slug: string; name: string; progressPercent: number }>;
  degraded: string[];
}

export function getDashboard(): Promise<DashboardView> {
  return authorized<DashboardView>('/me/dashboard');
}

export interface BoostPreview {
  available: boolean;
  targetSkills: Array<{ id: string; name: string; mastery: number; reason: string }>;
  suggestedMinutes: number;
  reason?: string;
}

export function getBoostPreview(): Promise<BoostPreview> {
  return authorized<BoostPreview>('/me/boost/preview');
}
