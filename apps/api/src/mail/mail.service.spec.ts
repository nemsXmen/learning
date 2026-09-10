import { MailService, type SendMailJob } from './mail.service';

// The driver is read from the parsed env at construction, so the module has to be
// re-imported per driver rather than mutated in place.
jest.mock('../config/env', () => ({
  env: {
    MAIL_DRIVER: 'inline',
    REDIS_URL: 'redis://localhost:6379',
    SMTP_HOST: 'localhost',
    SMTP_PORT: 1025,
    SMTP_SECURE: false,
    SMTP_USER: '',
    SMTP_PASSWORD: '',
    MAIL_FROM: 'Atelier <no-reply@example.com>',
  },
}));

const job: SendMailJob = {
  template: 'verify-email',
  to: 'nehemia@example.com',
  variables: { displayName: 'Nehemia', link: 'http://localhost:3000/v?token=x' },
};

function transportStub(behaviour: { failures?: number } = {}) {
  let remaining = behaviour.failures ?? 0;
  return {
    calls: 0,
    send: jest.fn(async function send(this: void): Promise<void> {
      if (remaining > 0) {
        remaining -= 1;
        throw new Error('SMTP indisponible');
      }
    }),
    verifyConnection: jest.fn(async () => true),
  };
}

describe('MailService (driver inline)', () => {
  it('sends through SMTP without touching a queue', async () => {
    const transport = transportStub();
    await new MailService(transport as never).enqueue(job);

    expect(transport.send).toHaveBeenCalledTimes(1);
    expect(transport.send).toHaveBeenCalledWith(job);
  });

  it('awaits the send: fire-and-forget would be killed with the function', async () => {
    const order: string[] = [];
    const transport = {
      send: jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        order.push('sent');
      }),
      verifyConnection: jest.fn(),
    };

    await new MailService(transport as never).enqueue(job);
    order.push('returned');

    expect(order).toEqual(['sent', 'returned']);
  });

  it('retries once on a transient failure', async () => {
    const transport = transportStub({ failures: 1 });
    await new MailService(transport as never).enqueue(job);
    expect(transport.send).toHaveBeenCalledTimes(2);
  });

  it('never fails the action that triggered it, even when SMTP stays down', async () => {
    const transport = transportStub({ failures: 99 });
    // A registration must not fail because a mail server did.
    await expect(new MailService(transport as never).enqueue(job)).resolves.toBeUndefined();
    expect(transport.send).toHaveBeenCalledTimes(2);
  });

  it('gives up after the bounded attempts: a user is waiting', async () => {
    const transport = transportStub({ failures: 99 });
    const started = Date.now();
    await new MailService(transport as never).enqueue(job);
    // Two attempts and one short delay, not an unbounded retry loop.
    expect(Date.now() - started).toBeLessThan(3000);
  });
});
