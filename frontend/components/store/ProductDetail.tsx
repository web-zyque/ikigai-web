"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  ZoomIn,
  X,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Car,
  Package,
  FileText,
  Truck,
} from "lucide-react";
import type { Product, ProductVariant } from "@/types/product.types";
import { formatPrice, getRelatedProducts } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/store/ProductCard";
import type { Product as CardProduct } from "@/components/store/ProductCard";
import Footer from "@/components/store/Footer";

const inter = Inter({ subsets: ["latin"] });

// ─── Helpers ─────────────────────────────────────────────────────

function calcDiscount(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price || price <= 0) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function getStockStatus(
  stock: number,
  threshold: number,
): { label: string; color: string; icon: React.ReactNode } {
  if (stock === 0)
    return {
      label: "Out of Stock",
      color: "text-red-400",
      icon: <XCircle className="h-4 w-4" />,
    };
  if (stock <= threshold)
    return {
      label: `Low Stock — only ${stock} left`,
      color: "text-amber-400",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  return {
    label: "In Stock",
    color: "text-emerald-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  };
}

// ─── Sub-components ───────────────────────────────────────────────

function LightboxModal({
  images,
  activeIndex,
  onClose,
}: {
  images: string[];
  activeIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(activeIndex);
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative h-[80vmin] w-[80vmin] max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[idx]}
          alt={`Product image ${idx + 1}`}
          fill
          className="object-contain"
          sizes="80vmin"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIdx(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === idx ? "w-6 bg-[#640C0C]" : "bg-white/30"
              }`}
              aria-label={`View image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────

type Tab = "description" | "specifications" | "compatibility" | "shipping";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "description", label: "Description", icon: <FileText className="h-4 w-4" /> },
  { id: "specifications", label: "Specifications", icon: <Package className="h-4 w-4" /> },
  { id: "compatibility", label: "Compatibility", icon: <Car className="h-4 w-4" /> },
  { id: "shipping", label: "Shipping & Returns", icon: <Truck className="h-4 w-4" /> },
];

// ─── Main Component ───────────────────────────────────────────────

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart, cartItems } = useCart();

  // ── Variant state ──
  const colorVariants = useMemo(
    () => (product.variants ?? []).filter((v) => v.color),
    [product.variants],
  );
  const sizeVariants = useMemo(
    () => (product.variants ?? []).filter((v) => v.size),
    [product.variants],
  );
  const hasColors = colorVariants.length > 0;
  const hasSizes = sizeVariants.length > 0;

  const [selectedColor, setSelectedColor] = useState<ProductVariant | null>(
    hasColors ? colorVariants[0] : null,
  );
  const [selectedSize, setSelectedSize] = useState<ProductVariant | null>(
    hasSizes ? sizeVariants[0] : null,
  );

  // ── Active images based on color selection ──
  const activeImages = useMemo(() => {
    if (selectedColor?.images?.length) return selectedColor.images;
    return product.images;
  }, [selectedColor, product.images]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Reset active image when images change (color variant switched)
  const handleColorSelect = useCallback(
    (v: ProductVariant) => {
      setSelectedColor(v);
      setActiveImageIdx(0);
    },
    [],
  );

  // ── Stock resolution ──
  const effectiveStock = useMemo(() => {
    const selected = selectedColor ?? selectedSize;
    if (selected) return selected.stock;
    return product.stock ?? 0;
  }, [selectedColor, selectedSize, product.stock]);

  const threshold = product.lowStockThreshold ?? 5;
  const stockStatus = getStockStatus(effectiveStock, threshold);
  const isOutOfStock = effectiveStock === 0;

  // ── Quantity ──
  const [quantity, setQuantity] = useState(1);
  const maxQty = isOutOfStock ? 0 : effectiveStock;
  const decQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incQty = () => setQuantity((q) => Math.min(maxQty, q + 1));

  // ── Pricing ──
  const discount = calcDiscount(product.price, product.originalPrice);

  // ── Add to cart ──
  const alreadyInCart = cartItems.some((i) => String(i.id) === String(product.id));

  const handleAddToCart = () => {
    if (isOutOfStock || addedToCart) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      image: activeImages[0] ?? product.images[0],
      color: selectedColor?.color,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // ── Related products ──
  const related = useMemo(
    () => getRelatedProducts(product.id, product.category, 4),
    [product.id, product.category],
  );

  const relatedCards: CardProduct[] = related.map((r) => ({
    id: r.id,
    name: r.name,
    price: formatPrice(r.price),
    image: r.images[0] ?? "/images/category_brakes.jpg",
    category: r.category,
  }));

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<Tab>("description");

  // ── Category display label ──
  const categoryLabel = product.category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className={`${inter.className} min-h-screen bg-black text-white`}>
      {/* ── Breadcrumb ── */}
      <div className="mx-auto max-w-7xl px-6 pb-0 pt-6 lg:px-12">
        <nav className="flex items-center gap-1.5 text-xs text-white/40" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="transition-colors hover:text-white">
            Products
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/products?category=${product.category}`}
            className="transition-colors hover:text-white"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 text-white/70">{product.name}</span>
        </nav>
      </div>

      {/* ── Main two-column layout ── */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 xl:gap-16">
          {/* ══ LEFT: Image Gallery ══ */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:h-fit lg:w-[48%] xl:w-[45%]">
            {/* Main Image */}
            <div
              className="group relative aspect-square w-full overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0a0a] cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              role="button"
              aria-label="Open image fullscreen"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
            >
              <Image
                key={activeImages[activeImageIdx]}
                src={activeImages[activeImageIdx] ?? product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-contain p-8 mix-blend-screen transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>

            {/* Thumbnails */}
            {activeImages.length > 1 && (
              <div
                className="flex gap-3 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                {activeImages.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActiveImageIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#0a0a0a] transition-all duration-200 ${
                      i === activeImageIdx
                        ? "border-[#640C0C] shadow-[0_0_0_1px_#640C0C]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-contain p-2 mix-blend-screen"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══ RIGHT: Product Information ══ */}
          <div className="flex flex-1 flex-col gap-6">
            {/* 1. Category label */}
            <span className="text-xs font-semibold uppercase tracking-widest text-[#640C0C]">
              {categoryLabel}
            </span>

            {/* 2. Product name */}
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* 3. Brand & SKU */}
            <p className="text-sm text-white/50">
              <span className="text-white/70">{product.brand}</span>
              <span className="mx-2 text-white/20">·</span>
              <span>SKU: {product.sku}</span>
            </p>

            {/* 4–6. Pricing */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-[#640C0C]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-white/35 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount !== null && (
                <span className="rounded-full bg-[#640C0C]/15 px-3 py-1 text-xs font-semibold text-[#f87171]">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.08]" />

            {/* 7. Stock status */}
            <div className={`flex items-center gap-2 text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.icon}
              {stockStatus.label}
            </div>

            {/* 8. Description */}
            <p className="text-sm leading-relaxed text-white/60">{product.description}</p>

            {/* 9. Compatibility (compact preview) */}
            {product.compatibility && product.compatibility.length > 0 && (
              <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  Compatible With
                </p>
                <p className="text-sm text-white/70 line-clamp-2">
                  {product.compatibility
                    .map(
                      (c) =>
                        `${c.make} ${c.model} (${c.yearFrom}${c.yearTo ? `–${c.yearTo}` : "+"})`
                    )
                    .join(" · ")}
                </p>
              </div>
            )}

            {/* 10. Color selector */}
            {hasColors && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                  Color
                  {selectedColor && (
                    <span className="ml-2 font-normal normal-case text-white/70">
                      — {selectedColor.color}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorVariants.map((v) => {
                    const isSelected = selectedColor?.id === v.id;
                    const unavailable = v.stock === 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => !unavailable && handleColorSelect(v)}
                        disabled={unavailable}
                        aria-label={`Color: ${v.color}${unavailable ? " — out of stock" : ""}`}
                        aria-pressed={isSelected}
                        className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 ${
                          isSelected
                            ? "border-[#640C0C] bg-[#640C0C]/10 text-white"
                            : unavailable
                            ? "cursor-not-allowed border-white/10 text-white/25"
                            : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {v.colorHex && (
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        {v.color}
                        {unavailable && (
                          <span className="absolute inset-0 rounded-full">
                            <span
                              className="absolute left-2 top-1/2 h-px w-[calc(100%-16px)] -translate-y-1/2 rotate-[-10deg] bg-white/20"
                            />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 11. Size selector */}
            {hasSizes && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                  Size
                  {selectedSize && (
                    <span className="ml-2 font-normal normal-case text-white/70">
                      — {selectedSize.size}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeVariants.map((v) => {
                    const isSelected = selectedSize?.id === v.id;
                    const unavailable = v.stock === 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => !unavailable && setSelectedSize(v)}
                        disabled={unavailable}
                        aria-pressed={isSelected}
                        className={`rounded-xl border px-4 py-2 text-xs font-medium transition-all duration-200 ${
                          isSelected
                            ? "border-[#640C0C] bg-[#640C0C]/10 text-white"
                            : unavailable
                            ? "cursor-not-allowed border-white/10 text-white/25 line-through"
                            : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 12. Material & Warranty */}
            {(product.material || product.warranty) && (
              <div className="flex flex-wrap gap-4 text-xs text-white/50">
                {product.material && (
                  <span>
                    <span className="text-white/30">Material:</span>{" "}
                    <span className="text-white/70">{product.material}</span>
                  </span>
                )}
                {product.warranty && (
                  <span>
                    <span className="text-white/30">Warranty:</span>{" "}
                    <span className="text-white/70">{product.warranty}</span>
                  </span>
                )}
              </div>
            )}

            <div className="h-px bg-white/8" />

            {/* 13. Quantity selector */}
            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Quantity
              </p>
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-1 py-1">
                <button
                  onClick={decQty}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  className="grid h-8 w-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-white/20"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 select-none text-center text-sm font-semibold tabular-nums text-white">
                  {quantity}
                </span>
                <button
                  onClick={incQty}
                  disabled={quantity >= maxQty || isOutOfStock}
                  aria-label="Increase quantity"
                  className="grid h-8 w-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-white/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 14. CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || alreadyInCart}
                aria-label="Add to cart"
                className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium transition-all duration-200 ${
                  addedToCart
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : isOutOfStock || alreadyInCart
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                    : "border-white/25 bg-transparent text-white hover:bg-white/10"
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Added to Cart
                  </>
                ) : alreadyInCart ? (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>

              <Link
                href={isOutOfStock ? "#" : "/cart"}
                aria-disabled={isOutOfStock}
                tabIndex={isOutOfStock ? -1 : undefined}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all duration-200 ${
                  isOutOfStock
                    ? "pointer-events-none cursor-not-allowed bg-[#640C0C]/30 text-white/30"
                    : "bg-[#640C0C] text-white hover:opacity-90"
                }`}
                onClick={
                  !isOutOfStock
                    ? () => {
                        if (!alreadyInCart) {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: formatPrice(product.price),
                            image: activeImages[0] ?? product.images[0],
                            color: selectedColor?.color,
                          });
                        }
                      }
                    : undefined
                }
              >
                <Zap className="h-4 w-4" />
                {isOutOfStock ? "Unavailable" : "Buy Now"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs section ── */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="rounded-[20px] border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-white/[0.08]" style={{ scrollbarWidth: "none" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-[#640C0C] text-white"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8 lg:p-10">
            {activeTab === "description" && (
              <div className="prose prose-invert max-w-none">
                <p className="text-base leading-relaxed text-white/65">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="overflow-hidden rounded-xl border border-white/8">
                {(product.specifications ?? []).map((spec, i) => (
                  <div
                    key={spec.label}
                    className={`flex items-start gap-4 px-5 py-4 text-sm ${
                      i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                    }`}
                  >
                    <span className="w-40 shrink-0 font-medium text-white/40">{spec.label}</span>
                    <span className="text-white/80">{spec.value}</span>
                  </div>
                ))}
                {(!product.specifications || product.specifications.length === 0) && (
                  <p className="px-5 py-4 text-sm text-white/40">No specifications listed.</p>
                )}
              </div>
            )}

            {activeTab === "compatibility" && (
              <>
                {product.compatibility && product.compatibility.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-white/8">
                    <div className="grid grid-cols-3 border-b border-white/8 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      <span>Make</span>
                      <span>Model</span>
                      <span>Years</span>
                    </div>
                    {product.compatibility.map((c, i) => (
                      <div
                        key={`${c.make}-${c.model}-${i}`}
                        className={`grid grid-cols-3 px-5 py-4 text-sm ${
                          i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                        }`}
                      >
                        <span className="font-medium text-white/80">{c.make}</span>
                        <span className="text-white/60">{c.model}</span>
                        <span className="text-white/40">
                          {c.yearFrom}{c.yearTo ? `–${c.yearTo}` : "+"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/40">
                    No compatibility information available.
                  </p>
                )}
              </>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6 text-sm text-white/65">
                <div className="flex gap-4">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#121212]">
                    <Truck className="h-4 w-4 text-[#640C0C]" />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-white">Delivery</p>
                    <p className="leading-relaxed">
                      Orders are dispatched within 1–2 business days. Standard delivery within India
                      typically takes 5–7 business days. Expedited shipping options are available at
                      checkout for select pin codes.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#121212]">
                    <Package className="h-4 w-4 text-[#640C0C]" />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-white">Returns</p>
                    <p className="leading-relaxed">
                      We accept returns within 14 days of delivery for unused items in original
                      packaging. Electrical components and items marked final sale are non-returnable.
                      Please contact us to initiate a return.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#121212]">
                    <CheckCircle2 className="h-4 w-4 text-[#640C0C]" />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-white">Warranty Claims</p>
                    <p className="leading-relaxed">
                      Warranty claims are processed directly through Ikigai. Contact our support team
                      with your order number, a description of the issue, and photos. We will arrange
                      a replacement or repair within the warranty period at no cost.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      {relatedCards.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">You May Also Like</h2>
            <Link
              href={`/products?category=${product.category}`}
              className="text-sm font-semibold text-[#640C0C] transition-opacity hover:opacity-80"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {relatedCards.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <LightboxModal
          images={activeImages}
          activeIndex={activeImageIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
