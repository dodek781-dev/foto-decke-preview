/* Reaktives Rendering — abonniert state.js und schreibt in die DOM.
 * V1.5: Foto-Fußmatte mit Material-Textur als Frame-Hintergrund + Foto
 * darüber als full-bleed (deckt Textur ab wenn Foto da ist; vor Upload
 * zeigt Placeholder mit Textur durchscheinend). */

import { state, subscribe, currentAspect } from './state.js';

const $renderArea = document.querySelector('.render-area');
const $frame = document.querySelector('.blanket-frame');
const $photo = document.querySelector('.blanket-photo');
const $placeholder = document.querySelector('.blanket-photo__placeholder');

function render(s) {
  // Material-Textur als Frame-Hintergrund (CSS-Selektor in render.css)
  $renderArea.dataset.material = s.material;
  if ($photo) $photo.dataset.filter = s.filter;

  // Aspect-Ratio aus aktueller Größe — wechselt bei Size-Switch (70x50 ↔ 140x90)
  if ($frame) {
    $frame.style.setProperty('--blanket-aspect', String(currentAspect(s)));
  }

  // Foto: dataURL als <img>, sonst Placeholder
  if (s.photo_url) {
    let img = $photo.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = '';
      $photo.appendChild(img);
    }
    img.src = s.photo_url;
    if ($placeholder) $placeholder.style.display = 'none';
  } else {
    const img = $photo.querySelector('img');
    if (img) img.remove();
    if ($placeholder) $placeholder.style.display = '';
  }
}

subscribe(render);
render(state);
