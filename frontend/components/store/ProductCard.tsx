"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useIsInCart } from "@/stores/cart-store";

export interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string;
  category?: string;
  categoryLabel?: string;
  brand?: string;
  partType?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isAdded = useIsInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const productUrl = `/products/${product.id}`;

  return (
    <div className="group/card flex flex-col rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      <Link href={productUrl} className="block relative w-full aspect-[3/4] bg-[#0a0a0a] shrink-0 p-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          className="object-contain mix-blend-screen p-4 group-hover/card:scale-110 transition-transform duration-500"
        />
      </Link>
      <div className="flex flex-col p-4 grow">
        {product.brand && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#992222] mb-0.5 truncate">
            {product.brand}
          </p>
        )}
        <Link href={productUrl}>
          <h3 className="text-[13px] font-medium text-white line-clamp-2 h-[40px] mb-1 hover:text-[#992222] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-lg font-bold text-[#992222] mb-2">{product.price}</p>
        <div className="mt-auto flex w-full gap-2 transition-all duration-300">
          <Link
            href={productUrl}
            className={`${isAdded ? "w-full" : "w-[70%]"} flex items-center justify-center rounded-full bg-[#640C0C] py-2.5 text-[13px] font-medium text-white transition-all duration-300 hover:opacity-90`}
          >
            Buy Now
          </Link>
          {!isAdded && (
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="grid w-[30%] place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#640C0C]"
            >
              <img src="/shopping-bag.svg" alt="cart" className="h-5 w-5 brightness-0 invert opacity-80" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
