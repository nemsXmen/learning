import { BadRequestException } from '@nestjs/common';
import { ContentController } from './content.controller';
import { SlugParam } from './slug.pipe';

describe('SlugParam', () => {
  const pipe = SlugParam;

  it.each(['javascript', 'type-inference', 'js2', 'a'])('accepts %s', (value) => {
    expect(pipe.transform(value)).toBe(value);
  });

  it.each([
    '../../etc/passwd',
    'java script',
    'Javascript',
    '-leading',
    'trailing-',
    'double--dash',
    '',
  ])('rejects %s', (value) => {
    expect(() => pipe.transform(value)).toThrow(BadRequestException);
  });

  it('reports a stable error code', () => {
    expect(() => pipe.transform('../x')).toThrow(
      expect.objectContaining({ response: expect.objectContaining({ code: 'INVALID_SLUG' }) }),
    );
  });
});

const REQUEST = { user: { sub: 'user-1', email: 'a@b.c' } } as never;

describe('ContentController', () => {
  const service = {
    getChapter: jest.fn(async () => ({ id: 'javascript-closures' })),
    getQuiz: jest.fn(async () => ({ quizId: 'javascript-closures-quiz' })),
  };
  const access = { requireUnlockedBySlug: jest.fn(async () => ({ id: 'javascript-closures' })) };
  const controller = new ContentController(service as never, access as never);

  beforeEach(() => {
    service.getChapter.mockClear();
    service.getQuiz.mockClear();
    access.requireUnlockedBySlug.mockClear();
  });

  it('forwards both slugs to the chapter service', async () => {
    await expect(controller.getChapter(REQUEST, 'javascript', 'closures')).resolves.toEqual({
      id: 'javascript-closures',
    });
    expect(service.getChapter).toHaveBeenCalledWith('javascript', 'closures');
  });

  it('forwards both slugs to the quiz service', async () => {
    await expect(controller.getQuiz(REQUEST, 'javascript', 'closures')).resolves.toEqual({
      quizId: 'javascript-closures-quiz',
    });
    expect(service.getQuiz).toHaveBeenCalledWith('javascript', 'closures');
  });

  it('checks the lock before serving anything', async () => {
    await controller.getChapter(REQUEST, 'javascript', 'closures');
    expect(access.requireUnlockedBySlug).toHaveBeenCalledWith('user-1', 'javascript', 'closures');
  });
});
