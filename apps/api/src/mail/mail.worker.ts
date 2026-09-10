import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { env } from '../config/env';
import { EMAIL_QUEUE, MailTransport, type SendMailJob } from './mail.service';

/**
 * Drains the email queue — only under `MAIL_DRIVER=queue`.
 *
 * A worker holds a blocking Redis connection and waits for jobs, which needs a
 * process that stays alive. Starting one where nothing can keep it running (a
 * serverless function is frozen once it responds) would open a connection that
 * never consumes anything.
 */
@Injectable()
export class MailWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailWorker.name);
  private worker: Worker<SendMailJob> | null = null;

  constructor(private readonly transport: MailTransport) {}

  onModuleInit(): void {
    if (env.MAIL_DRIVER !== 'queue') return;

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

    this.logger.log('Worker e-mail démarré');
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
