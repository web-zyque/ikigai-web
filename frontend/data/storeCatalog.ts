import { DEMO_PRODUCTS_DETAILS } from "./demoProducts";

export interface StoreProduct {
  id: string | number;
  name: string;
  price: string;
  mrpPrice?: string;
  image: string;
  images?: string[];
  category: string;
  categoryLabel?: string;
  brand: string;
  partType?: string;
  vehicleCompatibility?: string[];
  description?: string;
  features?: string[];
  material?: string;
  warranty?: string;
  stockQuantity?: number;
  inStock?: boolean;
}

export interface CategoryMeta {
  slug: string;
  label: string;
  group: string;
  keywords: string[];
}

export interface BrandMeta {
  name: string;
  aliases: string[];
  categories: string[];
}

export const STORE_CATEGORIES: CategoryMeta[] = [
  // Parts
  {
    slug: "brakes",
    label: "Brakes",
    group: "Parts",
    keywords: ["brake", "brakes", "rotors", "rotor", "caliper", "calipers", "pads", "pad", "braking", "disc", "brembo"],
  },
  {
    slug: "suspension",
    label: "Suspension",
    group: "Parts",
    keywords: ["suspension", "coilover", "coilovers", "spring", "springs", "strut", "struts", "shock", "shocks", "damper", "dampers", "bilstein", "lift kit"],
  },
  {
    slug: "engine",
    label: "Engine",
    group: "Parts",
    keywords: ["engine", "tuning", "tune", "intake", "air intake", "ecu", "remap", "turbo", "boost", "plug", "motor", "k&n"],
  },
  {
    slug: "exhaust",
    label: "Exhaust",
    group: "Parts",
    keywords: ["exhaust", "muffler", "downpipe", "catback", "headers", "tips", "valvetronic", "akrapovic", "pipe"],
  },
  {
    slug: "transmission",
    label: "Transmission",
    group: "Parts",
    keywords: ["transmission", "clutch", "gearbox", "flywheel", "shifter", "gear", "exedy"],
  },
  {
    slug: "cooling",
    label: "Cooling",
    group: "Parts",
    keywords: ["cooling", "radiator", "intercooler", "oil cooler", "coolant", "fan", "mishimoto"],
  },
  {
    slug: "electrical",
    label: "Electrical",
    group: "Parts",
    keywords: ["electrical", "battery", "alternator", "sensor", "sensors", "parking sensor", "wiring", "reverse sensor", "fuse"],
  },

  // Tires & Wheels
  {
    slug: "alloy-wheels",
    label: "Alloy Wheels",
    group: "Tires & Wheels",
    keywords: ["wheel", "wheels", "alloy", "alloys", "alloy wheels", "rim", "rims", "forged", "bbs", "enkei"],
  },
  {
    slug: "performance-tires",
    label: "Performance Tires",
    group: "Tires & Wheels",
    keywords: ["tire", "tires", "tyre", "tyres", "performance tires", "slicks", "semi-slick", "michelin", "pirelli", "track tire"],
  },
  {
    slug: "off-road",
    label: "Off-Road",
    group: "Tires & Wheels",
    keywords: ["off-road", "off road", "4x4", "skid plate", "traction", "recovery", "rock slider", "all-terrain"],
  },

  // Accessories
  {
    slug: "interior",
    label: "Interior",
    group: "Accessories",
    keywords: ["interior", "seat cover", "seat covers", "mats", "floor mats", "ambient", "ambient light", "perfume", "air freshener", "sparco"],
  },
  {
    slug: "exterior",
    label: "Exterior",
    group: "Accessories",
    keywords: ["exterior", "mirror cap", "mirror caps", "door handle", "door handles", "spoiler", "diffuser", "body kit", "grille", "garnish"],
  },
  {
    slug: "lighting",
    label: "Lighting",
    group: "Accessories",
    keywords: ["lighting", "light", "lights", "led", "headlight", "headlights", "fog lamp", "fog lamps", "tail light", "tail lights", "roof light", "light bar", "marker lights", "matrix led", "projector", "xenon"],
  },
  {
    slug: "audio",
    label: "Audio",
    group: "Accessories",
    keywords: ["audio", "stereo", "stereos", "android stereo", "infotainment", "speaker", "speakers", "subwoofer", "woofer", "horn", "horns", "sound", "nakamichi"],
  },
];

