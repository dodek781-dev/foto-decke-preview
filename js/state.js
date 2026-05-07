/* Reaktiver State für Personalisierte-Fußmatte-Editor.
 * V1.8: Multi-Variant (mensch/hund/katze/pferd) — Defaults aus variants/. */

import { variant } from './variants/index.js';

const DEFAULT_PHOTO = 'assets/photo-mockup-default.jpg';

/* Hauptzeile-Default: bei Tier-Variante "Willkommen bei BALU", sonst frei. */
const initialHauptzeile = (variant.hauptzeile_input_mode === 'animal_name')
  ? `${variant.default_hauptzeile_template} ${variant.default_animal_name}`
  : variant.default_hauptzeile;

export const state = {
  // Foto 1 (immer da)
  photo_url: DEFAULT_PHOTO,
  photo_url_original: null,
  photo_crop: null,
  natural_width: 1000,
  natural_height: 1500,
  crop_width: 1,
  crop_height: 1,

  // Foto 2 (nur sichtbar wenn photo_count == 2) — auch Default-Mockup
  photo2_url: DEFAULT_PHOTO,
  photo2_url_original: null,
  photo2_crop: null,
  natural_width_2: 1000,
  natural_height_2: 1500,
  crop_width_2: 1,
  crop_height_2: 1,

  filter: 'original',
  photo_count: 1,              // 1 oder 2

  // Material
  material: 'caramel',

  // Text — Defaults variant-abhängig
  hauptzeile: initialHauptzeile,
  untertitel: variant.default_untertitel,
  text_font_style: 'script',
  hauptzeile_template: variant.default_hauptzeile_template || null,
  animal_name: variant.default_animal_name || '',

  // Deko: standardmäßig sichtbar wenn Variante eine PNG hat
  decoration_visible: !!variant.decoration_png,

  // Größe & Variant-Type
  size: '70x50',
  variant: 'standard',
};

const subscribers = [];
export function subscribe(fn) { subscribers.push(fn); }
export function setState(updates) {
  Object.assign(state, updates);
  subscribers.forEach(fn => fn(state));
}

export const SKU_MAP = {
  '70x50':  { sku: 'CPS0700501', label: '70 × 50 cm',  aspect: 70 / 50,  print_px: [4488, 3307], price_eur: 24.90 },
  '140x90': { sku: 'CPS1400901', label: '140 × 90 cm', aspect: 140 / 90, print_px: [8622, 5669], price_eur: 64.90 },
};

export function currentAspect(s = state) {
  return (SKU_MAP[s.size] || SKU_MAP['70x50']).aspect;
}

export const HAUPTZEILE_TEMPLATES = ['Hello', 'Willkommen', 'Herzlich Willkommen', 'Familie', 'Hier wohnen'];

export const FONT_STYLES = {
  script: { font: "'parlare', cursive",                   weight: 400, label: 'Verspielt' },
  serif:  { font: "'Playfair Display', Georgia, serif",   weight: 700, label: 'Elegant' },
  sans:   { font: "'Outfit', system-ui, sans-serif",      weight: 700, label: 'Modern' },
};
