import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CartService } from './cart.service';
import type { AddToCartDto } from './dto/add-to-cart.dto';
import { AddToCartSchema } from './dto/add-to-cart.dto';
import type { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UpdateCartItemSchema } from './dto/update-cart-item.dto';
import type { MergeCartDto } from './dto/merge-cart.dto';
import { MergeCartSchema } from './dto/merge-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: { user: { id: string } }) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @UsePipes(new ZodValidationPipe(AddToCartSchema))
  async addToCart(
    @Request() req: { user: { id: string } },
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch('items/:itemId')
  @UsePipes(new ZodValidationPipe(UpdateCartItemSchema))
  async updateCartItem(
    @Request() req: { user: { id: string } },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, itemId, dto);
  }

  @Delete('items/:itemId')
  async removeFromCart(
    @Request() req: { user: { id: string } },
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeFromCart(req.user.id, itemId);
  }

  @Delete()
  async clearCart(@Request() req: { user: { id: string } }) {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('merge')
  @UsePipes(new ZodValidationPipe(MergeCartSchema))
  async mergeGuestCart(
    @Request() req: { user: { id: string } },
    @Body() dto: MergeCartDto,
  ) {
    return this.cartService.mergeGuestCart(req.user.id, dto.items);
  }
}