export const STORE_BRANDS: BrandMeta[] = [
  { name: "Lumileds Automotive", aliases: ["lumileds", "lumi"], categories: ["lighting"] },
  { name: "Rigid Armor Pro", aliases: ["rigid armor", "rigid", "armor pro"], categories: ["lighting", "off-road"] },
  { name: "Bosch Automotive", aliases: ["bosch"], categories: ["audio", "engine", "brakes", "electrical"] },
  { name: "Nakamichi Elite", aliases: ["nakamichi"], categories: ["audio"] },
  { name: "Redline Aero", aliases: ["redline", "redline aero"], categories: ["lighting", "exterior"] },
  { name: "OptiBeam Performance", aliases: ["optibeam", "opti beam"], categories: ["lighting"] },
  { name: "LumenTech Pro", aliases: ["lumentech", "lumen tech"], categories: ["lighting"] },
  { name: "AeroForm Design", aliases: ["aeroform", "aero form"], categories: ["exterior"] },
  { name: "GlowAero Luxe", aliases: ["glowaero", "glow aero"], categories: ["interior", "lighting"] },
  { name: "SafeReverse Auto", aliases: ["safereverse", "safe reverse"], categories: ["electrical"] },
  { name: "StyleLine Automobili", aliases: ["styleline", "style line"], categories: ["exterior"] },
  { name: "DarkKnight Dynamics", aliases: ["darkknight", "dark knight"], categories: ["lighting"] },
  { name: "Brembo", aliases: ["brembo", "brembo racing"], categories: ["brakes"] },
  { name: "Bilstein", aliases: ["bilstein", "bilstein motorsport"], categories: ["suspension"] },
  { name: "Akrapovic", aliases: ["akrapovic", "akrapovic exhaust"], categories: ["exhaust"] },
  { name: "K&N Engineering", aliases: ["k&n", "kn"], categories: ["engine"] },
  { name: "BBS Motorsport", aliases: ["bbs", "bbs wheels"], categories: ["alloy-wheels"] },
  { name: "Enkei Racing", aliases: ["enkei", "enkei wheels"], categories: ["alloy-wheels"] },
  { name: "Michelin", aliases: ["michelin", "pilot sport"], categories: ["performance-tires"] },
  { name: "Pirelli", aliases: ["pirelli", "pzero", "p-zero"], categories: ["performance-tires"] },
  { name: "Sparco", aliases: ["sparco", "sparco tuning"], categories: ["interior", "transmission"] },
  { name: "Mishimoto", aliases: ["mishimoto", "mishi"], categories: ["cooling"] },
  { name: "Exedy", aliases: ["exedy", "exedy clutch"], categories: ["transmission"] },
];

// Helper to map category slug from DEMO products to store categories
function mapDemoCategorySlug(slug: string): string {
  switch (slug) {
    case "lighting":
    case "roof-lights":
    case "headlights":
    case "fog-lamps":
    case "tail-lights":
      return "lighting";
    case "horns":
    case "android-stereos":
      return "audio";
    case "exterior-accessories":
      return "exterior";
    case "interior-accessories":
      return "interior";
    case "electronics":
      return "electrical";
    default:
      return slug;
  }
}

