/* Reaktiver State + Subscriber-Pattern für den Personalisierte-Fußmatte-Editor.
 * V1.6: FussmattenKING-Style Pivot — Text dominiert, Foto optional in Kreis. */

export const state = {
  // Foto (optional, in Kreis-Form)
  photo_url: null,
  photo_url_original: null,
  photo_crop: null,
  natural_width: 0,
  natural_height: 0,
  crop_width: 1,
  crop_height: 1,
  filter: 'original',

  // Material-Textur (3 Farben)
  material: 'caramel',         // 'caramel' | 'gray' | 'black'

  // Text-Tab — 2 Zeilen statt 4 (FussmattenKING-Style)
  hauptzeile: 'Willkommen',
  untertitel: 'BEI FAMILIE MÜLLER',
  text_font_style: 'script',   // 'script' | 'serif' | 'sans'

  // Größe & Aspect (per-Size unterschiedlich!)
  size: '70x50',               // '70x50' | '140x90'
  variant: 'standard',
};

const subscribers = [];

export function subscribe(fn) { subscribers.push(fn); }

export function setState(updates) {
  Object.assign(state, updates);
  subscribers.forEach(fn => fn(state));
}

export const SKU_MAP = {
  '70x50':  {
    sku: 'CPS0700501', label: '70 × 50 cm',
    aspect: 70 / 50, print_px: [4488, 3307], price_eur: 24.90,
  },
  '140x90': {
    sku: 'CPS1400901', label: '140 × 90 cm',
    aspect: 140 / 90, print_px: [8622, 5669], price_eur: 64.90,
  },
};

export function currentAspect(s = state) {
  return (SKU_MAP[s.size] || SKU_MAP['70x50']).aspect;
}

/* Hauptzeile-Templates (Quick-Click-Buttons im Text-Tab) */
export const HAUPTZEILE_TEMPLATES = [
  'Hello',
  'Willkommen',
  'Herzlich Willkommen',
  'Familie',
  'Hier wohnen',
];

/* Font-Style-Definitionen (matching Mama-Pattern, Memory project_definitionsposter_status_2026_05_03.md) */
export const FONT_STYLES = {
  script: { font: "'parlare', cursive",                           weight: 400, label: 'Verspielt' },
  serif:  { font: "'Playfair Display', Georgia, serif",           weight: 700, label: 'Elegant' },
  sans:   { font: "'Outfit', system-ui, sans-serif",              weight: 700, label: 'Modern' },
};
