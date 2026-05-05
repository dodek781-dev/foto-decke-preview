/* Reaktiver State + Subscriber-Pattern für den Foto-Fußmatten-Editor.
 * (V1.0–V1.4 war Foto-Decke; V1.5 Pivot zu Fußmatte — Decke kommt
 * später als Phase 2 mit Multi-Foto-Collage zurück.)
 *
 * setState({...}) feuert alle Subscriber, render.js zeichnet die DOM. */

export const state = {
  // Foto
  photo_url: null,
  photo_url_original: null,
  photo_crop: null,
  natural_width: 0,
  natural_height: 0,
  crop_width: 1,
  crop_height: 1,
  filter: 'original',

  // Material (3 Texturen)
  material: 'caramel',         // 'caramel' | 'gray' | 'black'

  // Größe & Aspect (Fußmatte hat per-Size unterschiedliche Aspects!)
  size: '70x50',               // '70x50' | '140x90'
  variant: 'standard',         // nur 'standard' (Premium-Rug existiert nicht)
};

const subscribers = [];

export function subscribe(fn) { subscribers.push(fn); }

export function setState(updates) {
  Object.assign(state, updates);
  subscribers.forEach(fn => fn(state));
}

/* Merchone-SKU-Mapping für Fußmatten-Rugs (CPS = "Carpet Standard").
 * Aus Daten/merchone-catalog.md.
 * Print-Pixel @ 150 dpi inkl. 3 cm Bleed allseits (laut Print-Area-Guide).
 * Aspect = width/height der sichtbaren Fläche (nicht inkl. Bleed). */
export const SKU_MAP = {
  '70x50':  {
    sku: 'CPS0700501',
    label: '70 × 50 cm',
    aspect: 70 / 50,            // 1.4
    print_px: [4488, 3307],
    price_eur: 24.90,
  },
  '140x90': {
    sku: 'CPS1400901',
    label: '140 × 90 cm',
    aspect: 140 / 90,           // ≈ 1.556
    print_px: [8622, 5669],
    price_eur: 64.90,
  },
};

/* Computed: aktueller Aspect aus state.size */
export function currentAspect(s = state) {
  return (SKU_MAP[s.size] || SKU_MAP['70x50']).aspect;
}
