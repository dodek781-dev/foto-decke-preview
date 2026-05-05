/* Reaktives Rendering — abonniert state.js und schreibt in die DOM.
 * V1: simples Decken-Frame ohne Raum-Mockup. Foto füllt den ganzen Frame
 * (Full-Bleed-Effect) wie es Merchone für Decken empfiehlt. */

import { state, subscribe } from './state.js';

const $renderArea = document.querySelector('.render-area');
const $photo = document.querySelector('.blanket-photo');
const $placeholder = document.querySelector('.blanket-photo__placeholder');

function render(s) {
  // Data-Attributes triggern CSS (Aspect-Switch + Filter)
  $renderArea.dataset.orientation = s.orientation;
  $renderArea.dataset.variant = s.variant;
  if ($photo) $photo.dataset.filter = s.filter;

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
render(state); // Initial-Render
