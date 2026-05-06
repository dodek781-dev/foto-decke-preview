/* Reaktives Rendering — V1.7 mit 2-Slot-Foto-Support + kreisförmigen Slots. */

import { state, subscribe, currentAspect, FONT_STYLES } from './state.js';

const $renderArea = document.querySelector('.render-area');
const $frame = document.querySelector('.blanket-frame');
const $hauptzeile = document.querySelector('.blanket-text__hauptzeile');
const $untertitel = document.querySelector('.blanket-text__untertitel');
const $textBlock = document.querySelector('.blanket-text');

function ensurePhotoSlot(slotIndex) {
  let el = $frame.querySelector(`.blanket-photo[data-slot="${slotIndex}"]`);
  if (!el) {
    el = document.createElement('div');
    el.className = 'blanket-photo shape-circle';
    el.dataset.slot = String(slotIndex);
    $frame.appendChild(el);
  }
  return el;
}
function setSlotImage(el, url) {
  if (!el) return;
  if (url) {
    el.style.display = '';
    let img = el.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = '';
      el.appendChild(img);
    }
    img.src = url;
  } else {
    el.style.display = 'none';
    const img = el.querySelector('img');
    if (img) img.remove();
  }
}

function render(s) {
  $renderArea.dataset.material = s.material;

  // Aspect-Ratio
  if ($frame) {
    $frame.style.setProperty('--blanket-aspect', String(currentAspect(s)));
  }

  // Foto-Anzahl als data-attribute (CSS-Hook für 1- vs 2-Foto-Layout)
  $renderArea.dataset.photoCount = String(s.photo_count || 1);

  // Text
  if ($hauptzeile) $hauptzeile.textContent = s.hauptzeile || '';
  if ($untertitel) $untertitel.textContent = s.untertitel || '';
  if ($textBlock) {
    const fontDef = FONT_STYLES[s.text_font_style] || FONT_STYLES.script;
    $textBlock.style.fontFamily = fontDef.font;
    $textBlock.dataset.fontStyle = s.text_font_style;
    if ($hauptzeile) $hauptzeile.style.fontWeight = String(fontDef.weight);
  }

  // Foto-Slots
  const slot1 = ensurePhotoSlot(1);
  const slot2 = ensurePhotoSlot(2);
  setSlotImage(slot1, s.photo_url);
  /* Slot 2 nur wenn photo_count == 2 */
  if (s.photo_count === 2) {
    setSlotImage(slot2, s.photo2_url);
  } else {
    setSlotImage(slot2, null);
    slot2.style.display = 'none';
  }

  // has-photo dataset (für Layout-Triggern in CSS)
  $renderArea.dataset.hasPhoto = (s.photo_url || s.photo2_url) ? 'true' : 'false';
}

subscribe(render);
render(state);
