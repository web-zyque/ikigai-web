"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart } = useCart();

  const isAdded = cartItems.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdded) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="relative group/card flex flex-col rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />
      
      <div className="relative w-full aspect-[3/4] bg-[#0a0a0a] shrink-0 p-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain mix-blend-screen p-4 group-hover/card:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="relative flex flex-col p-4 grow z-20 pointer-events-none">
        <h3 className="text-[13px] font-medium text-white line-clamp-2 h-[40px] mb-1 group-hover/card:text-white/80 transition-colors">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-[#640C0C] mb-2">{product.price}</p>
        <div className="mt-auto flex w-full gap-2 transition-all duration-300 pointer-events-auto">
          <Link
            href={`/products/${product.id}`}
            className={`${isAdded ? 'w-full' : 'w-[70%]'} flex items-center justify-center rounded-full bg-[#640C0C] py-2.5 text-center text-[13px] font-medium text-white transition-opacity hover:opacity-90`}
          >
            Buy Now
          </Link>
          {!isAdded && (
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="grid w-[30%] place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#640C0C]"
            >
              <ShoppingBag className="h-5 w-5 opacity-80" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
