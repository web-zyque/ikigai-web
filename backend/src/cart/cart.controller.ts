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
  UsePipes,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { AddToCartSchema, UpdateCartItemSchema } from './dto/cart.dto';
import { CartService } from './cart.service';

interface AuthenticatedRequest extends ExpressRequest {
  user?: { id: string; role?: string };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @UsePipes(new ZodValidationPipe(AddToCartSchema))
  async addToCart(
    @Request() req: AuthenticatedRequest,
    @Body() dto: AddToCartDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.cartService.addToCart(userId, dto);
  }

  @Patch('items/:id')
  @UsePipes(new ZodValidationPipe(UpdateCartItemSchema))
  async updateCartItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.cartService.updateCartItem(userId, cartItemId, dto);
  }

  @Delete('items/:id')
  async removeFromCart(
    @Request() req: AuthenticatedRequest,
    @Param('id') cartItemId: string,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.cartService.removeFromCart(userId, cartItemId);
  }

  @Delete()
  async clearCart(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.cartService.clearCart(userId);
  }
}
