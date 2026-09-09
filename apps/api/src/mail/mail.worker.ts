import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { env } from '../config/env';
import { EMAIL_QUEUE, MailTransport, type SendMailJob } from './mail.service';

/**
 * Drains the email queue. Failures are retried with backoff by BullMQ; a message
 * that exhausts its attempts is logged with its template, never with its token.
 */
@Injectable()
export class MailWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailWorker.name);
  private worker: Worker<SendMailJob> | null = null;

  constructor(private readonly transport: MailTransport) {}

  onModuleInit(): void {
    this.worker = new Worker<SendMailJob>(
      EMAIL_QUEUE,
      async (job) => this.transport.send(job.data),
      { connection: { url: env.REDIS_URL }, concurrency: 3 },
    );

    this.worker.on('failed', (job, error) => {
      this.logger.warn(
        `Échec d'envoi « ${job?.data.template ?? 'inconnu'} » (tentative ${job?.attemptsMade ?? 0}) : ${error.message}`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
