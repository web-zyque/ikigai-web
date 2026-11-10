import { and, asc, eq, gte, inArray, sql } from 'drizzle-orm';
import { products, productVariants } from '../db/schema';

export interface OrderInventoryLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  productName: string;
}

/** Lock and validate every inventory row before decrementing any of them. */
export async function deductOrderInventory(tx: any, orderLines: OrderInventoryLine[]) {
  const grouped = new Map<string, OrderInventoryLine>();
  for (const line of orderLines) {
    const key = line.variantId ? `variant:${line.variantId}` : `product:${line.productId}`;
    const existing = grouped.get(key);
    if (existing) existing.quantity += line.quantity;
    else grouped.set(key, { ...line });
  }
  const lines = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (!lines.length) return { unavailableProduct: 'Order has no items' };

  const productIds = [...new Set(lines.map(([, line]) => line.productId))].sort();
  const lockedProducts = await tx.select({
    id: products.id,
    publicationStatus: products.publicationStatus,
    stockQuantity: products.stockQuantity,
  }).from(products)
    .where(inArray(products.id, productIds))
    .orderBy(asc(products.id))
    .for('update');
  const productsById = new Map(lockedProducts.map((product: { id: string }) => [product.id, product]));
  for (const [, line] of lines) {
    const product = productsById.get(line.productId) as { publicationStatus: string; stockQuantity: number } | undefined;
    if (!product || product.publicationStatus !== 'active') return { unavailableProduct: line.productName };
  }

  const variantIds = lines.flatMap(([, line]) => line.variantId ? [line.variantId] : []).sort();
  const lockedVariants = variantIds.length
    ? await tx.select({ id: productVariants.id, productId: productVariants.productId, stockQuantity: productVariants.stockQuantity })
        .from(productVariants)
        .where(inArray(productVariants.id, variantIds))
        .orderBy(asc(productVariants.id))
        .for('update')
    : [];
  const variantsById = new Map(lockedVariants.map((variant: { id: string }) => [variant.id, variant]));

  for (const [, line] of lines) {
    const available = line.variantId
      ? (variantsById.get(line.variantId) as { productId: string; stockQuantity: number } | undefined)
      : (productsById.get(line.productId) as { stockQuantity: number } | undefined);
    if (!available || ('productId' in available && available.productId !== line.productId) || available.stockQuantity < line.quantity) {
      return { unavailableProduct: line.productName };
    }
  }

  for (const [, line] of lines) {
    const update = line.variantId
      ? await tx.update(productVariants)
          .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${line.quantity}`, updatedAt: new Date() })
          .where(and(eq(productVariants.id, line.variantId), eq(productVariants.productId, line.productId), gte(productVariants.stockQuantity, line.quantity)))
          .returning({ id: productVariants.id })
      : await tx.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${line.quantity}`, updatedAt: new Date() })
          .where(and(eq(products.id, line.productId), eq(products.publicationStatus, 'active'), gte(products.stockQuantity, line.quantity)))
          .returning({ id: products.id });
    if (!update.length) throw new Error(`Locked inventory row changed unexpectedly for ${line.productName}`);
  }
  return { unavailableProduct: null };
}
