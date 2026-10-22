export const COLOR_MAP: Record<string, string> = {
  // Blacks & Grays
  black: '#171717',
  'matte black': '#171717',
  'glossy black': '#000000',
  charcoal: '#36454F',
  gray: '#6B7280',
  grey: '#6B7280',
  'dark gray': '#4B5563',
  'dark grey': '#4B5563',
  'light gray': '#D1D5DB',
  'light grey': '#D1D5DB',
  silver: '#C0C0C0',
  gunmetal: '#3f3f46',
  
  // Whites
  white: '#FFFFFF',
  'pearl white': '#F8F6F0',
  'off-white': '#FAF9F6',
  cream: '#FFFDD0',
  ivory: '#FFFFF0',
  
  // Reds
  red: '#991B1B',
  'crimson red': '#640C0C',
  maroon: '#800000',
  burgundy: '#800020',
  ruby: '#E0115F',
  'bright red': '#DC2626',
  scarlet: '#FF2400',
  
  // Blues
  blue: '#2563EB',
  'navy blue': '#000080',
  navy: '#000080',
  'sky blue': '#60A5FA',
  royal: '#4169E1',
  'royal blue': '#4169E1',
  cobalt: '#0047AB',
  azure: '#007FFF',
  teal: '#008080',
  turquoise: '#40E0D0',
  
  // Greens
  green: '#15803D',
  'dark green': '#064E3B',
  'light green': '#86EFAC',
  'lime green': '#84CC16',
  lime: '#84CC16',
  olive: '#808000',
  emerald: '#059669',
  mint: '#98FF98',
  sage: '#9DC183',
  
  // Yellows & Oranges
  yellow: '#EAB308',
  gold: '#FFD700',
  'bright yellow': '#FACC15',
  amber: '#F59E0B',
  orange: '#EA580C',
  'burnt orange': '#CC5500',
  coral: '#FF7F50',
  peach: '#FFE5B4',
  
  // Purples & Pinks
  purple: '#7C3AED',
  violet: '#8B00FF',
  magenta: '#FF00FF',
  pink: '#EC4899',
  'hot pink': '#FF69B4',
  'light pink': '#FFB6C1',
  lavender: '#E6E6FA',
  lilac: '#C8A2C8',
  
  // Browns
  brown: '#92400E',
  tan: '#D2B48C',
  beige: '#F5F5DC',
  khaki: '#F0E68C',
  bronze: '#CD7F32',
  copper: '#B87333',
  
  // Metallics
  chrome: '#E8E8E8',
  platinum: '#E5E4E2',
  titanium: '#878681',
  
  // Specialty
  transparent: '#00000000',
  clear: '#FFFFFF',
  multicolor: '#FBBF24', // Gold as fallback
  'multi-color': '#FBBF24',
  'multi color': '#FBBF24',
};


export function normalizeColorName(colorName: string): string {
  return colorName.trim().toLowerCase();
}

/**
 * Get the HEX color value for a given color name.
 * Returns a fallback neutral color if the name is not recognized.
 * 
 * @param colorName - The color name to look up
 * @param fallback - The fallback HEX color (default: neutral gray #9CA3AF)
 * @returns HEX color string
 */
export function getColorHex(colorName: string, fallback: string = '#9CA3AF'): string {
  const normalized = normalizeColorName(colorName);
  return COLOR_MAP[normalized] || fallback;
}


export function isRecognizedColor(colorName: string): boolean {
  const normalized = normalizeColorName(colorName);
  return normalized in COLOR_MAP;
}

export function parseColorString(colorString: string | undefined | null): string[] {
  if (!colorString) return [];
  return colorString
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0);
}

export interface ColorInfo {
  name: string;
  hex: string;
  isLight: boolean; 
}


export function getColorInfo(colorName: string): ColorInfo {
  const hex = getColorHex(colorName);
  const isLight = isLightColor(hex);
  
  return {
    name: colorName,
    hex,
    isLight,
  };
}


export function isLightColor(hex: string): boolean {
  const cleanHex = hex.replace('#', '');
  
  const rgb = cleanHex.length === 8 ? cleanHex.slice(0, 6) : cleanHex;
  
  const r = parseInt(rgb.substr(0, 2), 16);
  const g = parseInt(rgb.substr(2, 2), 16);
  const b = parseInt(rgb.substr(4, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}
