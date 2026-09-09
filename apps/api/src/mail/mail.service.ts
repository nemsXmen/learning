import { Injectable, Logger } from '@nestjs/common';
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

/**
 * Mail is enqueued, never awaited in a request (docs/rules.md #34). A slow or
 * dead SMTP server delays a message; it never delays a registration.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly queue: Queue<SendMailJob>;

  constructor() {
    this.queue = new Queue<SendMailJob>(EMAIL_QUEUE, {
      connection: { url: env.REDIS_URL },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }

  /** Never throws into the caller: a queue outage must not fail the user's action. */
  async enqueue(job: SendMailJob): Promise<void> {
    try {
      await this.queue.add(job.template, job);
    } catch (error) {
      this.logger.error(
        `Mise en file impossible pour « ${job.template} » : ${(error as Error).message}`,
      );
    }
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}

/**
 * The SMTP side, used by the queue worker. Kept apart from `MailService` so the
 * request path never even constructs a transport.
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

    // The recipient is logged as a hash: an address is personal data (CDC §53).
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
