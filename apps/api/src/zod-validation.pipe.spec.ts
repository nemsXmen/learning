import { BadRequestException, type ArgumentMetadata } from '@nestjs/common';
import { z } from 'zod';
import { createZodDto, ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0),
});

class SampleDto extends createZodDto(schema) {}

const pipe = new ZodValidationPipe();

function metadata(metatype: unknown): ArgumentMetadata {
  return { type: 'body', metatype: metatype as ArgumentMetadata['metatype'], data: undefined };
}

describe('ZodValidationPipe (global)', () => {
  it('parses a valid body through the DTO schema', () => {
    expect(pipe.transform({ email: 'a@b.co', age: 30 }, metadata(SampleDto))).toEqual({
      email: 'a@b.co',
      age: 30,
    });
  });

  it('rejects an invalid body with our error shape', () => {
    // apps/web places errors under the right input using `fields`.
    let thrown: BadRequestException | null = null;
    try {
      pipe.transform({ email: 'pas-un-email', age: -1 }, metadata(SampleDto));
    } catch (error) {
      thrown = error as BadRequestException;
    }

    expect(thrown).toBeInstanceOf(BadRequestException);
    expect(thrown!.getResponse()).toMatchObject({ code: 'VALIDATION_FAILED' });

    const { fields } = thrown!.getResponse() as {
      fields: Array<{ path: string; message: string }>;
    };
    expect(fields.map((field) => field.path).sort()).toEqual(['age', 'email']);
    expect(fields.every((field) => field.message.length > 0)).toBe(true);
  });

  it('strips a property the schema does not declare', () => {
    expect(
      pipe.transform({ email: 'a@b.co', age: 30, isAdmin: true }, metadata(SampleDto)),
    ).toEqual({ email: 'a@b.co', age: 30 });
  });

  it('leaves a plain string parameter alone', () => {
    // Route params have a `String` metatype and no schema: they keep their own
    // explicit pipes, and the global one must not touch them.
    expect(pipe.transform('javascript', metadata(String))).toBe('javascript');
  });

  it('leaves a value alone when there is no metatype at all', () => {
    expect(pipe.transform({ anything: 1 }, metadata(undefined))).toEqual({ anything: 1 });
  });
});
