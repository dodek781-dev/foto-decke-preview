/* Module-Imports — State + Render starten von selbst (subscribe + initial render). */
import './render.js';
import './photo-upload.js';
import './filter.js';
import './produkt.js';
import './quality.js';

/* Tab-Switching — Pattern aus distantlines starmap.js / photo.js
 * data-tab="layout__wrapper" auf <a> -> zeigt .layout__wrapper, blendet
 * alle anderen Tab-Wrapper aus. Aktiver Tab bekommt .current. */

const tabLinks = document.querySelectorAll('.main__switcher > ul > li > a');
const tabWrappers = document.querySelectorAll(
  '.layout__wrapper, .produkt__wrapper'
);

function activateTab(target) {
  tabLinks.forEach(l => l.classList.toggle('current', l.dataset.tab === target));
  tabWrappers.forEach(wrapper => {
    wrapper.style.display = wrapper.classList.contains(target) ? '' : 'none';
  });
  /* Editor zurueck nach oben scrollen damit User den Anfang vom neuen Tab sieht */
  const switcher = document.querySelector('.main__switcher');
  if (switcher) switcher.scrollTop = 0;
  /* Mobile: Tab-Bar an den Top des Viewports — Switcher wird zum „Stopper". */
  if (window.matchMedia('(max-width: 900px)').matches && switcher) {
    switcher.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

tabLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    activateTab(link.dataset.tab);
  });
});

/* Weiter-Buttons am Ende von Layout-Tab */
document.querySelectorAll('.weiter-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    activateTab(btn.dataset.targetTab);
  });
});
