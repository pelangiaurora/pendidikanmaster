import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from './notification.service';
import { NotificationEvent } from './notification.constants';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  constructor(private notificationService: NotificationService) {
    super();
  }

  async process(job: Job) {
    const { event, to, data } = job.data;
    const recipient = Array.isArray(to) ? to[0] : to;

    console.log(`[Notification] Processing: ${event} → ${recipient}`);

    switch (event) {
      case NotificationEvent.WELCOME:
        await this.notificationService.sendWelcome(
          recipient,
          data.name,
          data.tenantName,
        );
        break;

      case NotificationEvent.PASSWORD_RESET:
        await this.notificationService.sendPasswordReset(
          recipient,
          data.name,
          data.resetUrl,
        );
        break;

      case NotificationEvent.INVOICE_CREATED:
        await this.notificationService.sendInvoice(recipient, data.name, data);
        break;

      case NotificationEvent.SPMB_RESULT:
        await this.notificationService.sendSpmbResult(
          recipient,
          data.name,
          data,
        );
        break;

      default:
        console.log(`[Notification] Unknown event: ${event}`);
    }
  }
}
