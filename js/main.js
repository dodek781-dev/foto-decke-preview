/* Module-Imports — State + Render starten von selbst (subscribe + initial render). */
import './render.js';
import './photo-upload.js';
import './filter.js';
import './produkt.js';
import './quality.js';
import './text-inputs.js';

/* Tab-Switching — 3 Tabs (Layout / Text / Produkt) */
const tabLinks = document.querySelectorAll('.main__switcher > ul > li > a');
const tabWrappers = document.querySelectorAll(
  '.layout__wrapper, .text__wrapper, .produkt__wrapper'
);

function activateTab(target) {
  tabLinks.forEach(l => l.classList.toggle('current', l.dataset.tab === target));
  tabWrappers.forEach(wrapper => {
    wrapper.style.display = wrapper.classList.contains(target) ? '' : 'none';
  });
  const switcher = document.querySelector('.main__switcher');
  if (switcher) switcher.scrollTop = 0;
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

document.querySelectorAll('.weiter-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    activateTab(btn.dataset.targetTab);
  });
});
