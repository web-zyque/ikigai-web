// ─────────────────────────────────────────────────────────────────
// Mock Product Data
//
// The backend currently has no product API. This file supplies rich
// demo products that mirror the shape defined in types/product.types.ts.
// Replace `getProductById` / `getRelatedProducts` with real API calls
// (via axios + react-query) once the endpoints are available.
// ─────────────────────────────────────────────────────────────────

import type { Product } from "@/types/product.types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "0",
    name: "Premium Brake Kit — Brembo Sport Series",
    category: "brakes",
    brand: "Brembo",
    sku: "BRK-SP-001",
    description:
      "Engineered for drivers who demand more from every stop. The Brembo Sport Series brake kit delivers shorter stopping distances, reduced brake fade under sustained hard braking, and a confident pedal feel whether you're on a mountain road or a city street. The cross-drilled and slotted rotors improve heat dissipation while the high-friction compound pads maintain consistent bite across a wide temperature range.",
    images: [
      "/images/category_brakes.jpg",
      "/images/category_suspension.jpg",
      "/images/category_engine.jpg",
      "/images/category_exhaust.jpg",
    ],
    price: 12999,
    originalPrice: 17999,
    stock: 3,
    lowStockThreshold: 5,
    material: "Cast Iron Rotors, Ceramic Composite Pads",
    warranty: "2 Years / 40,000 km",
    variants: [
      { id: "v1", color: "Silver", colorHex: "#9ca3af", size: undefined, stock: 2 },
      { id: "v2", color: "Black", colorHex: "#1f2937", size: undefined, stock: 1 },
    ],
    specifications: [
      { label: "Category", value: "Brakes" },
      { label: "Brand", value: "Brembo" },
      { label: "SKU", value: "BRK-SP-001" },
      { label: "Rotor Type", value: "Cross-Drilled & Slotted" },
      { label: "Pad Compound", value: "Ceramic Composite" },
      { label: "Material", value: "Cast Iron Rotors, Ceramic Composite Pads" },
      { label: "Warranty", value: "2 Years / 40,000 km" },
    ],
    compatibility: [
      { make: "Maruti Suzuki", model: "Swift", yearFrom: 2018, yearTo: 2025 },
      { make: "Hyundai", model: "i20", yearFrom: 2019, yearTo: 2025 },
      { make: "Honda", model: "City", yearFrom: 2017, yearTo: 2023 },
      { make: "Toyota", model: "Glanza", yearFrom: 2019, yearTo: 2025 },
    ],
  },
  {
    id: "1",
    name: "Performance Suspension Kit — KYB Excel-G",
    category: "suspension",
    brand: "KYB",
    sku: "SUS-KG-002",
    description:
      "KYB Excel-G shock absorbers restore factory ride control and handling precision. Twin-tube design with controlled valving provides a smooth, stable ride on varying road conditions. Direct replacement for worn OEM shocks without any modification required.",
    images: [
      "/images/category_suspension.jpg",
      "/images/category_brakes.jpg",
      "/images/category_wheels.jpg",
    ],
    price: 8499,
    originalPrice: 10999,
    stock: 12,
    lowStockThreshold: 5,
    material: "High-Tensile Steel, Nitrogen Gas",
    warranty: "1 Year / 20,000 km",
    variants: [
      { id: "v3", color: undefined, size: "Standard", stock: 6 },
      { id: "v4", color: undefined, size: "Lowered (-30mm)", stock: 6 },
    ],
    specifications: [
      { label: "Category", value: "Suspension" },
      { label: "Brand", value: "KYB" },
      { label: "SKU", value: "SUS-KG-002" },
      { label: "Type", value: "Twin-Tube Gas" },
      { label: "Material", value: "High-Tensile Steel, Nitrogen Gas" },
      { label: "Warranty", value: "1 Year / 20,000 km" },
    ],
    compatibility: [
      { make: "Hyundai", model: "Creta", yearFrom: 2018, yearTo: 2025 },
      { make: "Kia", model: "Seltos", yearFrom: 2019, yearTo: 2025 },
      { make: "Maruti Suzuki", model: "Vitara Brezza", yearFrom: 2016, yearTo: 2022 },
    ],
  },
  {
    id: "2",
    name: "Engine Performance Tuner — Uni-Chip Stage 2",
    category: "engine",
    brand: "Uni-Chip",
    sku: "ENG-UC-003",
    description:
      "The Uni-Chip Stage 2 ECU performance tuner reprogrammes ignition timing and fuel delivery maps to unlock hidden horsepower and torque while maintaining factory reliability. Plug-and-play installation with a full safety rollback if required.",
    images: [
      "/images/category_engine.jpg",
      "/images/category_air-intake.jpg",
      "/images/category_exhaust.jpg",
    ],
    price: 21500,
    originalPrice: 27000,
    stock: 7,
    lowStockThreshold: 5,
    material: "Anodised Aluminium Housing, EEPROM Module",
    warranty: "3 Years",
    specifications: [
      { label: "Category", value: "Engine" },
      { label: "Brand", value: "Uni-Chip" },
      { label: "SKU", value: "ENG-UC-003" },
      { label: "Gain", value: "+15–25 HP / +20 Nm" },
      { label: "Material", value: "Anodised Aluminium, EEPROM Module" },
      { label: "Warranty", value: "3 Years" },
    ],
    compatibility: [
      { make: "Volkswagen", model: "Polo GTI", yearFrom: 2016, yearTo: 2023 },
      { make: "Skoda", model: "Octavia vRS", yearFrom: 2017, yearTo: 2024 },
      { make: "Hyundai", model: "Verna 1.5 Turbo", yearFrom: 2020, yearTo: 2025 },
    ],
  },
  {
    id: "3",
    name: "Forged Alloy Wheel Set — OZ Racing Ultraleggera",
    category: "alloy-wheels",
    brand: "OZ Racing",
    sku: "WHL-OZ-004",
    description:
      "Forged from a single piece of high-strength aluminium alloy, the OZ Ultraleggera is one of the lightest 17-inch wheels available. Reduced unsprung weight improves steering response, ride quality, and acceleration. Available in Graphite Silver and Gloss Black.",
    images: [
      "/images/category_wheels.jpg",
      "/images/category_tires.jpg",
      "/images/category_brakes.jpg",
      "/images/category_suspension.jpg",
    ],
    price: 65000,
    originalPrice: 78000,
    stock: 8,
    lowStockThreshold: 5,
    material: "Forged Aluminium Alloy",
    warranty: "5 Years Structural Warranty",
    variants: [
      { id: "v5", color: "Graphite Silver", colorHex: "#6b7280", size: '17"', stock: 4 },
      { id: "v6", color: "Gloss Black", colorHex: "#111827", size: '17"', stock: 4 },
      { id: "v7", color: "Graphite Silver", colorHex: "#6b7280", size: '18"', stock: 0 },
    ],
    specifications: [
      { label: "Category", value: "Alloy Wheels" },
      { label: "Brand", value: "OZ Racing" },
      { label: "SKU", value: "WHL-OZ-004" },
      { label: "Sizes", value: '17", 18"' },
      { label: "Colors", value: "Graphite Silver, Gloss Black" },
      { label: "Material", value: "Forged Aluminium Alloy" },
      { label: "Warranty", value: "5 Years Structural Warranty" },
    ],
    compatibility: [
      { make: "Hyundai", model: "i30 N", yearFrom: 2017, yearTo: 2025 },
      { make: "Volkswagen", model: "Golf GTI", yearFrom: 2015, yearTo: 2024 },
      { make: "Honda", model: "Civic", yearFrom: 2016, yearTo: 2023 },
      { make: "Toyota", model: "GR Yaris", yearFrom: 2020, yearTo: 2025 },
    ],
  },
  {
    id: "4",
    name: "LED Lighting Kit — Osram Night Breaker LED H7",
    category: "lighting",
    brand: "Osram",
    sku: "LTG-NB-005",
    description:
      "Street-legal LED conversion kit producing up to 220% more brightness than standard halogen bulbs. Precise beam pattern meets ECE regulations with no blinding of oncoming traffic. Plug-and-play design compatible with most CAN-bus systems.",
    images: [
      "/images/category_lighting.jpg",
      "/images/category_exterior.jpg",
      "/images/category_car-electronics.jpg",
    ],
    price: 4299,
    stock: 24,
    lowStockThreshold: 5,
    material: "LED Chip, Aircraft-Grade Aluminium Heat Sink",
    warranty: "2 Years",
    specifications: [
      { label: "Category", value: "Lighting" },
      { label: "Brand", value: "Osram" },
      { label: "SKU", value: "LTG-NB-005" },
      { label: "Brightness Gain", value: "+220% vs halogen" },
      { label: "Colour Temperature", value: "6000K Cool White" },
      { label: "Material", value: "LED Chip, Aluminium Heat Sink" },
      { label: "Warranty", value: "2 Years" },
    ],
    compatibility: [
      { make: "All", model: "H7 socket vehicles", yearFrom: 2000 },
    ],
  },
  {
    id: "5",
    name: "Stainless Steel Cat-Back Exhaust — Borla S-Type",
    category: "exhaust",
    brand: "Borla",
    sku: "EXH-BS-006",
    description:
      "Manufactured from T-304 aircraft-grade stainless steel with a rich, aggressive tone. The S-Type cat-back system reduces back-pressure for measurable power gains while sounding fantastic at every RPM.",
    images: [
      "/images/category_exhaust.jpg",
      "/images/category_engine.jpg",
    ],
    price: 34500,
    originalPrice: 40000,
    stock: 0,
    lowStockThreshold: 5,
    material: "T-304 Stainless Steel",
    warranty: "Million Mile Warranty",
    specifications: [
      { label: "Category", value: "Exhaust" },
      { label: "Brand", value: "Borla" },
      { label: "SKU", value: "EXH-BS-006" },
      { label: "Material", value: "T-304 Stainless Steel" },
      { label: "Pipe Diameter", value: "63.5 mm (2.5 in)" },
      { label: "Warranty", value: "Million Mile Warranty" },
    ],
    compatibility: [
      { make: "Ford", model: "Mustang GT", yearFrom: 2015, yearTo: 2023 },
      { make: "Chevrolet", model: "Camaro SS", yearFrom: 2016, yearTo: 2024 },
    ],
  },
  {
    id: "6",
    name: "Cold Air Intake System — K&N 69 Series",
    category: "engine",
    brand: "K&N",
    sku: "INT-KN-007",
    description:
      "K&N 69-Series Typhoon cold air intake system routes cool, dense air from outside the engine compartment directly to the throttle body. Reusable, washable filter included. Guaranteed not to void your factory powertrain warranty.",
    images: [
      "/images/category_air-intake.jpg",
      "/images/category_engine.jpg",
    ],
    price: 11799,
    originalPrice: 14500,
    stock: 15,
    lowStockThreshold: 5,
    material: "Powder-Coated Aluminium Tube, Oiled Cotton Filter",
    warranty: "10 Year / 1,000,000 km Filter Warranty",
    specifications: [
      { label: "Category", value: "Engine / Air Intake" },
      { label: "Brand", value: "K&N" },
      { label: "SKU", value: "INT-KN-007" },
      { label: "Filter Type", value: "Oiled Cotton Gauze" },
      { label: "Material", value: "Powder-Coated Aluminium, Oiled Cotton" },
      { label: "Warranty", value: "10 Year / 1,000,000 km" },
    ],
    compatibility: [
      { make: "Maruti Suzuki", model: "Baleno", yearFrom: 2015, yearTo: 2022 },
      { make: "Toyota", model: "Glanza", yearFrom: 2019, yearTo: 2025 },
      { make: "Honda", model: "Jazz", yearFrom: 2014, yearTo: 2020 },
    ],
  },
  {
    id: "7",
    name: "Performance Tires — Michelin Pilot Sport 4S",
    category: "performance-tires",
    brand: "Michelin",
    sku: "TIR-PS-008",
    description:
      "Michelin's flagship summer performance tyre. Variable Contact Patch 3.0 and Bi-Compound tread deliver extraordinary grip in both dry and wet conditions. Track-validated with over 300 motorsport victories.",
    images: [
      "/images/category_tires.jpg",
      "/images/category_wheels.jpg",
    ],
    price: 18500,
    stock: 20,
    lowStockThreshold: 5,
    material: "Variable-Contact-Patch Rubber, Aramid Reinforcement",
    warranty: "Standard Michelin Warranty",
    variants: [
      { id: "v8", color: undefined, size: "225/45 R17", stock: 8 },
      { id: "v9", color: undefined, size: "245/40 R18", stock: 8 },
      { id: "v10", color: undefined, size: "265/35 R19", stock: 4 },
    ],
    specifications: [
      { label: "Category", value: "Performance Tires" },
      { label: "Brand", value: "Michelin" },
      { label: "SKU", value: "TIR-PS-008" },
      { label: "Sizes", value: "225/45 R17, 245/40 R18, 265/35 R19" },
      { label: "Load Index", value: "94Y" },
      { label: "Warranty", value: "Standard Michelin Warranty" },
    ],
    compatibility: [
      { make: "Multiple", model: "Check size fitment", yearFrom: 2000 },
    ],
  },
  {
    id: "8",
    name: "Carbon Fibre Interior Trim Kit — Universal Dash",
    category: "interior",
    brand: "Ikigai",
    sku: "INT-CF-009",
    description:
      "Transform your cabin with genuine 3K carbon fibre weave trim panels. Each piece is hand-laid and UV coated for a lasting gloss finish. Includes dashboard fascia, door cards, and centre console inserts.",
    images: [
      "/images/category_interior.jpg",
      "/images/category_exterior.jpg",
    ],
    price: 7800,
    originalPrice: 9500,
    stock: 6,
    lowStockThreshold: 5,
    material: "3K Carbon Fibre Weave, UV-Resistant Epoxy Resin",
    warranty: "1 Year",
    specifications: [
      { label: "Category", value: "Interior" },
      { label: "Brand", value: "Ikigai" },
      { label: "SKU", value: "INT-CF-009" },
      { label: "Material", value: "3K Carbon Fibre Weave" },
      { label: "Finish", value: "Gloss UV Coated" },
      { label: "Warranty", value: "1 Year" },
    ],
    compatibility: [
      { make: "Universal", model: "Fits most JDM/European vehicles", yearFrom: 1990 },
    ],
  },
  {
    id: "9",
    name: "Exterior Body Kit — Aero Splitter + Diffuser",
    category: "exterior",
    brand: "Ikigai",
    sku: "EXT-AK-010",
    description:
      "Aerodynamically tested front splitter and rear diffuser combo. Manufactured from vacuum-infused fibreglass for light weight and rigidity. Improves high-speed stability and transforms the car's aggressive stance.",
    images: [
      "/images/category_exterior.jpg",
      "/images/category_wheels.jpg",
    ],
    price: 19900,
    originalPrice: 24500,
    stock: 4,
    lowStockThreshold: 5,
    material: "Vacuum-Infused Fibreglass, ABS Plastic Mounting Brackets",
    warranty: "1 Year",
    variants: [
      { id: "v11", color: "Matte Black", colorHex: "#374151", stock: 2 },
      { id: "v12", color: "Unpainted", colorHex: "#e5e7eb", stock: 2 },
    ],
    specifications: [
      { label: "Category", value: "Exterior" },
      { label: "Brand", value: "Ikigai" },
      { label: "SKU", value: "EXT-AK-010" },
      { label: "Material", value: "Vacuum-Infused Fibreglass" },
      { label: "Finish", value: "Matte Black / Unpainted" },
      { label: "Warranty", value: "1 Year" },
    ],
    compatibility: [
      { make: "Hyundai", model: "i20 N Line", yearFrom: 2021, yearTo: 2025 },
      { make: "Maruti Suzuki", model: "Swift Sport", yearFrom: 2018, yearTo: 2023 },
    ],
  },
];

// ─── Helpers (replace these with react-query hooks + API calls) ──

export function getProductById(id: string | number): Product | undefined {
  return MOCK_PRODUCTS.find((p) => String(p.id) === String(id));
}

export function getRelatedProducts(
  productId: string | number,
  category: string,
  limit = 4,
): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => String(p.id) !== String(productId) && p.category === category,
  ).slice(0, limit);
}

// Utility: format price in INR locale
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
