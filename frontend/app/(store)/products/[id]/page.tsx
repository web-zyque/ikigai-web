import type { Metadata } from "next";
import { getProductById } from "@/lib/products";
import ProductDetail from "@/components/store/ProductDetail";
import NotFound from "@/components/store/notFound";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Generate SEO metadata per product
export async function generateMetadata(
  { params }: ProductPageProps,
): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    return { title: "Product Not Found — Ikigai Accessories" };
  }
  return {
    title: `${product.name} — Ikigai Accessories`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return <NotFound />;
  }

  return <ProductDetail product={product} />;
}
