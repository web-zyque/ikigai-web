export interface ProductItem {
  id: number | string;
  name: string;
  price: string;
  mrpPrice?: string;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  description: string;
  features: string[];
  compatibility: string[];
  material: string;
  warranty: string;
  inStock: boolean;
  stockQuantity: number;
}

export const STORE_PRODUCTS: ProductItem[] = Array.from({ length: 25 }).map((_, i) => {
  const categories = ["brakes", "suspension", "engine", "alloy-wheels", "lighting"];
  const category = categories[i % 5];

  const categoryNames: Record<string, string> = {
    brakes: "High Performance Carbon Ceramic Brake Kit",
    suspension: "Adjustable Coilovers & Performance Suspension System",
    engine: "Cold Air Intake & Engine Performance Tuning Module",
    "alloy-wheels": "Forged Monoblock Ultra-Lightweight Alloy Wheel Set",
    lighting: "Matrix Sequential LED Headlight & Tail Kit",
  };

  const imagesMap: Record<string, string[]> = {
    brakes: [
      "/images/category_brakes.jpg",
      "/images/category_exterior.jpg",
      "/images/category_engine.jpg",
    ],
    suspension: [
      "/images/category_suspension.jpg",
      "/images/category_air-intake.jpg",
      "/images/category_brakes.jpg",
    ],
    engine: [
      "/images/category_engine.jpg",
      "/images/category_exhaust.jpg",
      "/images/category_air-intake.jpg",
    ],
    "alloy-wheels": [
      "/images/category_wheels.jpg",
      "/images/category_tires.jpg",
      "/images/category_exterior.jpg",
    ],
    lighting: [
      "/images/category_lighting.jpg",
      "/images/category_exterior.jpg",
      "/images/category_interior.jpg",
    ],
  };

  const basePrice = 1299 + i * 150;
  const mrp = Math.round(basePrice * 1.25);

  const name =
    i % 5 === 0
      ? `Premium Brake Kit ${i + 1}`
      : i % 5 === 1
      ? `Performance Suspension ${i + 1} — Pro Series`
      : i % 5 === 2
      ? `Engine Tuning Module ${i + 1}`
      : i % 5 === 3
      ? `Alloy Wheel Set ${i + 1} — Forged`
      : `LED Lighting Kit ${i + 1}`;

  return {
    id: i,
    name,
    price: `₹${basePrice.toLocaleString()}`,
    mrpPrice: `₹${mrp.toLocaleString()}`,
    image: imagesMap[category][0],
    images: imagesMap[category],
    category,
    brand: "Ikigai Performance",
    description: `Engineered for automotive enthusiasts who demand uncompromising precision and track-proven durability. The ${name} is manufactured to aerospace tolerances using premium materials, providing maximum performance and styling for your vehicle.`,
    features: [
      "Precision-machined from aircraft-grade alloys for ultimate durability",
      "Direct OEM bolt-on fitment with zero modifications needed",
      "Thermal resistance coating to withstand extreme operating conditions",
      "Rigorously track-tested for peak performance and safety",
    ],
    compatibility: [
      "Universal fit for popular sports sedans and hatchbacks",
      "Compatible with BMW 3-Series, Audi A4/S4, Mercedes C-Class",
      "Fits Japanese performance vehicles (Civic Type R, GR Yaris, Supra)",
    ],
    material: "Aircraft Grade T6-6061 Forged Alloy & Carbon Fiber",
    warranty: "2 Years Comprehensive Replacement Warranty",
    inStock: true,
    stockQuantity: 14 + (i % 7),
  };
});

export const BEST_SELLER_PRODUCTS: ProductItem[] = Array.from({ length: 10 }).map((_, i) => {
  const basePrice = 299 + i * 50;
  const mrp = Math.round(basePrice * 1.3);
  const isAirIntake = i % 2 === 0;
  const mainImage = isAirIntake ? "/images/category_air-intake.jpg" : "/images/category_suspension.jpg";

  const name =
    i % 3 === 0
      ? `Premium Part ${i + 1}`
      : `Premium Performance Part ${i + 1} with Extra Long Title to Test the Two Line Clamping Behavior`;

  return {
    id: `bs-${i}`,
    name,
    price: `₹${basePrice.toLocaleString()}`,
    mrpPrice: `₹${mrp.toLocaleString()}`,
    image: mainImage,
    images: [mainImage, "/images/category_engine.jpg", "/images/category_brakes.jpg"],
    category: isAirIntake ? "engine" : "suspension",
    brand: "Ikigai Pro",
    description: `High-performance automotive component engineered to deliver optimal flow, handling response, and long-term reliability under challenging driving scenarios.`,
    features: [
      "Aerodynamically optimized design for peak efficiency",
      "Lightweight composite structure reducing unsprung mass",
      "Plug & play installation with included stainless steel hardware",
    ],
    compatibility: ["Universal fitment for modern performance platforms"],
    material: "High-grade thermal composite & anodized aluminum",
    warranty: "1 Year Official Ikigai Warranty",
    inStock: true,
    stockQuantity: 20,
  };
});

export function getProductById(id: string | number): ProductItem | undefined {
  const strId = String(id);
  const foundInStore = STORE_PRODUCTS.find((p) => String(p.id) === strId);
  if (foundInStore) return foundInStore;

  const foundInBestSellers = BEST_SELLER_PRODUCTS.find((p) => String(p.id) === strId);
  if (foundInBestSellers) return foundInBestSellers;

  const numericId = parseInt(strId, 10);
  if (!isNaN(numericId) && numericId >= 0 && numericId < STORE_PRODUCTS.length) {
    return STORE_PRODUCTS[numericId];
  }

  return undefined;
}
