import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import { carts, cartItems, products, productVariants, productImages } from '../db/schema';
import type { AddToCartDto } from './dto/add-to-cart.dto';
import type { UpdateCartItemDto } from './dto/update-cart-item.dto';
import type { MergeCartItemDto } from './dto/merge-cart.dto';
import type { CartResponse, CartItemResponse } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(@Inject(DB) private db: NeonHttpDatabase<typeof schema>) {}

  async getOrCreateCart(userId: string): Promise<string> {
    const [existing] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (existing) {
      return existing.id;
    }

    const [newCart] = await this.db
      .insert(carts)
      .values({ userId })
      .returning();

    return newCart.id;
  }

  async getCart(userId: string): Promise<CartResponse> {
    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const items = await this.getCartItems(cart.id);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  private async getCartItems(cartId: string): Promise<CartItemResponse[]> {
    const rawItems = await this.db
      .select({
        cartItemId: cartItems.id,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        productName: products.name,
        sellingPrice: products.sellingPrice,
        colorName: productVariants.colorName,
        variantInternalId: productVariants.id,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .where(eq(cartItems.cartId, cartId));

    // For each cart item, fetch the main image
    const items: CartItemResponse[] = [];

    for (const item of rawItems) {
      if (!item.productName) {
        // Product deleted or doesn't exist, skip this item
        continue;
      }

      // Get main image for product
      const [mainImage] = await this.db
        .select()
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, item.productId),
            eq(productImages.isMainImage, true)
          )
        )
        .limit(1);

      items.push({
        id: item.cartItemId,
        productId: item.productId,
        product: {
          id: item.productId,
          name: item.productName,
          sellingPrice: (item.sellingPrice || '0').toString(),
          mainImage: mainImage
            ? {
                imageUrl: mainImage.imageUrl,
                altText: mainImage.altText || undefined,
              }
            : undefined,
        },
        variantId: item.variantId || undefined,
        variant:
          item.variantInternalId && item.colorName
            ? {
                id: item.variantInternalId,
                colorName: item.colorName,
              }
            : undefined,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    return items;
  }

  async addToCart(
    userId: string,
    dto: AddToCartDto
  ): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);

    // Validate product exists and is active
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, dto.productId));

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (product.publicationStatus !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    // Validate variant if provided
    if (dto.variantId) {
      const [variant] = await this.db
        .select()
        .from(productVariants)
        .where(
          and(
            eq(productVariants.id, dto.variantId),
            eq(productVariants.productId, dto.productId)
          )
        );

      if (!variant) {
        throw new BadRequestException('Variant not found for this product');
      }
    }

    // Check if item already in cart
    const [existing] = await this.db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, dto.productId),
          dto.variantId ? eq(cartItems.variantId, dto.variantId) : isNull(cartItems.variantId)
        )
      );

    if (existing) {
      // Update quantity
      await this.db
        .update(cartItems)
        .set({
          quantity: existing.quantity + dto.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existing.id));
    } else {
      // Insert new item
      await this.db.insert(cartItems).values({
        cartId,
        productId: dto.productId,
        variantId: dto.variantId || null,
        quantity: dto.quantity,
      });
    }

    // Update cart updatedAt
    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto
  ): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);

    // Verify item belongs to user's cart
    const [item] = await this.db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId))
      );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.db
      .update(cartItems)
      .set({
        quantity: dto.quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId));

    // Update cart updatedAt
    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, itemId: string): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);

    // Verify item belongs to user's cart
    const [item] = await this.db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId))
      );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.db
      .delete(cartItems)
      .where(eq(cartItems.id, itemId));

    // Update cart updatedAt
    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);

    await this.db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cartId));

    // Update cart updatedAt
    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    return this.getCart(userId);
  }

  async mergeGuestCart(
    userId: string,
    guestItems: MergeCartItemDto[]
  ): Promise<CartResponse> {
    const cartId = await this.getOrCreateCart(userId);

    for (const guestItem of guestItems) {
      // Validate product exists and is active
      const [product] = await this.db
        .select()
        .from(products)
        .where(eq(products.id, guestItem.productId));

      if (!product || product.publicationStatus !== 'active') {
        // Skip unavailable products
        continue;
      }

      // Validate variant if provided
      if (guestItem.variantId) {
        const [variant] = await this.db
          .select()
          .from(productVariants)
          .where(
            and(
              eq(productVariants.id, guestItem.variantId),
              eq(productVariants.productId, guestItem.productId)
            )
          );

        if (!variant) {
          // Skip invalid variants
          continue;
        }
      }

      // Check if item already in user's cart
      const [existing] = await this.db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cartId),
            eq(cartItems.productId, guestItem.productId),
            guestItem.variantId
              ? eq(cartItems.variantId, guestItem.variantId)
              : isNull(cartItems.variantId)
          )
        );

      if (existing) {
        // Sum quantities
        await this.db
          .update(cartItems)
          .set({
            quantity: existing.quantity + guestItem.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existing.id));
      } else {
        // Insert new item
        await this.db.insert(cartItems).values({
          cartId,
          productId: guestItem.productId,
          variantId: guestItem.variantId || null,
          quantity: guestItem.quantity,
        });
      }
    }

    // Update cart updatedAt
    await this.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    return this.getCart(userId);
  }
}
