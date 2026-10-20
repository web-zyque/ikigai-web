"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Truck, RotateCcw, ChevronRight, Plus, Minus, Share2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getStoreProductById, STORE_PRODUCTS } from "@/data/storeCatalog";
import ProductCard from "@/components/store/ProductCard";

export interface ProductDetailItem {
  id: string | number;
  name: string;
  price: string;
  mrpPrice?: string;
  image: string;
  images: string[];
  category: string;
  categoryLabel?: string;
  brand: string;
  description: string;
  features: string[];
  compatibility: string[];
  material?: string;
  warranty?: string;
  inStock: boolean;
  stockQuantity: number;
  partType?: string;
}

const colorVariants = [
  { name: "Matte Black", hex: "#171717", isLight: false },
  { name: "Gunmetal", hex: "#3f3f46", isLight: false },
  { name: "Crimson Red", hex: "#640C0C", isLight: false },
  { name: "Silver", hex: "#d4d4d8", isLight: true },
];

const tabs = [
  { id: "description", label: "Description" },
  { id: "features", label: "Key Features" },
  { id: "compatibility", label: "Compatibility" },
  { id: "shipping", label: "Shipping & Return" },
] as const;

const sizeVariants = ["15 inch", "16 inch", "17 inch", "18 inch", "19 inch"];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { cartItems, addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Matte Black");
  const [selectedSize, setSelectedSize] = useState("18 inch");
  const [activeTab, setActiveTab] = useState<"description" | "features" | "compatibility" | "shipping">("description");
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const productId = resolvedParams.id;

  // Retrieve the exact product details for the clicked product
  const product: ProductDetailItem | null = useMemo(() => {
    const found = getStoreProductById(productId);
    if (!found) return null;

    const rawImages = found.images?.length ? found.images : [found.image];
    return {
      id: found.id,
      name: found.name,
      price: found.price,
      mrpPrice: found.mrpPrice,
      image: found.image,
      images: rawImages,
      category: found.category,
      categoryLabel: found.categoryLabel,
      brand: found.brand,
      description: found.description || "Premium automotive upgrade engineered for precision fitment and performance.",
      features: found.features || [
        "Direct OEM replacement fitment",
        "Engineered for high stress and endurance",
        "Backed by Ikigai quality assurance guarantee",
      ],
      compatibility: found.vehicleCompatibility?.length ? found.vehicleCompatibility : ["Universal fitment"],
      material: found.material || "High-grade automotive alloy",
      warranty: found.warranty || "1 Year Limited Warranty",
      inStock: found.inStock ?? true,
      stockQuantity: found.stockQuantity ?? 10,
      partType: found.partType,
    };
  }, [productId]);

  const images = useMemo(() => {
    if (product?.images && product.images.length > 0) return product.images;
    if (product?.image) return [product.image];
    return ["/images/category_brakes.jpg"];
  }, [product]);

  const isAdded = useMemo(() => {
    if (!product) return false;
    return cartItems.some((item) => String(item.id) === String(product.id));
  }, [cartItems, product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const sameCategory = STORE_PRODUCTS.filter(
      (p) => String(p.id) !== String(product.id) && p.category === product.category
    );
    if (sameCategory.length >= 6) return sameCategory.slice(0, 6);

    const otherProducts = STORE_PRODUCTS.filter(
      (p) => String(p.id) !== String(product.id) && p.category !== product.category
    );
    return [...sameCategory, ...otherProducts].slice(0, 6);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-neutral-400 mb-6 text-center max-w-md">
          The product you are looking for does not exist or has been removed from the catalog.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse All Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: selectedColor,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-8">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-600" />
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-600" />
          <Link href={`/products?category=${product.category}`} className="capitalize hover:text-white transition-colors">
            {product.categoryLabel || product.category.replace("-", " ")}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-600" />
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-4/3 w-full rounded-[24px] bg-[#0a0a0a] border border-white/5 overflow-hidden flex items-center justify-center p-8 group">
              <Image
                src={images[selectedImageIndex] || product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain mix-blend-screen p-8 transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={handleShare}
                aria-label="Share product"
                className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl bg-[#0a0a0a] border transition-all overflow-hidden shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-[#640C0C] ring-2 ring-[#640C0C]/40"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain mix-blend-screen p-2"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-[24px] bg-[#121212] border border-white/5 p-6 mt-2">
              <div className="flex border-b border-white/10 gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative whitespace-nowrap ${
                      activeTab === tab.id ? "text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#640C0C] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-6">
                {activeTab === "description" && (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === "features" && (
                  <ul className="space-y-3">
                    {product.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#640C0C]/20 text-[#640C0C]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === "compatibility" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-400">Verified platform compatibility:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.compatibility?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs text-neutral-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#640C0C]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
                    <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-4">
                      <Truck className="w-5 h-5 text-[#640C0C] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Fast Nationwide Delivery</p>
                        <p className="text-xs text-neutral-400 mt-1">Dispatched within 24-48 hours with door-to-door courier tracking.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-4">
                      <RotateCcw className="w-5 h-5 text-[#640C0C] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Easy Hassle-free Returns</p>
                        <p className="text-xs text-neutral-400 mt-1">Eligible for 7-day replacement or return in original packaging.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            {product.brand && (
              <p className="text-xs font-semibold uppercase tracking-wider text-[#992222] mb-1">
                {product.brand}
              </p>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-2">
              {product.mrpPrice && (() => {
                const cleanPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, "")) || 0;
                const cleanMrp = parseFloat(product.mrpPrice.replace(/[^0-9.-]+/g, "")) || 0;
                const discount = cleanMrp > cleanPrice ? Math.round(((cleanMrp - cleanPrice) / cleanMrp) * 100) : 0;
                return discount > 0 ? (
                  <span className="text-xl sm:text-2xl font-extrabold text-[#640C0C] flex items-center tracking-tight">
                    <span className="text-xl sm:text-2xl mr-0.5">↓</span>
                    {discount}%
                  </span>
                ) : null;
              })()}
              {product.mrpPrice && (
                <span className="text-xl sm:text-lg font-medium text-neutral-500 line-through">
                  {product.mrpPrice.replace(/₹\s?/, "")}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {product.price}
              </span>
            </div>

            <p className="text-xs text-neutral-500 mb-6">(incl. of all taxes)</p>

            <p className="text-sm leading-relaxed text-neutral-300 mb-6">
              {product.description}
            </p>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Colors
              </span>
              <div className="flex items-center gap-2.5">
                {colorVariants.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col.name)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border transition-all flex items-center justify-center ${
                      selectedColor === col.name
                        ? "ring-2 ring-[#640C0C] ring-offset-2 ring-offset-black border-white scale-110"
                        : "border-white/20 hover:scale-105"
                    }`}
                    style={{ backgroundColor: col.hex }}
                    aria-label={col.name}
                  >
                    {selectedColor === col.name && (
                      <Check className={`w-3 h-3 ${col.isLight ? "text-black" : "text-white"}`} />
                    )}
                  </button>
                ))}
              </div>
              <span className="text-xs text-neutral-300 font-medium">({selectedColor})</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Size
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {sizeVariants.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedSize === size
                        ? "bg-[#640C0C] border-[#640C0C] text-white shadow-sm"
                        : "bg-[#121212] border-white/10 text-neutral-300 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#121212] border border-white/5 p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Specifications</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-neutral-500">Brand</dt>
                  <dd className="text-white font-medium mt-0.5">{product.brand}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Category</dt>
                  <dd className="text-white font-medium mt-0.5 capitalize">{product.categoryLabel || product.category.replace("-", " ")}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Material</dt>
                  <dd className="text-white font-medium mt-0.5">{product.material}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Warranty</dt>
                  <dd className="text-white font-medium mt-0.5">{product.warranty}</dd>
                </div>
                {product.partType && (
                  <div>
                    <dt className="text-neutral-500">Part Type</dt>
                    <dd className="text-white font-medium mt-0.5">{product.partType}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-neutral-500">Availability</dt>
                  <dd className={`font-medium mt-0.5 ${product.inStock ? "text-emerald-400" : "text-rose-400"}`}>
                    {product.inStock ? `In Stock (${product.stockQuantity} units)` : "Out of Stock"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-[#121212] border border-white/5 p-4 mb-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Quantity</span>
                <div className="flex items-center border border-white/15 rounded-full bg-black">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 grid place-items-center text-white disabled:opacity-30 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 grid place-items-center text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 rounded-full border border-white/20 bg-white/10 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  {isAdded ? "Add Another to Cart" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 rounded-full bg-[#640C0C] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white">Related Products</h2>
              <Link
                href={`/products?category=${product.category}`}
                className="text-xs sm:text-sm font-semibold text-[#640C0C] hover:opacity-80 transition-opacity"
              >
                View Category
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}