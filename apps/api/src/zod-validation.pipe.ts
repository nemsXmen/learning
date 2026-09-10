import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import type { ZodError } from 'zod';

export { createZodDto } from 'nestjs-zod';

/**
 * The global validation pipe (registered as `APP_PIPE` in AppModule).
 *
 * It validates any parameter whose type is a `createZodDto` class and leaves
 * everything else untouched, so route parameters keep their own explicit pipes.
 *
 * The exception is ours rather than the library's default: `apps/web` reads
 * `fields` to place errors under the right input, and that contract predates
 * this pipe (features/04-authentication/CONTRACT.md).
 */
export const ZodValidationPipe = createZodValidationPipe({
  // The library types the argument as `unknown`; it is always a ZodError.
  createValidationException: (error: unknown) =>
    new BadRequestException({
      code: 'VALIDATION_FAILED',
      fields: (error as ZodError).issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    }),
});
