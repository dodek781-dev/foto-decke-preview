/* Foto-Filter-Wahl — 7 Thumbnails (mit Live-Foto-Vorschau pro Filter).
 * Click setzt state.filter; bei Foto-Upload wird der src auf alle
 * Thumbnail-Bilder gesetzt damit der User sieht wie das Foto pro Filter
 * aussehen wuerde. Picker initial display:none, sichtbar nach Upload. */
import { state, setState, subscribe } from './state.js';

const $picker = document.getElementById('filter-picker');
const $items = document.querySelectorAll('#filter-options > li > a');
const $thumbImgs = document.querySelectorAll('.filter-thumb-img');

$items.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $items.forEach(l => l.classList.toggle('current', l === link));
    setState({ filter: link.dataset.filter });
  });
});

/* Sichtbarkeit + Thumbnail-Sources an photo_url koppeln */
function syncThumbs(s) {
  $picker.style.display = s.photo_url ? 'block' : 'none';
  if (s.photo_url) {
    $thumbImgs.forEach(img => {
      if (img.src !== s.photo_url) img.src = s.photo_url;
    });
  }
}
subscribe(syncThumbs);
syncThumbs(state);
