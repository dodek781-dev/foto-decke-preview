/* Foto-Upload mit Cropper.js — V1.7 mit 2-Slot-Support + kreisförmigem Crop.
 *
 * - Crop ist mathematisch quadratisch (aspectRatio: 1), Cropper-Modal-CSS
 *   maskiert .cropper-view-box / .cropper-face als Kreis (border-radius: 50%)
 *   damit der User visuell kreisförmig zuschneidet — Render-Foto ist eh in
 *   .blanket-photo.shape-circle Container mit border-radius: 50%.
 * - 2 Foto-Slots via data-slot Attribute. pendingSlot tracked welcher gerade
 *   gecroppt wird.
 *
 * State-Felder pro Slot:
 *   Slot 1: photo_url, photo_url_original, natural_width, natural_height,
 *           crop_width, crop_height
 *   Slot 2: photo2_url, photo2_url_original, natural_width_2, natural_height_2,
 *           crop_width_2, crop_height_2
 */

import { state, setState } from './state.js';

const ACCEPT_MIME = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const MAX_SIDE_PX = 2400;

let cropperInstance = null;
let pendingFileName = null;
let pendingSlot = 1;            // welcher Foto-Slot wird gerade gecroppt

// Cropper-Modal-Refs (geshared)
let cropperBackdrop, cropperImage, applyBtn, cancelBtn, uploadStatusEl;

// -------------------------------------------------------------------
// Status-Anzeige
// -------------------------------------------------------------------
function showUploadStatus(slot, state, label, pct) {
  const el = document.querySelector(`.photo-upload-status[data-slot="${slot}"]`)
          || document.getElementById('photo-upload-status');
  if (!el) return;
  el.className = 'photo-upload-status is-' + state;
  el.dataset.slot = String(slot);
  if (state === 'uploading') {
    const safePct = Math.max(0, Math.min(100, Math.round(pct || 0)));
    el.innerHTML =
      '<div>' + label + ' ' + safePct + '%</div>' +
      '<span class="progress-bar"><span class="progress-bar-fill" style="width:' + safePct + '%"></span></span>';
  } else {
    el.textContent = label;
  }
}
function hideUploadStatus(slot) {
  const el = document.querySelector(`.photo-upload-status[data-slot="${slot}"]`)
          || document.getElementById('photo-upload-status');
  if (!el) return;
  el.className = 'photo-upload-status';
  el.innerHTML = '';
}

// -------------------------------------------------------------------
// Pre-Cropper Resize: max MAX_SIDE_PX Long-Side
// -------------------------------------------------------------------
function resizeDataUrlIfTooLarge(dataUrl, maxSide) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= maxSide && h <= maxSide) {
        resolve({ dataUrl, originalWidth: w, originalHeight: h });
        return;
      }
      const scale = maxSide / Math.max(w, h);
      const sw = Math.round(w * scale);
      const sh = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      canvas.getContext('2d').drawImage(img, 0, 0, sw, sh);
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        originalWidth: w,
        originalHeight: h,
      });
    };
    img.onerror = () => reject(new Error('image decode failed'));
    img.src = dataUrl;
  });
}

// -------------------------------------------------------------------
// Slot-spezifische State-Schreibung
// -------------------------------------------------------------------
function writeOriginalToState(slot, dataUrl, naturalW, naturalH) {
  if (slot === 2) {
    setState({
      photo2_url_original: dataUrl,
      natural_width_2: naturalW,
      natural_height_2: naturalH,
    });
  } else {
    setState({
      photo_url_original: dataUrl,
      natural_width: naturalW,
      natural_height: naturalH,
    });
  }
}
function writeCroppedToState(slot, dataUrl, cropW, cropH) {
  if (slot === 2) {
    setState({
      photo2_url: dataUrl,
      crop_width_2: cropW,
      crop_height_2: cropH,
    });
  } else {
    setState({
      photo_url: dataUrl,
      crop_width: cropW,
      crop_height: cropH,
    });
  }
}
function getOriginalForSlot(slot) {
  return slot === 2 ? state.photo2_url_original : state.photo_url_original;
}

