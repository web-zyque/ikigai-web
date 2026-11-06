import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import {
  carts,
  cartItems,
  cartMergeRequests,
  products,
  productVariants,
  users,
} from '../db/schema';
import type {
  AddToCartDto,
  MergeGuestCartDto,
  UpdateCartItemDto,
  CartResponse,
} from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(@Inject(DB) private db: NeonDatabase<typeof schema>) {}


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
    
    await this.validateUserExists(userId);

    const [newCart] = await this.db
      .insert(carts)
      .values({ userId })
      .onConflictDoNothing({ target: carts.userId })
      .returning();

    if (newCart) return newCart.id;

    const [existingCart] = await this.db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!existingCart) throw new NotFoundException('Cart not found');
    return existingCart.id;
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

  async mergeGuestCart(
    userId: string,
    dto: MergeGuestCartDto,
  ): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);
    const aggregated = new Map<
      string,
      { productId: string; variantId: string | null; quantity: number }
    >();

    for (const item of dto.items) {
      const variantId = item.variantId ?? null;
      const key = `${item.productId}:${variantId ?? ''}`;
      const existing = aggregated.get(key);
      const quantity = (existing?.quantity ?? 0) + item.quantity;
      if (quantity > 1000) {
        throw new BadRequestException(
          'Total quantity would exceed maximum limit of 1000',
        );
      }
      aggregated.set(key, { productId: item.productId, variantId, quantity });
    }

    const lines = [...aggregated.values()].sort((a, b) =>
      `${a.productId}:${a.variantId ?? ''}`.localeCompare(
        `${b.productId}:${b.variantId ?? ''}`,
      ),
    );
    const payloadHash = createHash('sha256')
      .update(JSON.stringify(lines))
      .digest('hex');

    return this.db.transaction(async (tx) => {
      const [cart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.id, cartId))
        .for('update');
      if (!cart) throw new NotFoundException('Cart not found');

      const [previousMerge] = await tx
        .select()
        .from(cartMergeRequests)
        .where(
          and(
            eq(cartMergeRequests.userId, userId),
            eq(cartMergeRequests.guestCartId, dto.guestCartId),
          ),
        );

      if (previousMerge) {
        if (previousMerge.payloadHash !== payloadHash) {
          throw new ConflictException(
            'This guest cart ID was already used with different cart contents',
          );
        }
      } else {
        await tx.insert(cartMergeRequests).values({
          userId,
          guestCartId: dto.guestCartId,
          payloadHash,
        });

        for (const line of lines) {
          const [product] = await tx
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, line.productId));
          if (!product) {
            throw new NotFoundException(`Product ${line.productId} not found`);
          }

          if (line.variantId) {
            const [variant] = await tx
              .select({
                id: productVariants.id,
                productId: productVariants.productId,
              })
              .from(productVariants)
              .where(eq(productVariants.id, line.variantId));
            if (!variant) {
              throw new NotFoundException(
                `Variant ${line.variantId} not found`,
              );
            }
            if (variant.productId !== line.productId) {
              throw new BadRequestException(
                'Variant does not belong to the specified product',
              );
            }
          }

          const [existingItem] = await tx
            .select()
            .from(cartItems)
            .where(
              and(
                eq(cartItems.cartId, cartId),
                eq(cartItems.productId, line.productId),
                line.variantId
                  ? eq(cartItems.variantId, line.variantId)
                  : isNull(cartItems.variantId),
              ),
            );

          const quantity = (existingItem?.quantity ?? 0) + line.quantity;
          if (quantity > 1000) {
            throw new BadRequestException(
              'Total quantity would exceed maximum limit of 1000',
            );
          }

          if (existingItem) {
            await tx
              .update(cartItems)
              .set({ quantity, updatedAt: new Date() })
              .where(eq(cartItems.id, existingItem.id));
          } else {
            await tx.insert(cartItems).values({
              cartId,
              productId: line.productId,
              variantId: line.variantId,
              quantity: line.quantity,
            });
          }
        }

        await tx
          .update(carts)
          .set({ updatedAt: new Date() })
          .where(eq(carts.id, cartId));
      }

      const items = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId));
      const [updatedCart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.id, cartId));

      return {
        id: updatedCart.id,
        userId: updatedCart.userId,
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        createdAt: updatedCart.createdAt,
        updatedAt: updatedCart.updatedAt,
      };
    });
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

    await this.db.transaction(async (tx) => {
      await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.id, cartId))
        .for('update');
      const [existingItem] = await tx
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
      const newQuantity = (existingItem?.quantity ?? 0) + dto.quantity;
      if (newQuantity > 1000) {
        throw new BadRequestException(
          'Total quantity would exceed maximum limit of 1000',
        );
      }

      if (existingItem) {
        await tx
          .update(cartItems)
          .set({ quantity: newQuantity, updatedAt: new Date() })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        await tx.insert(cartItems).values({
          cartId,
          productId: dto.productId,
          variantId: dto.variantId,
          quantity: dto.quantity,
        });
      }
    });

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

    await this.db.transaction(async (tx) => {
      await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.id, cart.id))
        .for('update');
      await tx
        .update(cartItems)
        .set({ quantity: dto.quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, cartItemId));
      await tx
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id));
    });

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

    await this.db.transaction(async (tx) => {
      await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.id, cart.id))
        .for('update');
      await tx.delete(cartItems).where(eq(cartItems.id, cartItemId));
      await tx
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id));
    });

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

    await this.db.transaction(async (tx) => {
      await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.id, cartId))
        .for('update');
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
      await tx
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cartId));
    });

    return this.getCart(userId);
  }
}
