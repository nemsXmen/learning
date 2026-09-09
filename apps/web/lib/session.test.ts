import { afterEach, describe, expect, it } from 'vitest';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSession,
  cookieOptions,
  isProtectedPath,
  writeSession,
} from './session';

const original = process.env['SESSION_COOKIE_SECURE'];

afterEach(() => {
  process.env['SESSION_COOKIE_SECURE'] = original;
});

function cookieJar() {
  const set: Array<[string, string, ReturnType<typeof cookieOptions>]> = [];
  return {
    set,
    writer: {
      set: (name: string, value: string, options: ReturnType<typeof cookieOptions>) => {
        set.push([name, value, options]);
      },
    },
  };
}

describe('cookieOptions', () => {
  it('is httpOnly, first-party and SameSite=Lax', () => {
    const options = cookieOptions(900);
    // httpOnly is the whole point: script must not be able to read the token.
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
    expect(options.maxAge).toBe(900);
  });

  it('follows SESSION_COOKIE_SECURE', () => {
    process.env['SESSION_COOKIE_SECURE'] = 'true';
    expect(cookieOptions(1).secure).toBe(true);
    process.env['SESSION_COOKIE_SECURE'] = 'false';
    expect(cookieOptions(1).secure).toBe(false);
  });
});

describe('writeSession', () => {
  it('stores both tokens, the access cookie expiring with the token', () => {
    const jar = cookieJar();
    writeSession(jar.writer, { accessToken: 'a', refreshToken: 'r', expiresIn: 900 });

    const [access, refresh] = jar.set;
    expect(access?.[0]).toBe(ACCESS_COOKIE);
    expect(access?.[1]).toBe('a');
    expect(access?.[2].maxAge).toBe(900);

    expect(refresh?.[0]).toBe(REFRESH_COOKIE);
    expect(refresh?.[2].maxAge).toBe(60 * 60 * 24 * 30);
    expect(refresh?.[2].httpOnly).toBe(true);
  });
});

describe('clearSession', () => {
  it('expires both cookies with matching attributes', () => {
    const jar = cookieJar();
    clearSession(jar.writer);

    expect(jar.set.map(([name]) => name)).toEqual([ACCESS_COOKIE, REFRESH_COOKIE]);
    for (const [, value, options] of jar.set) {
      expect(value).toBe('');
      expect(options.maxAge).toBe(0);
      expect(options.path).toBe('/');
    }
  });
});

describe('isProtectedPath', () => {
  it.each(['/dashboard', '/dashboard/stats', '/learn', '/learn/javascript/closures', '/boost', '/profile'])(
    'protects %s',
    (path) => {
      expect(isProtectedPath(path)).toBe(true);
    },
  );

  it.each(['/', '/login', '/register', '/verify-email', '/design', '/learning-resources'])(
    'leaves %s public',
    (path) => {
      expect(isProtectedPath(path)).toBe(false);
    },
  );

  it('does not protect a path that merely starts with the same letters', () => {
    // `/learners` is not `/learn`.
    expect(isProtectedPath('/learners')).toBe(false);
  });
});