// -------------------------------------------------------------------
// UI-State pro Slot
// -------------------------------------------------------------------
function setSlotUploadedUI(slot, hasPhoto) {
  const slotEl = document.querySelector(`.photo-slot[data-slot="${slot}"]`);
  if (!slotEl) return;
  if (hasPhoto) {
    slotEl.classList.add('has-photo');
  } else {
    slotEl.classList.remove('has-photo');
  }
}

// -------------------------------------------------------------------
// File-Handling
// -------------------------------------------------------------------
function handleFile(file, slot) {
  if (!file) return;
  const isHeic = /\.heic$|\.heif$/i.test(file.name) ||
                 file.type === 'image/heic' || file.type === 'image/heif';
  if (!isHeic && !ACCEPT_MIME.includes(file.type)) {
    alert('Dateityp nicht unterstützt. Bitte JPG, PNG oder HEIC.');
    return;
  }
  pendingFileName = file.name;
  pendingSlot = slot;
  showUploadStatus(slot, 'uploading', 'Bild wird hochgeladen…', 0);

  const reader = new FileReader();
  reader.onprogress = (ev) => {
    if (ev.lengthComputable) {
      const pct = (ev.loaded / ev.total) * 50;
      showUploadStatus(slot, 'uploading', 'Bild wird hochgeladen…', pct);
    }
  };
  reader.onload = (ev) => {
    showUploadStatus(slot, 'uploading', 'Bild wird hochgeladen…', 60);
    resizeDataUrlIfTooLarge(ev.target.result, MAX_SIDE_PX)
      .then((res) => {
        const { dataUrl, originalWidth, originalHeight } = res;
        showUploadStatus(slot, 'uploading', 'Bild wird hochgeladen…', 100);
        writeOriginalToState(slot, dataUrl, originalWidth, originalHeight);
        setTimeout(() => {
          hideUploadStatus(slot);
          openCropperWithUrl(dataUrl, slot);
        }, 250);
      })
      .catch((err) => {
        console.warn('[photo-upload] resize failed, fallback:', err);
        showUploadStatus(slot, 'error', 'Bild konnte nicht verarbeitet werden.');
        setTimeout(() => {
          hideUploadStatus(slot);
          writeOriginalToState(slot, ev.target.result, 0, 0);
          openCropperWithUrl(ev.target.result, slot);
        }, 500);
      });
  };
  reader.onerror = () => {
    showUploadStatus(slot, 'error', 'Datei konnte nicht gelesen werden.');
    setTimeout(() => hideUploadStatus(slot), 3000);
  };
  reader.readAsDataURL(file);
}

// -------------------------------------------------------------------
// Cropper-Modal — IMMER aspectRatio 1 (quadratisch, visuell als Kreis via CSS)
// -------------------------------------------------------------------
function openCropperWithUrl(url, slot) {
  if (typeof Cropper === 'undefined') {
    console.error('[photo-upload] Cropper.js noch nicht geladen');
    alert('Bild-Editor wird noch geladen. Bitte kurz warten.');
    return;
  }
  pendingSlot = slot;
  cropperImage.src = url;
  cropperBackdrop.classList.add('visible');
  cropperBackdrop.dataset.shape = 'circle';   // CSS-Hook für runde Maske

  if (cropperInstance) {
    try { cropperInstance.destroy(); } catch (e) {}
    cropperInstance = null;
  }
  cropperImage.onload = () => {
    requestAnimationFrame(() => {
      cropperInstance = new Cropper(cropperImage, {
        aspectRatio: 1,                /* Quadrat — Render-Slot ist Kreis (border-radius:50%) */
        viewMode: 1,
        autoCropArea: 1,
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
        cropBoxResizable: true,
        responsive: false,
        background: false,
        modal: true,
        wheelZoomRatio: 0.08,
      });
    });
  };
}