// Transform DEMO_PRODUCTS_DETAILS into StoreProducts
const mappedDemoProducts: StoreProduct[] = DEMO_PRODUCTS_DETAILS.map((p) => ({
  id: p.id,
  name: p.name,
  price: `₹${parseFloat(p.sellingPrice).toLocaleString("en-IN")}`,
  mrpPrice: p.mrpPrice ? `₹${parseFloat(p.mrpPrice).toLocaleString("en-IN")}` : undefined,
  image: p.images?.[0]?.imageUrl || "/images/category_lighting.jpg",
  images: p.images && p.images.length > 0 ? p.images.map((img) => img.imageUrl) : ["/images/category_lighting.jpg"],
  category: mapDemoCategorySlug(p.category.slug),
  categoryLabel: p.category.name,
  brand: p.brand || "Ikigai Customs",
  partType: p.productType,
  vehicleCompatibility: p.vehicleCompatibility,
  description: p.description,
  material: p.material,
  warranty: p.warranty,
  stockQuantity: p.stockQuantity,
  inStock: p.inventoryStatus !== "out_of_stock",
  features: [
    "Direct OEM replacement fitment",
    "Engineered for high stress and endurance",
    "Backed by Ikigai quality assurance guarantee",
  ],
}));

// Additional rich store products for parts, tires, wheels, exhaust, cooling, etc.
const additionalStoreProducts: StoreProduct[] = [
  // Brakes
  {
    id: "prod-bk-1",
    name: "Brembo GT 6-Piston Big Brake Kit",
    price: "₹24,999",
    image: "/images/category_brakes.jpg",
    category: "brakes",
    categoryLabel: "Brakes",
    brand: "Brembo",
    partType: "Big Brake Kit",
    vehicleCompatibility: ["BMW 3-Series", "Audi A4", "Skoda Octavia RS", "Volkswagen Virtus GT"],
    description: "6-piston forged monoblock aluminum calipers with two-piece floating 355mm drilled discs.",
  },
  {
    id: "prod-bk-2",
    name: "Brembo High-Performance Cross-Drilled Sport Rotors",
    price: "₹7,499",
    image: "/images/category_brakes.jpg",
    category: "brakes",
    categoryLabel: "Brakes",
    brand: "Brembo",
    partType: "Brake Rotors",
    vehicleCompatibility: ["Hyundai Creta", "Kia Seltos", "Mahindra XUV700", "Tata Harrier"],
    description: "Ventilated high-carbon cast iron brake rotors with anti-corrosion UV coating.",
  },
  {
    id: "prod-bk-3",
    name: "Bosch Ceramic Low-Dust Performance Brake Pads",
    price: "₹2,299",
    image: "/images/category_brakes.jpg",
    category: "brakes",
    categoryLabel: "Brakes",
    brand: "Bosch Automotive",
    partType: "Brake Pads",
    vehicleCompatibility: ["Universal fitment for all modern sedans and compact SUVs"],
    description: "Aerospace ceramic formulation delivering quiet, fade-resistant stopping power with zero rotor scoring.",
  },

  // Suspension
  {
    id: "prod-sp-1",
    name: "Bilstein B16 PSS10 Height & Damping Adjustable Coilovers",
    price: "₹34,999",
    image: "/images/category_suspension.jpg",
    category: "suspension",
    categoryLabel: "Suspension",
    brand: "Bilstein",
    partType: "Coilovers",
    vehicleCompatibility: ["Volkswagen Polo GT", "Skoda Slavia", "Virtus GT", "Hyundai i20 N-Line"],
    description: "10-stage parallel mechanical damping adjustment with inverted monotube gas-pressure shock absorbers.",
  },
  {
    id: "prod-sp-2",
    name: "Bilstein Pro-Kit Progressive Lowering Springs",
    price: "₹8,499",
    image: "/images/category_suspension.jpg",
    category: "suspension",
    categoryLabel: "Suspension",
    brand: "Bilstein",
    partType: "Lowering Springs",
    vehicleCompatibility: ["Honda City", "Hyundai Verna", "Maruti Suzuki Swift", "Tata Altroz"],
    description: "Drops vehicle center of gravity by 30-35mm for razor-sharp cornering stability.",
  },
  {
    id: "prod-sp-3",
    name: "Bilstein Heavy-Duty Off-Road 2-Inch Lift Struts",
    price: "₹14,999",
    image: "/images/category_suspension.jpg",
    category: "suspension",
    categoryLabel: "Suspension",
    brand: "Bilstein",
    partType: "Lift Struts",
    vehicleCompatibility: ["Mahindra Thar 2020-2024", "Thar Roxx", "Jimny 5-Door", "Toyota Fortuner"],
    description: "Nitrogen charged off-road dampers designed for aggressive trail articulation.",
  },

  // Engine
  {
    id: "prod-eng-1",
    name: "K&N High-Flow Cold Air Intake Induction System",
    price: "₹6,899",
    image: "/images/category_air-intake.jpg",
    category: "engine",
    categoryLabel: "Engine",
    brand: "K&N Engineering",
    partType: "Cold Air Intake",
    vehicleCompatibility: ["Skoda Kushaq 1.5 TSI", "Volkswagen Taigun", "Mahindra XUV700 Petrol", "Hyundai Verna Turbo"],
    description: "Guaranteed horsepower gain with cotton-gauze washable filter and mandrel-bent aluminum intake tube.",
  },
  {
    id: "prod-eng-2",
    name: "Bosch Stage 2 Plug-and-Play ECU Tuning Module",
    price: "₹9,999",
    image: "/images/category_engine.jpg",
    category: "engine",
    categoryLabel: "Engine",
    brand: "Bosch Automotive",
    partType: "Tuning Module",
    vehicleCompatibility: ["Diesel & Turbo Petrol SUVs (Thar, Scorpio-N, Creta, Fortuner)"],
    description: "Multi-channel digital tuning piggyback providing up to +35 BHP and +65 Nm torque with selectable driving modes.",
  },

  // Exhaust
  {
    id: "prod-ex-1",
    name: "Akrapovic Evolution Titanium Cat-Back Exhaust System",
    price: "₹29,999",
    image: "/images/category_exhaust.jpg",
    category: "exhaust",
    categoryLabel: "Exhaust",
    brand: "Akrapovic",
    partType: "Cat-Back Exhaust",
    vehicleCompatibility: ["Skoda Octavia RS", "Volkswagen Virtus GT", "BMW 330i", "Mini Cooper S"],
    description: "Ultra-lightweight titanium alloy system with quad carbon fiber exhaust tailpipes and remote valvetronic sound controller.",
  },
  {
    id: "prod-ex-2",
    name: "Akrapovic Stainless Steel High-Flow Catless Downpipe",
    price: "₹11,499",
    image: "/images/category_exhaust.jpg",
    category: "exhaust",
    categoryLabel: "Exhaust",
    brand: "Akrapovic",
    partType: "Downpipe",
    vehicleCompatibility: ["1.5L / 2.0L Turbocharged Engines (VAG TSI, Hyundai T-GDI)"],
    description: "TIG-welded 304 aircraft-grade stainless steel with smooth transitions for lightning turbo spool up.",
  },

  // Transmission
  {
    id: "prod-tr-1",
    name: "Exedy Stage 1 Heavy-Duty Organic Clutch Kit",
    price: "₹12,499",
    image: "/images/category_engine.jpg",
    category: "transmission",
    categoryLabel: "Transmission",
    brand: "Exedy",
    partType: "Clutch Kit",
    vehicleCompatibility: ["Mahindra Thar 4x4", "Maruti Swift Sport", "Isuzu V-Cross", "Tata Safari"],
    description: "Handles up to 350 Nm torque with ductile iron pressure plate and premium organic friction lining.",
  },
  {
    id: "prod-tr-2",
    name: "Sparco Quick-Shift Short Shifter Linkage",
    price: "₹4,299",
    image: "/images/category_interior.jpg",
    category: "transmission",
    categoryLabel: "Transmission",
    brand: "Sparco",
    partType: "Short Shifter",
    vehicleCompatibility: ["Universal manual transmissions"],
    description: "Reduces shift throw by 40% for crisp, mechanical gear changes on track and street.",
  },

  // Cooling
  {
    id: "prod-cl-1",
    name: "Mishimoto Dual-Core All-Aluminum Performance Radiator",
    price: "₹8,999",
    image: "/images/category_engine.jpg",
    category: "cooling",
    categoryLabel: "Cooling",
    brand: "Mishimoto",
    partType: "Radiator",
    vehicleCompatibility: ["Mahindra Thar Diesel", "Toyota Fortuner 2.8", "Force Gurkha", "Jimny"],
    description: "100% brazed aluminum core providing 30% greater cooling capacity under heavy off-roading.",
  },
  {
    id: "prod-cl-2",
    name: "Mishimoto Front-Mount Bar & Plate Intercooler",
    price: "₹13,499",
    image: "/images/category_engine.jpg",
    category: "cooling",
    categoryLabel: "Cooling",
    brand: "Mishimoto",
    partType: "Intercooler",
    vehicleCompatibility: ["Skoda Octavia", "Virtus GT", "Hyundai Verna 1.5 Turbo"],
    description: "Dramatically reduces intake air temperatures to eliminate heat soak during continuous spirited driving.",
  },

  // Alloy Wheels
  {
    id: "prod-wh-1",
    name: 'BBS Super RS 19" Forged Multi-Spoke Alloy Wheels',
    price: "₹38,999",
    image: "/images/category_wheels.jpg",
    category: "alloy-wheels",
    categoryLabel: "Alloy Wheels",
    brand: "BBS Motorsport",
    partType: "Forged Wheels",
    vehicleCompatibility: ["PCD 5x112 / 5x114.3 (BMW, Audi, Mercedes, Skoda, Hyundai)"],
    description: "Iconic cross-spoke motorsport design manufactured from aerospace forged aluminum alloy with diamond-cut lip.",
  },
  {
    id: "prod-wh-2",
    name: 'Enkei RPF1 Lightweight Racing Wheel Set 17"',
    price: "₹26,499",
    image: "/images/category_wheels.jpg",
    category: "alloy-wheels",
    categoryLabel: "Alloy Wheels",
    brand: "Enkei Racing",
    partType: "Racing Wheels",
    vehicleCompatibility: ["PCD 4x100 / 5x100 (Swift, Polo, i20, Honda City)"],
    description: "MAT technology casting delivering F1 twin-spoke strength with an astonishing weight of just 6.9 kg per wheel.",
  },

  // Performance Tires
  {
    id: "prod-tr-t1",
    name: "Michelin Pilot Sport 5 Ultra-High Performance Tires",
    price: "₹9,499",
    image: "/images/category_tires.jpg",
    category: "performance-tires",
    categoryLabel: "Performance Tires",
    brand: "Michelin",
    partType: "Performance Tires",
    vehicleCompatibility: ["225/45 R17 / 235/40 R18 / 245/40 R19 sizes"],
    description: "Dual Sport tread design providing exceptional steering precision in the dry and shorter braking distances in the wet.",
  },
  {
    id: "prod-tr-t2",
    name: "Pirelli P-Zero Track & Street Max Grip Tires",
    price: "₹8,799",
    image: "/images/category_tires.jpg",
    category: "performance-tires",
    categoryLabel: "Performance Tires",
    brand: "Pirelli",
    partType: "Performance Tires",
    vehicleCompatibility: ["High performance sedans and sports coupes"],
    description: "Formula 1 derived compound technology with asymmetric tread pattern for uncompromising high-speed traction.",
  },

  // Off-Road
  {
    id: "prod-or-1",
    name: "Rigid Armor Heavy-Duty 6mm Underbody Skid Plate",
    price: "₹7,999",
    image: "/images/category_exterior.jpg",
    category: "off-road",
    categoryLabel: "Off-Road",
    brand: "Rigid Armor Pro",
    partType: "Skid Plate",
    vehicleCompatibility: ["Mahindra Thar", "Jimny 4x4", "Scorpio-N 4Xplor", "Toyota Hilux"],
    description: "Laser-cut 6mm aircraft aluminum guard protecting engine oil pan, steering rack, and transmission from boulder strikes.",
  },
  {
    id: "prod-or-2",
    name: "Rigid Armor Heavy-Duty Traction Recovery Boards",
    price: "₹4,299",
    image: "/images/category_exterior.jpg",
    category: "off-road",
    categoryLabel: "Off-Road",
    brand: "Rigid Armor Pro",
    partType: "Recovery Boards",
    vehicleCompatibility: ["Universal off-road recovery kit"],
    description: "UV-stabilized impact-resistant nylon boards with aggressive diamond tooth cleats for sand, mud, and snow rescues.",
  },

  // Interior
  {
    id: "prod-int-1",
    name: "Sparco Alcantara Sport Seat Covers Set",
    price: "₹5,999",
    image: "/images/category_interior.jpg",
    category: "interior",
    categoryLabel: "Interior",
    brand: "Sparco",
    partType: "Seat Covers",
    vehicleCompatibility: ["Universal bucket & standard passenger vehicle seats"],
    description: "Breathable Italian Alcantara microfiber fabric with high-density memory foam padding and reinforced red stitching.",
  },
  {
    id: "prod-int-2",
    name: "GlowAero 64-Color RGB Wireless App Ambient Lighting Kit",
    price: "₹1,899",
    image: "/images/category_interior.jpg",
    category: "interior",
    categoryLabel: "Interior",
    brand: "GlowAero Luxe",
    partType: "Ambient Lighting",
    vehicleCompatibility: ["Universal 12V cars and SUVs"],
    description: "Ultra-thin optical acrylic fiber guides with Bluetooth smartphone app control, music sync mode, and dreamcolor chases.",
  },

  // Exterior
  {
    id: "prod-ext-1",
    name: "AeroForm GT Track High-Downforce Carbon Wing Spoiler",
    price: "₹11,999",
    image: "/images/category_exterior.jpg",
    category: "exterior",
    categoryLabel: "Exterior",
    brand: "AeroForm Design",
    partType: "Spoiler",
    vehicleCompatibility: ["Sedans and Fastbacks (Virtus, Slavia, Verna, City, Octavia)"],
    description: "Genuine vacuum-infused 3K twill carbon fiber airfoil with CNC aluminum mounting pedestals.",
  },
  {
    id: "prod-ext-2",
    name: "StyleLine Gloss Black Honeycomb Front Sport Grille",
    price: "₹3,799",
    image: "/images/category_exterior.jpg",
    category: "exterior",
    categoryLabel: "Exterior",
    brand: "StyleLine Automobili",
    partType: "Grille",
    vehicleCompatibility: ["Hyundai Creta 2020-2024", "Maruti Swift", "Kia Seltos"],
    description: "Aggressive RS-style honeycomb pattern with durable gloss piano black lacquer and OEM clip mounts.",
  },

  // Audio
  {
    id: "prod-aud-1",
    name: 'Nakamichi 12" Powered Slim Underseat Bass Subwoofer',
    price: "₹7,999",
    image: "/images/category_car-electronics.jpg",
    category: "audio",
    categoryLabel: "Audio",
    brand: "Nakamichi Elite",
    partType: "Subwoofer",
    vehicleCompatibility: ["Universal compact fit under passenger seat or in boot"],
    description: "Built-in 600W Class-D amplifier with die-cast aluminum chassis delivering punchy, deep low-end bass.",
  },
  {
    id: "prod-aud-2",
    name: 'Nakamichi 6.5" 2-Way Component Speaker System 350W',
    price: "₹3,899",
    image: "/images/category_car-electronics.jpg",
    category: "audio",
    categoryLabel: "Audio",
    brand: "Nakamichi Elite",
    partType: "Component Speakers",
    vehicleCompatibility: ["Direct OEM door speaker replacement for all cars"],
    description: "Polypropylene cone with butyl rubber surround and 25mm silk dome neodymium tweeters with audiophile crossovers.",
  },
];

