import 'server-only';
import { getEnv } from './env';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** The whole payload: some refusals carry a reason the screen must show. */
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiRequest extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Access token, attached server-side. Never reaches a client component. */
  accessToken?: string;
}

/**
 * The only way `apps/web` reaches the API. Server-side by construction: the
 * module is `server-only`, so importing it from a client component fails the build.
 */
export async function apiFetch<T>(path: string, init: ApiRequest = {}): Promise<T> {
  const { body, accessToken, headers, ...rest } = init;

  const response = await fetch(new URL(path, getEnv().API_BASE_URL), {
    ...rest,
    headers: {
      accept: 'application/json',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { code?: string; message?: string } | null;
    throw new ApiError(
      response.status,
      payload?.code ?? 'UNKNOWN',
      payload?.message ?? `L'API a répondu ${response.status}`,
      payload,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
