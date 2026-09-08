import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Rejects anything that is not a slug. Defence in depth: lookups already go
 * through the in-memory graph, so a traversal attempt could only ever 404 — but a
 * malformed slug should be refused, not searched for.
 */
@Injectable()
export class SlugValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string' || !SLUG.test(value)) {
      throw new BadRequestException({ code: 'INVALID_SLUG', message: `Slug invalide : ${value}` });
    }
    return value;
  }
}

export const SlugParam = new SlugValidationPipe();