// Combine all into the master catalogue
export const STORE_PRODUCTS: StoreProduct[] = [
  ...mappedDemoProducts,
  ...additionalStoreProducts,
];

export type ProductItem = StoreProduct;

export function getStoreProductById(id: string | number): StoreProduct | undefined {
  const match = STORE_PRODUCTS.find((p) => String(p.id) === String(id));
  if (match) {
    if (!match.images || match.images.length === 0) {
      match.images = [match.image];
    }
    if (!match.features || match.features.length === 0) {
      match.features = [
        "Direct bolt-on OEM replacement fitment",
        "Tested under extreme driving and track endurance conditions",
        "Backed by Ikigai certified quality guarantee",
      ];
    }
  }
  return match;
}

export const getProductById = getStoreProductById;

export interface SearchIntentResult {
  query: string;
  type: "category" | "brand" | "product" | "general";
  categorySlug?: string;
  categoryLabel?: string;
  brandName?: string;
  matchedEntityName?: string;
}

/**
 * Checks if a search query is a category name, brand name, product name, or general keyword.
 */
export function detectSearchIntent(rawQuery: string): SearchIntentResult {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  if (!query) {
    return { query: "", type: "general" };
  }

  // 1. Check Category Match
  for (const cat of STORE_CATEGORIES) {
    if (
      cat.slug === lower ||
      cat.label.toLowerCase() === lower ||
      cat.keywords.some((k) => k === lower)
    ) {
      return {
        query,
        type: "category",
        categorySlug: cat.slug,
        categoryLabel: cat.label,
        matchedEntityName: cat.label,
      };
    }
  }

  // Substring / partial category match (e.g. "brake kit" -> category "brakes", "alloy" -> "alloy-wheels")
  for (const cat of STORE_CATEGORIES) {
    if (
      lower.includes(cat.label.toLowerCase()) ||
      cat.keywords.some((k) => lower.includes(k) && k.length >= 4)
    ) {
      return {
        query,
        type: "category",
        categorySlug: cat.slug,
        categoryLabel: cat.label,
        matchedEntityName: cat.label,
      };
    }
  }

  // 2. Check Brand Match
  for (const brand of STORE_BRANDS) {
    if (
      brand.name.toLowerCase() === lower ||
      brand.aliases.some((a) => a === lower)
    ) {
      return {
        query,
        type: "brand",
        brandName: brand.name,
        matchedEntityName: brand.name,
      };
    }
  }

  for (const brand of STORE_BRANDS) {
    if (
      lower.includes(brand.name.toLowerCase()) ||
      brand.aliases.some((a) => lower.includes(a) && a.length >= 4)
    ) {
      return {
        query,
        type: "brand",
        brandName: brand.name,
        matchedEntityName: brand.name,
      };
    }
  }

  // 3. Check Product / Part Name Match
  for (const p of STORE_PRODUCTS) {
    if (
      p.name.toLowerCase().includes(lower) ||
      (p.partType && p.partType.toLowerCase().includes(lower))
    ) {
      return {
        query,
        type: "product",
        matchedEntityName: p.name,
      };
    }
  }

  return {
    query,
    type: "general",
    matchedEntityName: query,
  };
}