function closeCropperModal() {
  cropperBackdrop.classList.remove('visible');
  if (cropperInstance) {
    try { cropperInstance.destroy(); } catch (e) {}
    cropperInstance = null;
  }
  cropperImage.src = '';
  document.querySelectorAll('.photo-file-input').forEach(inp => { inp.value = ''; });
}

function applyCrop() {
  if (!cropperInstance) return;
  try {
    const canvas = cropperInstance.getCroppedCanvas({
      maxWidth: 2400,
      maxHeight: 2400,
      fillColor: '#ffffff',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const cropData = cropperInstance.getData(true);
    const imageData = cropperInstance.getImageData();
    const sourceW = imageData.naturalWidth || 1;
    const sourceH = imageData.naturalHeight || 1;
    const cropRatioW = Math.min(1, Math.max(0, (cropData.width || sourceW) / sourceW));
    const cropRatioH = Math.min(1, Math.max(0, (cropData.height || sourceH) / sourceH));

    writeCroppedToState(pendingSlot, dataUrl, cropRatioW, cropRatioH);
    setSlotUploadedUI(pendingSlot, true);
  } catch (err) {
    console.error('[photo-upload] getCroppedCanvas failed:', err);
    alert('Foto konnte nicht zugeschnitten werden.');
  }
  closeCropperModal();
}

// -------------------------------------------------------------------
// Init — bindet Click-Handler an alle Foto-Slots via data-slot
// -------------------------------------------------------------------
function init() {
  cropperBackdrop = document.getElementById('photo-cropper-backdrop');
  cropperImage   = document.getElementById('photo-cropper-image');
  applyBtn       = document.getElementById('photo-cropper-apply');
  cancelBtn      = document.getElementById('photo-cropper-cancel');

  if (!cropperBackdrop || !cropperImage) {
    console.warn('[photo-upload] Cropper-Modal-DOM fehlt — skip init');
    return;
  }

  // Pro File-Input + Slot
  document.querySelectorAll('.photo-file-input').forEach(input => {
    const slot = parseInt(input.dataset.slot || '1', 10);
    input.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      handleFile(file, slot);
    });
  });

  // Drag-Drop pro Upload-Zone (falls vorhanden — V1.7 hat klassische Buttons,
  // aber falls ein Slot wieder ne drop-zone bekommt, funktioniert's)
  document.querySelectorAll('.photo-upload-button[data-slot]').forEach(zone => {
    const slot = parseInt(zone.dataset.slot || '1', 10);
    ['dragenter', 'dragover'].forEach(evt => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        zone.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        zone.classList.remove('drag-over');
      });
    });
    zone.addEventListener('drop', (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(file, slot);
    });
  });

  // Recrop pro Slot
  document.querySelectorAll('.photo-recrop-btn[data-slot]').forEach(btn => {
    const slot = parseInt(btn.dataset.slot || '1', 10);
    btn.addEventListener('click', () => {
      const original = getOriginalForSlot(slot);
      if (original) openCropperWithUrl(original, slot);
    });
  });

  // Change pro Slot — öffnet File-Picker neu
  document.querySelectorAll('.photo-change-btn[data-slot]').forEach(btn => {
    const slot = parseInt(btn.dataset.slot || '1', 10);
    btn.addEventListener('click', () => {
      const input = document.querySelector(`.photo-file-input[data-slot="${slot}"]`);
      if (input) input.click();
    });
  });

  // Cropper-Modal-Buttons
  if (applyBtn) applyBtn.addEventListener('click', applyCrop);
  if (cancelBtn) cancelBtn.addEventListener('click', () => {
    closeCropperModal();
    pendingFileName = null;
  });

  // Drag-aware Backdrop-Close
  let backdropArmed = false;
  cropperBackdrop.addEventListener('pointerdown', (e) => {
    backdropArmed = (e.target === cropperBackdrop);
  });
  cropperBackdrop.addEventListener('pointerup', (e) => {
    const shouldClose = backdropArmed && e.target === cropperBackdrop;
    backdropArmed = false;
    if (shouldClose) {
      closeCropperModal();
      pendingFileName = null;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
