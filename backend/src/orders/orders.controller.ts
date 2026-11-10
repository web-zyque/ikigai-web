import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AdminGuard, JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';
import {
  AdminOrderListSchema,
  AdminOrderRejectSchema,
  AdminOrderStatusSchema,
  CreateCancellationRequestSchema,
  CreateOrderSchema,
  ReviewCancellationSchema,
  type AdminOrderListDto,
  type AdminOrderRejectDto,
  type AdminOrderStatusDto,
  type CreateCancellationRequestDto,
  type CreateOrderDto,
  type ReviewCancellationDto,
} from './dto/order.dto';
import { OrdersService } from './orders.service';
import { PaymentsService } from '../payments/payments.service';

interface AuthenticatedRequest extends ExpressRequest {
  user?: { id: string; role?: string };
}

const uuidSchema = z.string().uuid('Invalid ID');

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body(new ZodValidationPipe(CreateOrderSchema)) dto: CreateOrderDto) {
    return this.ordersService.create(this.customerId(req), dto);
  }

  @Get()
  list(@Request() req: AuthenticatedRequest) {
    return this.ordersService.listCustomerOrders(this.customerId(req));
  }

  @Get(':id')
  get(@Request() req: AuthenticatedRequest, @Param('id', new ZodValidationPipe(uuidSchema)) id: string) {
    return this.ordersService.getCustomerOrder(this.customerId(req), id);
  }

  @Post(':id/cancellation-requests')
  requestCancellation(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(CreateCancellationRequestSchema)) dto: CreateCancellationRequestDto,
  ) {
    return this.ordersService.requestCancellation(this.customerId(req), id, dto);
  }

  private customerId(req: AuthenticatedRequest): string {
    if (!req.user?.id || req.user.role === 'ADMIN' || req.user.role === 'STAFF') {
      throw new UnauthorizedException('Customer authentication required');
    }
    return req.user.id;
  }
}

@Controller('admin/orders')
@UseGuards(AdminGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly paymentsService: PaymentsService) {}

  @Get('stats')
  stats() {
    return this.ordersService.getAdminStats();
  }

  @Get('cancellation-requests')
  cancellationRequests() {
    return this.ordersService.listPendingCancellationRequests();
  }

  @Patch('cancellation-requests/:id')
  async reviewCancellation(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(ReviewCancellationSchema)) dto: ReviewCancellationDto,
  ) {
    const result = await this.ordersService.reviewCancellation(this.adminId(req), id, dto);
    const refund = dto.decision === 'APPROVED'
      ? await this.paymentsService.processApprovedCancellation(id)
      : null;
    return { ...result, refund };
  }

  @Get()
  list(@Query(new ZodValidationPipe(AdminOrderListSchema)) query: AdminOrderListDto) {
    return this.ordersService.listAdminOrders(query);
  }

  @Get(':id')
  get(@Param('id', new ZodValidationPipe(uuidSchema)) id: string) {
    return this.ordersService.getAdminOrder(id);
  }

  @Patch(':id/confirm')
  confirm(@Request() req: AuthenticatedRequest, @Param('id', new ZodValidationPipe(uuidSchema)) id: string) {
    return this.ordersService.confirm(id, this.adminId(req));
  }

  @Patch(':id/reject')
  async reject(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(AdminOrderRejectSchema)) dto: AdminOrderRejectDto,
  ) {
    const result = await this.ordersService.reject(id, this.adminId(req), dto);
    const refund = await this.paymentsService.processAdminRejectedOrder(id, dto.reason);
    return { ...result, refund };
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ZodValidationPipe(uuidSchema)) id: string,
    @Body(new ZodValidationPipe(AdminOrderStatusSchema)) dto: AdminOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, this.adminId(req), dto);
  }

  private adminId(req: AuthenticatedRequest): string {
    if (!req.user?.id) throw new UnauthorizedException();
    return req.user.id;
  }
}
