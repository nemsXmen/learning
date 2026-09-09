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

export interface TechnologyDetail {
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
