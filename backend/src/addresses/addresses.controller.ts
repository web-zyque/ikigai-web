import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AddressesService } from './addresses.service';
import {
  CreateAddressSchema,
  UpdateAddressSchema,
  AddressIdSchema,
  type CreateAddressDto,
  type UpdateAddressDto,
} from './dto/address.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user?: { id: string; role?: string };
}

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@Request() req: AuthenticatedRequest) {
    return this.addressesService.list(this.getUserId(req));
  }

  @Get(':id')
  get(@Request() req: AuthenticatedRequest, @Param('id', new ZodValidationPipe(AddressIdSchema)) addressId: string) {
    return this.addressesService.get(this.getUserId(req), addressId);
  }

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(CreateAddressSchema)) dto: CreateAddressDto,
  ) {
    return this.addressesService.create(this.getUserId(req), dto);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ZodValidationPipe(AddressIdSchema)) addressId: string,
    @Body(new ZodValidationPipe(UpdateAddressSchema)) dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(this.getUserId(req), addressId, dto);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id', new ZodValidationPipe(AddressIdSchema)) addressId: string) {
    return this.addressesService.remove(this.getUserId(req), addressId);
  }

  @Patch(':id/default')
  setDefault(@Request() req: AuthenticatedRequest, @Param('id', new ZodValidationPipe(AddressIdSchema)) addressId: string) {
    return this.addressesService.setDefault(this.getUserId(req), addressId);
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }
}
