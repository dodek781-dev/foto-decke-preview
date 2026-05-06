/* Reaktives Rendering — abonniert state.js und schreibt in die DOM.
 * V1.6 FussmattenKING-Style: Material-Textur als BG, Text als Haupt-Element,
 * Foto optional in Kreis-Form (analog Distantlines Sternkarte). */

import { state, subscribe, currentAspect, FONT_STYLES } from './state.js';

const $renderArea = document.querySelector('.render-area');
const $frame = document.querySelector('.blanket-frame');
const $photo = document.querySelector('.blanket-photo');
const $hauptzeile = document.querySelector('.blanket-text__hauptzeile');
const $untertitel = document.querySelector('.blanket-text__untertitel');
const $textBlock = document.querySelector('.blanket-text');

function render(s) {
  // Material-Textur als Frame-Hintergrund
  $renderArea.dataset.material = s.material;
  if ($photo) $photo.dataset.filter = s.filter;

  // Aspect-Ratio aus aktueller Größe
  if ($frame) {
    $frame.style.setProperty('--blanket-aspect', String(currentAspect(s)));
  }

  // Text-Inhalt + Font-Style
  if ($hauptzeile) $hauptzeile.textContent = s.hauptzeile || '';
  if ($untertitel) $untertitel.textContent = s.untertitel || '';

  if ($textBlock) {
    const fontDef = FONT_STYLES[s.text_font_style] || FONT_STYLES.script;
    $textBlock.style.fontFamily = fontDef.font;
    $textBlock.dataset.fontStyle = s.text_font_style;
    /* Hauptzeile bekommt font-weight aus FONT_STYLES.weight (z.B. Parlare 400 — synthetisches Bold zerstört Glyphen) */
    if ($hauptzeile) $hauptzeile.style.fontWeight = String(fontDef.weight);
  }

  // Foto: in Kreis-Wrapper rendern wenn vorhanden, sonst hidden
  if ($photo) {
    if (s.photo_url) {
      $photo.style.display = '';
      let img = $photo.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.alt = '';
        $photo.appendChild(img);
      }
      img.src = s.photo_url;
      $renderArea.dataset.hasPhoto = 'true';
    } else {
      $photo.style.display = 'none';
      const img = $photo.querySelector('img');
      if (img) img.remove();
      $renderArea.dataset.hasPhoto = 'false';
    }
  }
}

subscribe(render);
render(state);
