# Foto-Decke Editor (Preview)

Standalone-Preview-Repo für den Distantlines Foto-Decken-Editor.
Wird auf GitHub Pages live deployed; nach Iteration ins Distantlines-Theme als Section migriert.

## Was ist das?

V1-Editor für eine personalisierte Foto-Decke, gefulfilled über Merchone (Sortimentserweiterung
Phase 1). Nur Foto, kein Text, 2 Tabs (Layout + Produkt), Querformat oder Hochformat.

Bestehendes Distantlines-Editor-Pattern (Mama-Definitionsposter, Foto-Poster) als Basis. Der
einzige visuelle Unterschied zum Poster: das Decken-Rechteck hat leicht gewellte Kanten
(Stoff-Optik via CSS `mask-image` + SVG-Wave-Path) statt scharfer Linie.

## Stack

- Pures HTML / CSS / ES-Modul-JS, kein Build, kein npm.
- Cropper.js v1.6.2 via CDN für Foto-Crop.
- Outfit (Google Fonts) für UI-Schrift.

## Files

```
index.html              # Editor-Skelett (Tab-Switcher, Render-Area, Modals)
css/
  base.css              # Layout-Grid, Mobile-Topbar, Render-Area-BG
  editor.css            # Tab-Switcher, Picker, Bottom-Controls, Modals
  render.css            # Decken-Frame mit Wave-Maske, Quer-/Hochformat-Switch
js/
  state.js              # Reaktiver State + SKU_MAP (Merchone-Variants)
  render.js             # DOM-Updates aus State (Foto-img, Orientation, Variant)
  main.js               # Tab-Switching, Module-Imports
  photo-upload.js       # Foto-Upload + Cropper.js + 2400px-Pre-Resize
  produkt.js            # Variant/Größe/Orientation-Picker + Cart-Btn-Preview
  quality.js            # DPI-Check (Decken: 150 dpi green, 100 dpi orange)
  filter.js             # (V1: Foto-Filter ausgeblendet, Code geparkt)
```

## Merchone-Mapping

Aus `Daten/merchone-catalog.md`. SKUs werden über `state.SKU_MAP[variant][size]` gesetzt.

| Variante | Größe | product_sku | Print-Pixel @ 150 dpi |
|---|---|---|---|
| Standard | 70×100 cm | BLB1000701 | 6260×4488 |
| Standard | 100×150 cm | BLB1501001 | 9213×6260 |
| Standard | 150×200 cm | BLB2001501 | 12165×9213 |
| Premium | 70×100 cm | BLP1000701 | 6260×4488 |
| Premium | 100×150 cm | BLP1501001 | 9213×6260 |
| Premium | 150×200 cm | BLP2001501 | 12165×9213 |

## Lokale Entwicklung

```bash
cd ~/Claude\ Skills\ Workspace/Foto-Decke
python3 -m http.server 8000
# Browser: http://localhost:8000
```

Cache-Busting `?v=N` in `index.html` bei jedem CSS-Push hochzählen, sonst sieht Browser
gecachte CSS und nichts ändert sich.

## Migration ins Theme (Phase 1, Block 2)

Wenn V1 im Standalone steht: Migration nach Pattern aus `mama-poster-spec.md` und
`reference_poster_editor_base_template.md` (Memory):
- `index.html` → `sections/foto-decke.liquid`
- `css/*.css` → konkateniert in `assets/foto-decke.css`
- `js/*.js` → IIFE-Bundle in `assets/foto-decke.js` (kein ES-Modules im Theme)
- Mobile-Topbar entfernen (Theme-Header übernimmt)
- Body-Scroll-Lock + Header-Compensation einbauen (siehe Memory-Anti-Pattern #11)

## Hetzner Render-Pipeline (Phase 1, Block 2)

Separate Django-App `blanket_renderer/` auf Hetzner — siehe Plan-File
`/Users/dodo/.claude/plans/effervescent-spinning-zephyr.md`.
