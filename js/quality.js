/* Qualitäts-Anzeige (DPI-Check) für Foto-Decken.
 *
 * Decken-Print: Merchone empfiehlt 150 dpi MINIMUM (Print-Area-Guide).
 * Heißt: Schwellen sind anders als beim Poster-Editor (der mit 100/75 dpi
 * arbeitet, weil Poster aus näherer Distanz betrachtet werden).
 *
 * Decken-Schwellen: green >= 150 dpi (passt voll), orange >= 100 (akzeptabel),
 * red < 100 (zu niedrig — Druck wird sichtbar pixelig).
 */
import { state, subscribe } from './state.js';

const QUALITY_THRESHOLDS = { green: 150, orange: 100 };
const STATUS_LABELS = { green: 'Ausgezeichnet', orange: 'Akzeptabel', red: 'Niedrig' };
const ICONS = {
  green:  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5l3 3 5-6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  orange: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  red:    '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

/* "30x40" -> { w: 30, h: 40 } in cm */
function parseSize(sizeStr) {
  if (!sizeStr) return null;
  const m = String(sizeStr).match(/(\d+)x(\d+)/);
  if (!m) return null;
  return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
}

/* DPI-Berechnung: cropped natural px / (paper cm / 2.54) */
function computeQuality(s) {
  if (!s.natural_width || !s.natural_height || !s.photo_url) return null;
  const dim = parseSize(s.size);
  if (!dim) return null;
  const cropW = s.crop_width || 1;
  const cropH = s.crop_height || 1;
  const croppedPxW = s.natural_width * cropW;
  const croppedPxH = s.natural_height * cropH;
  const dpiW = croppedPxW / (dim.w / 2.54);
  const dpiH = croppedPxH / (dim.h / 2.54);
  const dpi = Math.min(dpiW, dpiH);
  let level;
  if (dpi >= QUALITY_THRESHOLDS.green)       level = 'green';
  else if (dpi >= QUALITY_THRESHOLDS.orange) level = 'orange';
  else                                        level = 'red';
  return { level, dpi: Math.round(dpi) };
}

function update(s) {
  const $btn = document.getElementById('photo-quality-btn');
  if (!$btn) return;
  if (!s.photo_url || !s.natural_width) {
    $btn.style.display = 'none';
    return;
  }
  const result = computeQuality(s);
  if (!result) return;
  $btn.style.display = 'flex';
  $btn.setAttribute('data-level', result.level);
  const $status = $btn.querySelector('.quality-status');
  if ($status) $status.textContent = STATUS_LABELS[result.level] || '';
  const $icon = $btn.querySelector('.quality-icon');
  if ($icon) $icon.innerHTML = ICONS[result.level] || ICONS.green;
}

subscribe(update);
update(state);

/* =====================================================================
 * Modal — Click auf Quality-Btn öffnet, listet alle Größen mit Status
 * ===================================================================== */
const QUALITY_CHECK_SIZES = [
  { label: '70 × 50 cm',  w: 70,  h: 50 },
  { label: '140 × 90 cm', w: 140, h: 90 },
];

function renderModalList() {
  const $list = document.getElementById('photo-quality-size-list');
  if (!$list) return;
  $list.innerHTML = '';
  QUALITY_CHECK_SIZES.forEach(size => {
    const sizeKey = size.w + 'x' + size.h;
    const result = computeQuality({ ...state, size: sizeKey });
    if (!result) return;
    const li = document.createElement('li');
    const icon = document.createElement('span');
    icon.className = 'quality-icon';
    icon.setAttribute('data-level', result.level);
    icon.innerHTML = ICONS[result.level] || ICONS.green;
    const labelSpan = document.createElement('span');
    labelSpan.textContent = size.label;
    /* DPI-Zahl bewusst nicht angezeigt — Kunde soll Status (Icon-Farbe)
     * sehen, nicht die exakte DPI-Zahl. Logik+Schwellen bleiben gleich. */
    li.appendChild(icon);
    li.appendChild(labelSpan);
    $list.appendChild(li);
  });
}

const $modal = document.getElementById('photo-quality-modal');
const $btn = document.getElementById('photo-quality-btn');
const $modalClose = document.getElementById('photo-quality-modal-close');

if ($btn) {
  $btn.addEventListener('click', e => {
    e.preventDefault();
    if (!state.photo_url) return;
    renderModalList();
    if ($modal) $modal.classList.add('visible');
  });
}
if ($modalClose) {
  $modalClose.addEventListener('click', e => {
    e.preventDefault();
    if ($modal) $modal.classList.remove('visible');
  });
}
if ($modal) {
  $modal.addEventListener('click', e => {
    if (e.target === $modal) $modal.classList.remove('visible');
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $modal) $modal.classList.remove('visible');
});
