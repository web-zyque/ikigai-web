import type { QueryClient } from "@tanstack/react-query";
import { cartKeys } from "@/hooks/auth/cart.keys";
import { productsApi } from "@/services/products.service";
import { cartService, type CartResponse } from "@/services/cart.service";
import { useCartStore, type CartItem } from "@/stores/cart-store";

const inFlightSyncs = new Map<string, Promise<CartResponse>>();

function enrichCart(cart: CartResponse): Promise<CartItem[]> {
  const productIds = [...new Set(cart.items.map((item) => item.productId))];
  return Promise.all(
    productIds.map((id) => productsApi.getById(id).catch(() => null)),
  ).then((products) => {
    const productsById = new Map(
      products.filter((product) => product).map((product) => [product!.id, product!]),
    );

    return cart.items.map((item) => {
      const product = productsById.get(item.productId);
      const variant = product?.variants?.find((candidate) => candidate.id === item.variantId);
      const image = variant?.images?.[0]?.imageUrl
        ?? product?.images?.find((candidate) => candidate.variantId === item.variantId)?.imageUrl
        ?? product?.images?.[0]?.imageUrl
        ?? "";

      return {
        id: item.id,
        name: product?.name || "Unknown Product",
        price: Number.parseFloat(product?.sellingPrice || "0"),
        image,
        color: variant?.colorName ?? product?.color ?? "Default",
        quantity: item.quantity,
        variantId: item.variantId || undefined,
      };
    });
  });
}

async function applyServerCart(
  userId: string,
  cart: CartResponse,
  queryClient: QueryClient,
  mergedGuestCartId?: string,
  expectedSessionVersion = useCartStore.getState().sessionVersion,
) {
  const items = await enrichCart(cart);
  useCartStore.getState().setServerCart(
    userId,
    items,
    mergedGuestCartId,
    expectedSessionVersion,
  );
  queryClient.setQueryData(cartKeys.user(userId), cart);
  return cart;
}

export async function synchronizeAuthenticatedCart(
  userId: string,
  queryClient: QueryClient,
): Promise<CartResponse> {
  const active = inFlightSyncs.get(userId);
  if (active) return active;

  const pending = useCartStore.getState().pendingGuestCart;
  const sessionVersion = useCartStore.getState().sessionVersion;
  const sync = (async () => {
    useCartStore.getState().setSyncError(null);
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const cart = pending
          ? await cartService.mergeGuestCart(pending)
          : await cartService.getCart();
        return await applyServerCart(
          userId,
          cart,
          queryClient,
          pending?.guestCartId,
          sessionVersion,
        );
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
        }
      }
    }

    useCartStore.getState().setSyncError(
      "We couldn't sync your cart yet. Your guest cart is saved; try again.",
    );
    throw lastError;
  })();

  inFlightSyncs.set(userId, sync);
  try {
    return await sync;
  } finally {
    inFlightSyncs.delete(userId);
  }
}

export async function applyAuthenticatedCart(
  userId: string,
  cart: CartResponse,
  queryClient: QueryClient,
) {
  const sessionVersion = useCartStore.getState().sessionVersion;
  return applyServerCart(userId, cart, queryClient, undefined, sessionVersion);
}
