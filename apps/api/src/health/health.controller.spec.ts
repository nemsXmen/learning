import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

function build(dbOk: boolean, redisOk: boolean) {
  const dataSource = {
    query: jest.fn(() => (dbOk ? Promise.resolve([{ '?column?': 1 }]) : Promise.reject(new Error('db')))),
  };
  const redis = {
    ping: jest.fn(() => (redisOk ? Promise.resolve('PONG') : Promise.reject(new Error('redis')))),
  };
  return new HealthController(dataSource as never, redis as never);
}

describe('HealthController', () => {
  it('reports ok when both dependencies answer', async () => {
    await expect(build(true, true).check()).resolves.toEqual({ status: 'ok', db: 'up', redis: 'up' });
  });

  it('names the failing dependency instead of reporting ok', async () => {
    await expect(build(true, false).check()).rejects.toThrow(ServiceUnavailableException);
    await expect(build(true, false).check()).rejects.toMatchObject({
      response: { status: 'degraded', db: 'up', redis: 'down' },
    });
  });

  it('reports a database outage', async () => {
    await expect(build(false, true).check()).rejects.toMatchObject({
      response: { db: 'down', redis: 'up' },
    });
  });
});