export interface SearchResultsOutput {
  results: StoreProduct[];
  intent: SearchIntentResult;
  isRelatedFallback: boolean;
  totalMatches: number;
}

/**
 * Searches the store catalog with ranking by relevance and fallback to related products.
 */
export function searchStoreCatalog(
  rawQuery: string,
  options?: { category?: string; brand?: string; catalog?: StoreProduct[] }
): SearchResultsOutput {
  const catalog = options?.catalog || STORE_PRODUCTS;
  const query = (rawQuery || "").trim();
  const lower = query.toLowerCase();
  const intent = detectSearchIntent(query);

  const queryTokens = lower
    .split(/\s+/)
    .filter((t) => t.length > 0 && !["a", "an", "the", "for", "with", "in", "and", "or"].includes(t));

  // Score each product
  const scored = catalog.map((product) => {
    let score = 0;
    const pName = product.name.toLowerCase();
    const pBrand = product.brand.toLowerCase();
    const pCat = product.category.toLowerCase();
    const pType = (product.partType || "").toLowerCase();
    const pDesc = (product.description || "").toLowerCase();
    const pCompat = (product.vehicleCompatibility || []).map((v) => v.toLowerCase()).join(" ");

    // Explicit category filter from URL or intent
    if (options?.category && options.category !== "all") {
      if (product.category === options.category) {
        score += 50;
      } else {
        // If an explicit category is requested, penalize mismatched categories
        score -= 200;
      }
    }

    // Explicit brand filter
    if (options?.brand) {
      if (pBrand.includes(options.brand.toLowerCase())) {
        score += 80;
      }
    }

    if (queryTokens.length > 0) {
      // Exact name match
      if (pName === lower) score += 200;
      else if (pName.startsWith(lower)) score += 120;
      else if (pName.includes(lower)) score += 90;

      // Brand exact or partial match
      if (pBrand === lower) score += 180;
      else if (pBrand.includes(lower)) score += 80;

      // Category match
      if (pCat === lower || (product.categoryLabel && product.categoryLabel.toLowerCase() === lower)) {
        score += 100;
      }

      // Token matches
      let matchedTokens = 0;
      for (const token of queryTokens) {
        let tokenMatched = false;
        if (pName.includes(token)) {
          score += 40;
          tokenMatched = true;
        }
        if (pBrand.includes(token)) {
          score += 35;
          tokenMatched = true;
        }
        if (pCat.includes(token)) {
          score += 30;
          tokenMatched = true;
        }
        if (pType.includes(token)) {
          score += 30;
          tokenMatched = true;
        }
        if (pCompat.includes(token)) {
          score += 25;
          tokenMatched = true;
        }
        if (pDesc.includes(token)) {
          score += 15;
          tokenMatched = true;
        }
        if (tokenMatched) matchedTokens++;
      }

      if (matchedTokens === queryTokens.length) {
        score += 40; // Bonus if all tokens match
      }
    } else {
      // If no query, base score is positive
      score += 10;
    }

    return { product, score };
  });

  // Filter products with score > 0
  const filtered = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  if (filtered.length > 0) {
    return {
      results: filtered,
      intent,
      isRelatedFallback: false,
      totalMatches: filtered.length,
    };
  }

  // If query was supplied but no direct match found, find mostly related products
  // e.g. products from most relevant category or popular items
  let fallbackCategory = intent.categorySlug;
  if (!fallbackCategory && queryTokens.length > 0) {
    // Check if any keyword matches a category's keywords
    for (const cat of STORE_CATEGORIES) {
      if (cat.keywords.some((kw) => queryTokens.some((qt) => kw.includes(qt) || qt.includes(kw)))) {
        fallbackCategory = cat.slug;
        break;
      }
    }
  }

  let related: StoreProduct[] = [];
  if (fallbackCategory) {
    related = catalog.filter((p) => p.category === fallbackCategory);
  }

  if (related.length === 0) {
    // Return top diverse products from across categories
    related = catalog.slice(0, 10);
  }

  return {
    results: related,
    intent,
    isRelatedFallback: true,
    totalMatches: 0,
  };
}
