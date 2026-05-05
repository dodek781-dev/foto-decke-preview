/* Reaktiver State + Subscriber-Pattern für den Foto-Decken-Editor.
 * setState({...}) feuert alle Subscriber, render.js zeichnet die DOM. */

export const state = {
  // Foto
  photo_url: null,             // gecroppte DataURL (was im Mockup gezeigt wird)
  photo_url_original: null,    // ungecroppte DataURL (für "Neu zuschneiden")
  photo_crop: null,
  natural_width: 0,            // Original-Pixel vor 2400px-Resize, für DPI-Check
  natural_height: 0,
  crop_width: 1,               // Crop-Verhältnisse 0..1 (cropped/source)
  crop_height: 1,
  filter: 'original',

  // Format & Decken-Variante
  orientation: 'landscape',    // 'landscape' (Querformat) | 'portrait' (Hochformat)
  variant: 'standard',         // 'standard' (BLB-SKUs) | 'premium' (BLP-SKUs)
  size: '100x70',              // '70x100' | '100x150' (= 150x100) | '150x200' (= 200x150)
};

const subscribers = [];

export function subscribe(fn) { subscribers.push(fn); }

export function setState(updates) {
  Object.assign(state, updates);
  subscribers.forEach(fn => fn(state));
}

/* Merchone-SKU-Mapping (siehe Daten/merchone-catalog.md).
 * Print-Pixel kommen aus den Print-Area-Guides @ 150 dpi inkl. 3 cm Bleed. */
export const SKU_MAP = {
  'standard': {
    '70x100':  { sku: 'BLB1000701', label: '70 × 100 cm',  print_px: [6260, 4488] },
    '100x150': { sku: 'BLB1501001', label: '100 × 150 cm', print_px: [9213, 6260] },
    '150x200': { sku: 'BLB2001501', label: '150 × 200 cm', print_px: [12165, 9213] },
  },
  'premium': {
    '70x100':  { sku: 'BLP1000701', label: '70 × 100 cm',  print_px: [6260, 4488] },
    '100x150': { sku: 'BLP1501001', label: '100 × 150 cm', print_px: [9213, 6260] },
    '150x200': { sku: 'BLP2001501', label: '150 × 200 cm', print_px: [12165, 9213] },
  },
};
