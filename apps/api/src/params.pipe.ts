import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

/**
 * Route parameters are plain strings, so the global DTO pipe cannot see them:
 * their metatype is `String`, with no schema attached. They keep an explicit
 * pipe, declared once here rather than inlined at each call site.
 */
@Injectable()
class ParamPipe implements PipeTransform<string, string> {
  constructor(
    private readonly schema: ZodTypeAny,
    private readonly code: string,
  ) {}

  transform(value: string): string {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data as string;

    throw new BadRequestException({
      code: this.code,
      message: `Paramètre invalide : ${value}`,
    });
  }
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** A slug, and nothing that could be read as a path. */
export const SlugParam = new ParamPipe(z.string().regex(SLUG), 'INVALID_SLUG');

/** A content id: same shape as a slug, longer. */
export const ContentIdParam = new ParamPipe(z.string().regex(SLUG).max(96), 'INVALID_ID');

export const UuidParam = new ParamPipe(z.string().uuid(), 'INVALID_ID');
