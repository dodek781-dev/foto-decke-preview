/* Produkt-Tab — Variant-Picker (Standard/Premium) + Größen-Picker (70x100/100x150/150x200)
 * + Live-Preis aus state.SKU_MAP. Cart-Btn ist Preview-only (kein echter Cart bis
 * Theme-Migration). */
import { setState, state, SKU_MAP } from './state.js';

/* Verkaufspreise (EUR) — fest verdrahtet, ~3x Merchone-Einkauf orientiert.
 * Werden später aus Shopify-Variants gelesen, sobald ins Theme migriert. */
const SALE_PRICES = {
  'standard': { '70x100': 39.90, '100x150': 59.90, '150x200': 89.90 },
  'premium':  { '70x100': 69.90, '100x150': 99.90, '150x200': 149.90 },
};

const $variantLinks = document.querySelectorAll('#variant-picker > li > a');
const $sizeLinks = document.querySelectorAll('#size-picker > a');
const $sizePrices = document.querySelectorAll('#size-picker .size-price');
const $priceDisplay = document.getElementById('variant-price');
const $orientationLinks = document.querySelectorAll('#orientation-picker > li > a');

function fmtPrice(eur) {
  return '€' + eur.toFixed(2).replace('.', ',');
}

function refreshPrices() {
  const v = state.variant;
  const prices = SALE_PRICES[v] || SALE_PRICES['standard'];
  $sizeLinks.forEach((link, i) => {
    const size = link.dataset.size;
    const priceEl = link.querySelector('.size-price');
    if (priceEl && prices[size] != null) {
      priceEl.textContent = fmtPrice(prices[size]);
    }
  });
  if ($priceDisplay) {
    const cur = prices[state.size] || prices['70x100'];
    $priceDisplay.textContent = fmtPrice(cur);
  }
}

/* Orientation-Picker (Tab 1) — Quer/Hochformat */
$orientationLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $orientationLinks.forEach(l => l.classList.toggle('current', l === link));
    setState({ orientation: link.dataset.orientation });
  });
});

/* Variant-Picker — Standard / Premium */
$variantLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $variantLinks.forEach(l => l.classList.toggle('current', l === link));
    setState({ variant: link.dataset.variant });
    refreshPrices();
  });
});

/* Größen-Picker */
$sizeLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    $sizeLinks.forEach(l => l.classList.toggle('current', l === link));
    setState({ size: link.dataset.size });
    refreshPrices();
  });
});

/* Initial-Preise */
refreshPrices();

/* Cart-Btn — V1 Preview-only.
 * Validation wie Fotoposter: ohne Foto öffnet ein Hinweis-Modal. */
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
    /* Cart-Properties die im Live-Theme gesetzt würden — in V1 nur in
     * console.log + alert sichtbar. Wandert später in cart/add.js POST. */
    const skuEntry = (SKU_MAP[state.variant] || {})[state.size];
    const properties = {
      _provider: 'merchone',
      _merchone_product_sku: skuEntry ? skuEntry.sku : '',
      _print_image_url: '(wird vom Hetzner-Render-Server gesetzt)',
      _job_id: '(uuid kommt vom Server)',
      _Photo_Config_JSON: JSON.stringify({
        orientation: state.orientation,
        variant: state.variant,
        size: state.size,
        filter: state.filter,
        crop_width: state.crop_width,
        crop_height: state.crop_height,
        natural_width: state.natural_width,
        natural_height: state.natural_height,
        print_px: skuEntry ? skuEntry.print_px : null,
      }),
      _Product_Type: 'Foto-Decke',
      _Size: skuEntry ? skuEntry.label : state.size,
      _Variant: state.variant === 'premium' ? 'Premium' : 'Standard',
    };
    console.log('[Foto-Decke] Cart-Properties (V1 Preview):', properties);
    alert(
      'Preview: Im Live-Shop würde hier der Cart-Add ausgelöst.\n\n' +
      'product_sku: ' + (properties._merchone_product_sku || '?') + '\n' +
      'orientation: ' + state.orientation + '\n' +
      'variant: ' + state.variant + '\n' +
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
