import { Module } from '@nestjs/common';
import { MailService, MailTransport } from './mail.service';
import { MailWorker } from './mail.worker';

@Module({
  providers: [MailService, MailTransport, MailWorker],
  exports: [MailService, MailTransport],
})
export class MailModule {}
