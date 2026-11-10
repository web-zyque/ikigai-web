import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard, JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';
import { CashfreeAttemptSchema, CashfreeRetrySchema, type CashfreeAttemptDto, type CashfreeRetryDto } from './dto/payments.dto';
import { PaymentsService } from './payments.service';

type AuthenticatedRequest = Request & { user?: { id: string } };
const uuidSchema = z.string().uuid();

@Controller('payments/cashfree')
@UseGuards(JwtAuthGuard)
export class CashfreePaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('create')
  create(@Req() request: AuthenticatedRequest, @Body(new ZodValidationPipe(CashfreeAttemptSchema)) dto: CashfreeAttemptDto) {
    return this.payments.createAttempt(request.user!.id, dto.orderId, dto.idempotencyKey);
  }

  @Post('retry/:orderId')
  retry(
    @Req() request: AuthenticatedRequest,
    @Param('orderId', new ZodValidationPipe(uuidSchema)) orderId: string,
    @Body(new ZodValidationPipe(CashfreeRetrySchema)) dto: CashfreeRetryDto,
  ) {
    return this.payments.retry(request.user!.id, orderId, dto.idempotencyKey);
  }

  @Get('verify/:orderId')
  verify(@Req() request: AuthenticatedRequest, @Param('orderId', new ZodValidationPipe(uuidSchema)) orderId: string) {
    return this.payments.verify(request.user!.id, orderId);
  }

  @Get('orders/:orderId')
  history(@Req() request: AuthenticatedRequest, @Param('orderId', new ZodValidationPipe(uuidSchema)) orderId: string) {
    return this.payments.listOrderPayments(request.user!.id, orderId);
  }
}

@Controller('payments/cashfree')
export class CashfreeWebhookController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('webhook')
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    if (!request.rawBody) throw new BadRequestException('Webhook raw body is unavailable');
    return this.payments.handleWebhook(request.rawBody, headers);
  }
}

@Controller('admin/payments/cashfree')
@UseGuards(AdminGuard)
export class AdminCashfreePaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get('orders/:orderId')
  orderPayments(@Param('orderId', new ZodValidationPipe(uuidSchema)) orderId: string) {
    return this.payments.listAdminOrderPayments(orderId);
  }

  @Post('refunds/:refundId/retry')
  retryRefund(@Param('refundId', new ZodValidationPipe(uuidSchema)) refundId: string) {
    return this.payments.retryRefund(refundId);
  }
}
