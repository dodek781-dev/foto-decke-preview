/* Layout-Tab Material-Picker + Produkt-Tab Größen-Picker + Cart-Btn-Preview.
 * V1.6 FussmattenKING-Style: Text dominiert, Foto optional. */
import { setState, state, SKU_MAP } from './state.js';

const $materialLinks = document.querySelectorAll('#material-picker > li > a');
const $sizeLinks = document.querySelectorAll('#size-picker > a');
const $priceDisplay = document.getElementById('variant-price');
const $photoCountLinks = document.querySelectorAll('#photo-count-picker > li > a');
const $photoSlot2 = document.querySelector('.photo-slot[data-slot="2"]');

function fmtPrice(eur) {
  return '€' + eur.toFixed(2).replace('.', ',');
}

function refreshPrices() {
  $sizeLinks.forEach(link => {
    const size = link.dataset.size;
    const priceEl = link.querySelector('.size-price');
    const entry = SKU_MAP[size];
    if (priceEl && entry) priceEl.textContent = fmtPrice(entry.price_eur);
  });
  if ($priceDisplay) {
    const cur = SKU_MAP[state.size] || SKU_MAP['70x50'];
    $priceDisplay.textContent = fmtPrice(cur.price_eur);
  }
}

/* Foto-Anzahl-Picker (Layout-Tab) — 1 oder 2 Fotos nebeneinander */
$photoCountLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $photoCountLinks.forEach(l => l.classList.toggle('current', l === link));
    const count = parseInt(link.dataset.photoCount || '1', 10);
    setState({ photo_count: count });
    /* Slot 2 ein-/ausblenden */
    if ($photoSlot2) $photoSlot2.style.display = (count === 2) ? '' : 'none';
  });
});

/* Material-Picker (Layout-Tab) */
$materialLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $materialLinks.forEach(l => l.classList.toggle('current', l === link));
    setState({ material: link.dataset.material });
  });
});

/* Größen-Picker (Produkt-Tab) — wechselt SKU, Preis, Aspect */
$sizeLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $sizeLinks.forEach(l => l.classList.toggle('current', l === link));
    setState({ size: link.dataset.size });
    refreshPrices();
  });
});

refreshPrices();

/* Cart-Btn — V1 Preview-only.
 * Validation: Hauptzeile muss da sein (Foto ist optional bei FussmattenKING-Style). */
const $cartBtn = document.getElementById('cart-btn');
const $noticeModal = document.getElementById('cart-no-photo-modal');
const $noticeClose = document.getElementById('cart-no-photo-close');
const $noticeCta = document.getElementById('cart-no-photo-cta');

function openNoticeModal() { if ($noticeModal) $noticeModal.classList.add('visible'); }
function closeNoticeModal() { if ($noticeModal) $noticeModal.classList.remove('visible'); }

if ($cartBtn) {
  $cartBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!state.hauptzeile || !state.hauptzeile.trim()) {
      openNoticeModal();
      return;
    }
    const skuEntry = SKU_MAP[state.size];
    const properties = {
      _provider: 'merchone',
      _merchone_product_sku: skuEntry ? skuEntry.sku : '',
      _print_image_url: '(wird vom Hetzner-Render-Server gesetzt)',
      _job_id: '(uuid kommt vom Server)',
      _Photo_Config_JSON: JSON.stringify({
        material: state.material,
        size: state.size,
        photo_count: state.photo_count,
        hauptzeile: state.hauptzeile,
        untertitel: state.untertitel,
        text_font_style: state.text_font_style,
        photo: state.photo_url ? {
          present: true,
          crop_width: state.crop_width,
          crop_height: state.crop_height,
          natural_width: state.natural_width,
          natural_height: state.natural_height,
        } : null,
        photo2: (state.photo_count === 2 && state.photo2_url) ? {
          present: true,
          crop_width: state.crop_width_2,
          crop_height: state.crop_height_2,
          natural_width: state.natural_width_2,
          natural_height: state.natural_height_2,
        } : null,
        print_px: skuEntry ? skuEntry.print_px : null,
      }),
      _Product_Type: 'Personalisierte Fußmatte',
      _Size: skuEntry ? skuEntry.label : state.size,
      _Material: state.material,
      _Hauptzeile: state.hauptzeile,
      _Untertitel: state.untertitel,
    };
    console.log('[Foto-Fußmatte] Cart-Properties (V1 Preview):', properties);
    alert(
      'Preview: Im Live-Shop würde hier der Cart-Add ausgelöst.\n\n' +
      'product_sku: ' + (properties._merchone_product_sku || '?') + '\n' +
      'material: ' + state.material + '\n' +
      'size: ' + state.size + '\n' +
      'hauptzeile: ' + state.hauptzeile + '\n' +
      'untertitel: ' + state.untertitel
    );
  });
}

if ($noticeClose) $noticeClose.addEventListener('click', closeNoticeModal);
if ($noticeModal) {
  $noticeModal.addEventListener('click', e => {
    if (e.target === $noticeModal) closeNoticeModal();
  });
}
if ($noticeCta) {
  $noticeCta.addEventListener('click', e => {
    e.preventDefault();
    closeNoticeModal();
    const textTab = document.querySelector('.main__switcher > ul > li > a[data-tab="text__wrapper"]');
    if (textTab) textTab.click();
    setTimeout(() => {
      const input = document.getElementById('input-hauptzeile');
      if (input) input.focus();
    }, 200);
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $noticeModal && $noticeModal.classList.contains('visible')) {
    closeNoticeModal();
  }
});
