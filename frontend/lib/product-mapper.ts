import { ProductResponse } from '@/types/products.types';
import { StoreProduct } from '@/data/storeCatalog';


export function mapProductToStoreProduct(product: ProductResponse): StoreProduct {
  const mainImage = product.images.find(img => img.isMainImage) || product.images[0];
  
  return {
    id: product.id,
    name: product.name,
    price: `₹${parseFloat(product.sellingPrice).toLocaleString("en-IN")}`,
    mrpPrice: product.mrpPrice ? `₹${parseFloat(product.mrpPrice).toLocaleString("en-IN")}` : undefined,
    image: mainImage?.imageUrl || "/images/category_lighting.jpg",
    images: product.images.length > 0 
      ? product.images.map(img => img.imageUrl) 
      : ["/images/category_lighting.jpg"],
    category: product.category.slug,
    categoryLabel: product.category.name,
    brand: product.brand || "Ikigai Customs",
    partType: product.productType,
    vehicleCompatibility: product.vehicleCompatibility,
    description: product.description,
    material: product.material,
    warranty: product.warranty,
    stockQuantity: product.stockQuantity,
    inStock: product.inventoryStatus !== "out_of_stock",
    features: [
      "Direct OEM replacement fitment",
      "Engineered for high stress and endurance",
      "Backed by Ikigai quality assurance guarantee",
    ],
  };
}


export function mapProductsToStoreProducts(products: ProductResponse[]): StoreProduct[] {
  return products.map(mapProductToStoreProduct);
}
