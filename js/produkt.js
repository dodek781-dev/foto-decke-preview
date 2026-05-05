/* Produkt-Tab + Layout-Tab Picker — Foto-Fußmatte V1.5
 * - Material-Picker (Caramel/Grau/Schwarz) im Layout-Tab
 * - Größen-Picker (70×50 / 140×90) im Produkt-Tab
 * - Cart-Btn als Preview-only (kein echter Cart bis Theme-Migration) */
import { setState, state, SKU_MAP } from './state.js';

const $materialLinks = document.querySelectorAll('#material-picker > li > a');
const $sizeLinks = document.querySelectorAll('#size-picker > a');
const $priceDisplay = document.getElementById('variant-price');

function fmtPrice(eur) {
  return '€' + eur.toFixed(2).replace('.', ',');
}

function refreshPrices() {
  // Pro Größen-Link den Preis aus SKU_MAP setzen
  $sizeLinks.forEach(link => {
    const size = link.dataset.size;
    const priceEl = link.querySelector('.size-price');
    const entry = SKU_MAP[size];
    if (priceEl && entry) {
      priceEl.textContent = fmtPrice(entry.price_eur);
    }
  });
  // Header-Preis aus aktueller Größe
  if ($priceDisplay) {
    const cur = SKU_MAP[state.size] || SKU_MAP['70x50'];
    $priceDisplay.textContent = fmtPrice(cur.price_eur);
  }
}

/* Material-Picker (Layout-Tab) — Textur-Farbe der Fußmatte */
$materialLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $materialLinks.forEach(l => l.classList.toggle('current', l === link));
    setState({ material: link.dataset.material });
  });
});

/* Größen-Picker (Produkt-Tab) — wechselt SKU, Preis, und Frame-Aspect */
$sizeLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $sizeLinks.forEach(l => l.classList.toggle('current', l === link));
    setState({ size: link.dataset.size });
    refreshPrices();
    /* Bei Größen-Wechsel ändert sich das Aspect (70×50 = 1.4, 140×90 ≈ 1.556).
     * render.js setzt --blanket-aspect daraus.
     * Wenn schon ein Foto gecroppt ist, müsste der User es neu zuschneiden —
     * für V1 lassen wir's: object-fit:cover clipt das Foto, akzeptabler Default. */
  });
});

/* Initial-Preise */
refreshPrices();

/* Cart-Btn — V1 Preview-only.
 * Validation: ohne Foto öffnet ein Hinweis-Modal. */
const $cartBtn = document.getElementById('cart-btn');
const $noticeModal = document.getElementById('cart-no-photo-modal');
const $noticeClose = document.getElementById('cart-no-photo-close');
const $noticeCta = document.getElementById('cart-no-photo-cta');

function openNoticeModal() { if ($noticeModal) $noticeModal.classList.add('visible'); }
function closeNoticeModal() { if ($noticeModal) $noticeModal.classList.remove('visible'); }

if ($cartBtn) {
  $cartBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!state.photo_url) {
      openNoticeModal();
      return;
    }
    /* Cart-Properties die im Live-Theme gesetzt würden — V1 nur in
     * console.log + alert sichtbar. Wandert später in cart/add.js POST. */
    const skuEntry = SKU_MAP[state.size];
    const properties = {
      _provider: 'merchone',
      _merchone_product_sku: skuEntry ? skuEntry.sku : '',
      _print_image_url: '(wird vom Hetzner-Render-Server gesetzt)',
      _job_id: '(uuid kommt vom Server)',
      _Photo_Config_JSON: JSON.stringify({
        material: state.material,
        size: state.size,
        filter: state.filter,
        crop_width: state.crop_width,
        crop_height: state.crop_height,
        natural_width: state.natural_width,
        natural_height: state.natural_height,
        print_px: skuEntry ? skuEntry.print_px : null,
      }),
      _Product_Type: 'Foto-Fußmatte',
      _Size: skuEntry ? skuEntry.label : state.size,
      _Material: state.material,
    };
    console.log('[Foto-Fußmatte] Cart-Properties (V1 Preview):', properties);
    alert(
      'Preview: Im Live-Shop würde hier der Cart-Add ausgelöst.\n\n' +
      'product_sku: ' + (properties._merchone_product_sku || '?') + '\n' +
      'material: ' + state.material + '\n' +
      'size: ' + state.size
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
    const layoutTab = document.querySelector('.main__switcher > ul > li > a[data-tab="layout__wrapper"]');
    if (layoutTab) layoutTab.click();
    setTimeout(() => {
      const zone = document.getElementById('photo-upload-zone');
      if (zone) zone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $noticeModal && $noticeModal.classList.contains('visible')) {
    closeNoticeModal();
  }
});
