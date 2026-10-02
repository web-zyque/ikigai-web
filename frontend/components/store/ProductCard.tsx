import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

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
  return (
    <div className="group/card flex flex-col rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      <div className="relative w-full aspect-[3/4] bg-[#0a0a0a] shrink-0 p-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain mix-blend-screen p-4 group-hover/card:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col p-4 grow">
        <h3 className="text-[13px] font-medium text-white line-clamp-2 h-[40px] mb-1">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-[#640C0C] mb-2">{product.price}</p>
        <div className="mt-auto flex w-full gap-2">
          <button className="w-[80%] rounded-full bg-[#640C0C] py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
            Buy Now
          </button>
          <button
            aria-label="Add to cart"
            className="grid w-[20%] place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ShoppingCart className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
}
