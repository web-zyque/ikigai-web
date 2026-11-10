import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CashfreePaymentsController, CashfreeWebhookController, AdminCashfreePaymentsController } from './payments.controller';
import { CashfreeService } from './cashfree.service';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuthModule],
  controllers: [CashfreePaymentsController, CashfreeWebhookController, AdminCashfreePaymentsController],
  providers: [CashfreeService, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
