import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { createTransport, type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { renderTemplate, type MailTemplate, type TemplateVariables } from './templates';

export const EMAIL_QUEUE = 'email';

export interface SendMailJob {
  template: MailTemplate;
  to: string;
  variables: TemplateVariables;
}

/** Inline retries stay bounded: a user is waiting on the other side. */
const INLINE_ATTEMPTS = 2;
const INLINE_RETRY_DELAY_MS = 500;

/**
 * The SMTP side. Kept apart from `MailService` so the queue driver never even
 * constructs a transport in the request path.
 */
@Injectable()
export class MailTransport {
  private readonly logger = new Logger(MailTransport.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
    });
  }

  async send(job: SendMailJob): Promise<void> {
    const rendered = renderTemplate(job.template, job.variables);

    await this.transporter.sendMail({
      from: env.MAIL_FROM,
      to: job.to,
      subject: rendered.subject,
      // Both parts, always: a text-only client must still be able to act.
      text: rendered.text,
      html: rendered.html,
    });

    // The recipient is not logged: an address is personal data (CDC §53).
    this.logger.log(`Message « ${job.template} » envoyé`);
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.warn(`SMTP injoignable : ${(error as Error).message}`);
      return false;
    }
  }
}

/**
 * Two ways to send, chosen by `MAIL_DRIVER`.
 *
 * `queue` is the better one: BullMQ retries with backoff and nothing blocks the
 * request (docs/rules.md #34). It needs a worker, which needs a long-lived
 * process — a serverless function is frozen once it responds, so jobs would pile
 * up unconsumed.
 *
 * `inline` is the default because it works everywhere. It awaits the send, which
 * it must: fire-and-forget would be killed with the function. The cost is real
 * and deliberate — the caller waits for SMTP, and a message that fails both
 * attempts is lost, since there is no queue to retry it.
 *
 * Either way a mail failure never fails the action that triggered it.
 */
@Injectable()
export class MailService implements OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly queue: Queue<SendMailJob> | null;

  constructor(private readonly transport: MailTransport) {
    this.queue =
      env.MAIL_DRIVER === 'queue'
        ? new Queue<SendMailJob>(EMAIL_QUEUE, {
            connection: { url: env.REDIS_URL },
            defaultJobOptions: {
              attempts: 5,
              backoff: { type: 'exponential', delay: 2000 },
              removeOnComplete: 100,
              removeOnFail: 500,
            },
          })
        : null;

    this.logger.log(`Envoi des messages en mode « ${env.MAIL_DRIVER} »`);
  }

  async enqueue(job: SendMailJob): Promise<void> {
    if (this.queue) {
      try {
        await this.queue.add(job.template, job);
      } catch (error) {
        this.logger.error(
          `Mise en file impossible pour « ${job.template} » : ${(error as Error).message}`,
        );
      }
      return;
    }

    await this.sendInline(job);
  }

  private async sendInline(job: SendMailJob): Promise<void> {
    for (let attempt = 1; attempt <= INLINE_ATTEMPTS; attempt += 1) {
      try {
        await this.transport.send(job);
        return;
      } catch (error) {
        const last = attempt === INLINE_ATTEMPTS;
        this.logger.warn(
          `Envoi « ${job.template} » échoué (tentative ${attempt}/${INLINE_ATTEMPTS}) : ${(error as Error).message}`,
        );
        if (last) {
          // Swallowed on purpose: a registration must not fail because SMTP did.
          // Without a queue there is no later retry — that is the cost of `inline`.
          this.logger.error(`Message « ${job.template} » perdu : aucun réessai différé en mode inline`);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, INLINE_RETRY_DELAY_MS));
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue?.close();
  }
}
