import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import {
  carts,
  cartItems,
  products,
  productVariants,
  users,
} from '../db/schema';
import type {
  AddToCartDto,
  UpdateCartItemDto,
  CartResponse,
} from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(@Inject(DB) private db: NeonHttpDatabase<typeof schema>) {}

  /**
   * Validates that the authenticated user exists in the users table.
   * This prevents foreign key constraint errors when non-customer users
   * (e.g., admins from the admins table) try to access cart.
   *
   * @throws UnauthorizedException if user does not exist in users table
   */
  private async validateUserExists(userId: string): Promise<void> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new UnauthorizedException('User account not found');
    }
  }

  private async getOrCreateCart(userId: string): Promise<string> {
    // Validate user exists before attempting to create/fetch cart
    await this.validateUserExists(userId);

    const [existingCart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (existingCart) {
      return existingCart.id;
    }

    const [newCart] = await this.db
      .insert(carts)
      .values({
        userId,
      })
      .returning();

    return newCart.id;
  }

  async getCart(userId: string): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);

    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId));

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const items = await this.db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    return {
      id: cart.id,
      userId: cart.userId,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<CartResponse> {
    // Validate product exists
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, dto.productId));

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.variantId) {
      const [variant] = await this.db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, dto.variantId));

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      if (variant.productId !== dto.productId) {
        throw new BadRequestException(
          'Variant does not belong to the specified product',
        );
      }
    }

    const cartId = await this.getOrCreateCart(userId);

    const existingItem = await this.db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, dto.productId),
          dto.variantId
            ? eq(cartItems.variantId, dto.variantId)
            : isNull(cartItems.variantId),
        ),
      );

    if (existingItem.length > 0) {
      const item = existingItem[0];
      const newQuantity = item.quantity + dto.quantity;

      if (newQuantity > 1000) {
        throw new BadRequestException(
          'Total quantity would exceed maximum limit of 1000',
        );
      }

      await this.db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, item.id));
    } else {
      await this.db.insert(cartItems).values({
        cartId,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const [item] = await this.db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, cartItemId));

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, item.cartId));

    if (!cart || cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.db
      .update(cartItems)
      .set({
        quantity: dto.quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId));

    return this.getCart(userId);
  }

  async removeFromCart(
    userId: string,
    cartItemId: string,
  ): Promise<CartResponse> {
    const [item] = await this.db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, cartItemId));

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, item.cartId));

    if (!cart || cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);

    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId));

    if (!cart || cart.userId !== userId) {
      throw new NotFoundException('Cart not found');
    }

    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    return this.getCart(userId);
  }
}
