# Personalisierte Fußmatte Editor (Preview)

Standalone-Preview-Repo für den Distantlines Personalisierte-Fußmatte-Editor.
Wird auf GitHub Pages live deployed; nach Iteration ins Distantlines-Theme als Section migriert.

**Live**: https://dodek781-dev.github.io/foto-decke-preview/
(Repo-Name `foto-decke-preview` aus historischen Gründen — Pages-URL bleibt stabil.)

## Was ist das?

V1-Editor für personalisierte Fußmatten im FussmattenKING-Style (Etsy-Topseller-Pattern):
TEXT dominiert, Foto optional in Kreis-Form. Gefulfilled über Merchone (Catalog Rug 70×50
und 140×90, Markt-validiert via Pet Printed).

Phase 2 (separates Repo später): Foto-Decke mit Multi-Foto-Collage. V1.4-Decken-Stand
(Single-Foto, Quer-/Hochformat) ist via Git-Tag `v1.4-decke-baseline` konserviert.

## V1.6 Layout-Konzept (FussmattenKING-Style)

- **Material-Picker** im Layout-Tab: 3 Schlingen-Velours-Texturen (Caramel, Grau, Schwarz)
- **Text-Tab** mit Hauptzeile (groß, mit Quick-Templates: Hello / Willkommen / Familie / etc.)
  + Untertitel (klein, sans-serif)
- **Foto** optional, kompakter Distantlines-Standard-"Foto hochladen"-Button (kein großes
  Drop-Zone), erscheint zentriert in Kreis-Form (analog Sternkarte-Pattern)
- **Schriftstil**: 3 Auswahlen — Modern (Outfit) / Elegant (Playfair Display) / Verspielt (Parlare)

## Stack

- Pures HTML / CSS / ES-Modul-JS, kein Build, kein npm.
- Cropper.js v1.6.2 via CDN für Foto-Crop.
- Outfit (Google Fonts), Playfair Display (Google Fonts), Parlare (Adobe Typekit) für Editor + Render.

## Files

```
index.html              # Editor-Skelett (3 Tabs, Render-Area, Modals)
assets/textures/        # 3 Schlingen-Velours-Texturen (caramel/gray/black, 1200px JPG)
css/
  base.css              # Layout-Grid, Mobile-Topbar, Render-Area-BG
  editor.css            # Tabs, Picker, Material-Picker, Text-Inputs, Photo-Upload-Button
  render.css            # Frame, Material-Texturen, Text-Layout, Foto-Kreis
js/
  state.js              # State + SKU_MAP + HAUPTZEILE_TEMPLATES + FONT_STYLES
  render.js             # DOM-Updates aus State
  main.js               # Tab-Switching (3 Tabs), Module-Imports
  text-inputs.js        # Hauptzeile/Untertitel-Inputs + Templates + Font-Style-Picker
  photo-upload.js       # Foto-Upload + Cropper.js + 2400px-Pre-Resize
  produkt.js            # Material-Picker + Größen-Picker + Cart-Btn-Preview
  quality.js            # DPI-Check (150 dpi green, 100 dpi orange)
  filter.js             # (V1 inaktiv, Code geparkt mit null-Guard)
```

## Merchone-Mapping

Aus `Daten/merchone-catalog.md`. SKUs werden über `state.SKU_MAP[size]` gesetzt.

| Größe | product_sku | Print-Pixel @ 150 dpi | Aspect | Preis (Vorschlag) |
|---|---|---|---|---|
| 70 × 50 cm | CPS0700501 | 4488×3307 | 1.4 | 24.90 € |
| 140 × 90 cm | CPS1400901 | 8622×5669 | 1.556 | 64.90 € |

Nur Variante "Standard" (Premium-Rug existiert nicht im Merchone-Catalog).

## Lokale Entwicklung

```bash
cd ~/Claude\ Skills\ Workspace/Foto-Decke
python3 -m http.server 8000
# Browser: http://localhost:8000
```

Cache-Bust `?v=N` in `index.html` bei jedem CSS-/JS-Push hochzählen.

## Migration ins Theme (später)

- `index.html` → `sections/foto-fussmatte.liquid`
- `css/*.css` → konkateniert in `assets/foto-fussmatte.css`
- `js/*.js` → IIFE-Bundle in `assets/foto-fussmatte.js` (kein ES-Modules im Theme)
- Mobile-Topbar entfernen (Theme-Header übernimmt)
- Body-Scroll-Lock + Header-Compensation (siehe Memory-Anti-Pattern #11)

## Hetzner Render-Pipeline (separater Block)

Separate Django-App auf Hetzner für Print-File-Render bei Bestellung. Siehe Plan-File
`/Users/dodo/.claude/plans/effervescent-spinning-zephyr.md`.
