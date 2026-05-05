/* T4: Foto-Upload mit Cropper.js
 *
 * Pattern-Vorbild: distantlines/assets/photo.js (Stadt-/Sternkarten/Foto-Editor).
 * Hier vereinfacht fuer Standalone-Static-Site:
 *   - Kein S3-Upload, kein Server-Print (Preview-Only).
 *   - Kein HEIC-Decode-Pfad — Browser handelt's via accept best-effort.
 *   - Crop-Modal-Aspect wird live aus .poster-photo gemessen statt hartkodiert,
 *     analog zu photo.js Z. 639–646 (CSS-Padding-Quirk + flex-Ratio sind
 *     instabil in Math, DOM ist Source of Truth).
 *   - 2400px Pre-Resize VOR Cropper-Init verhindert OOM bei 24-MP Smartphone-
 *     Fotos (Memory: project_photo_resize_before_cropper.md).
 *
 * State-Integration: setState({ photo_url }) -> render.js zeigt das Foto in
 * .poster-photo > img an.
 */

import { state, setState } from './state.js';

const ACCEPT_MIME = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const MAX_SIDE_PX = 2400;

let cropperInstance = null;
let pendingFileName = null;

// -------------------------------------------------------------------
// DOM-Refs (lazy — nach DOMContentLoaded gesetzt)
// -------------------------------------------------------------------
let uploadZone, fileInput, changeRow, nameDisplay, uploadStatus,
    cropperBackdrop, cropperImage, applyBtn, cancelBtn;

// -------------------------------------------------------------------
// Upload-Status (Bild wird hochgeladen…) mit Progress-Bar
// -------------------------------------------------------------------
function showUploadStatus(state, label, pct) {
  if (!uploadStatus) return;
  uploadStatus.className = 'photo-upload-status is-' + state;
  if (state === 'uploading') {
    const safePct = Math.max(0, Math.min(100, Math.round(pct || 0)));
    uploadStatus.innerHTML =
      '<div>' + label + ' ' + safePct + '%</div>' +
      '<span class="progress-bar"><span class="progress-bar-fill" style="width:' + safePct + '%"></span></span>';
  } else {
    uploadStatus.textContent = label;
  }
}
function hideUploadStatus() {
  if (!uploadStatus) return;
  uploadStatus.className = 'photo-upload-status';
  uploadStatus.innerHTML = '';
}

// -------------------------------------------------------------------
// Pre-Cropper Resize: schrumpft DataURL auf max. MAX_SIDE_PX Long-Side.
// Verhindert Renderer-Crash (Chrome OOM) bei grossen Smartphone-Fotos.
// -------------------------------------------------------------------
function resizeDataUrlIfTooLarge(dataUrl, maxSide) {
  /* Returnt { dataUrl, originalWidth, originalHeight } — Original-Dimensionen
   * werden gemerkt, damit DPI-Quality-Calc auf den echten Pixeln basiert
   * (nicht auf der downscaled 2400px-Variante). */
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
// Aspect-Ratio aus dem DOM messen — exakt wie photo.js Z. 639.
// Editor und Crop muessen 1:1 sein, sonst clipt object-fit:cover spaeter.
// -------------------------------------------------------------------
function measureCropAspect() {
  const el = document.querySelector('.blanket-photo');
  if (!el) return 100 / 70; // Fallback: Decken-Querformat (~1.4286)
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return 100 / 70;
  return rect.width / rect.height;
}

// -------------------------------------------------------------------
// Upload-UI-State: zwischen Dropzone und "Foto-Name + Buttons" wechseln.
// -------------------------------------------------------------------
function showUploadedState(filename) {
  uploadZone.style.display = 'none';
  changeRow.classList.add('visible');
  if (nameDisplay) nameDisplay.textContent = filename || 'Foto.jpg';
  /* Qualitäts-Btn wird von quality.js gesteuert — basiert auf natural_width/-height */
}

function showInitialState() {
  uploadZone.style.display = '';
  changeRow.classList.remove('visible');
  if (nameDisplay) nameDisplay.textContent = '';
}

// -------------------------------------------------------------------
// File-Picking + Drag-Drop
// -------------------------------------------------------------------
function handleFile(file) {
  if (!file) return;

  const isHeic = /\.heic$|\.heif$/i.test(file.name) ||
                 file.type === 'image/heic' || file.type === 'image/heif';

  if (!isHeic && !ACCEPT_MIME.includes(file.type)) {
    alert('Dateityp nicht unterstuetzt. Bitte JPG, PNG oder HEIC.');
    return;
  }

  pendingFileName = file.name;

  /* Status anzeigen — FileReader-Progress feedet Live-Pct */
  showUploadStatus('uploading', 'Bild wird hochgeladen…', 0);

  const reader = new FileReader();
  reader.onprogress = (ev) => {
    if (ev.lengthComputable) {
      // FileReader = ~50% des Gesamt-Progress (2. Hälfte ist Resize+Decode)
      const pct = (ev.loaded / ev.total) * 50;
      showUploadStatus('uploading', 'Bild wird hochgeladen…', pct);
    }
  };
  reader.onload = (ev) => {
    showUploadStatus('uploading', 'Bild wird hochgeladen…', 60);
    // Vor Cropper-Init auf max 2400px Long-Side downscalen — sonst killt
    // Chrome den Renderer bei Pan/Zoom auf grossen Fotos (OOM).
    resizeDataUrlIfTooLarge(ev.target.result, MAX_SIDE_PX)
      .then((res) => {
        const { dataUrl, originalWidth, originalHeight } = res;
        showUploadStatus('uploading', 'Bild wird hochgeladen…', 100);
        /* natural_width/_height fuer DPI-Quality-Calc speichern */
        setState({
          photo_url_original: dataUrl,
          natural_width: originalWidth,
          natural_height: originalHeight,
        });
        /* kurz 100% sichtbar lassen, dann verstecken + Cropper-Modal oeffnen */
        setTimeout(() => {
          hideUploadStatus();
          openCropperWithUrl(dataUrl);
        }, 250);
      })
      .catch((err) => {
        console.warn('[photo-upload] resize failed, fallback to original:', err);
        showUploadStatus('error', 'Bild konnte nicht verarbeitet werden.');
        setTimeout(() => {
          hideUploadStatus();
          setState({ photo_url_original: ev.target.result });
          openCropperWithUrl(ev.target.result);
        }, 500);
      });
  };
  reader.onerror = () => {
    showUploadStatus('error', 'Datei konnte nicht gelesen werden.');
    setTimeout(hideUploadStatus, 3000);
  };
  reader.readAsDataURL(file);
}

// -------------------------------------------------------------------
// Cropper Modal
// -------------------------------------------------------------------
function openCropperWithUrl(url) {
  if (typeof Cropper === 'undefined') {
    console.error('[photo-upload] Cropper.js noch nicht geladen');
    alert('Bild-Editor wird noch geladen. Bitte kurz warten.');
    return;
  }

  cropperImage.src = url;
  cropperBackdrop.classList.add('visible');

  if (cropperInstance) {
    try { cropperInstance.destroy(); } catch (e) {}
    cropperInstance = null;
  }

  cropperImage.onload = () => {
    const cropAspect = measureCropAspect();

    // rAF deferren — Modal-Display-Switch ist sync, aber Layout-Reflow
    // kommt erst im naechsten Frame. Sonst misst Cropper.js die alten
    // 0x0-Container-Maße (display:none vorher).
    requestAnimationFrame(() => {
      cropperInstance = new Cropper(cropperImage, {
        aspectRatio: cropAspect,
        viewMode: 1,
        autoCropArea: 1,
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
        cropBoxResizable: true,
        responsive: false,
        background: false,
        modal: true,         // dunkler Overlay aussserhalb der Crop-Box (wie Fotoposter)
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
  // File-Input zuruecksetzen damit dasselbe File erneut waehlbar bleibt
  if (fileInput) fileInput.value = '';
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

    /* Crop-Ratios (0..1) fuer DPI-Quality-Calc: cropped px / source px.
     * Cropper sieht eine 2400px-downscaled Variante; das Ratio ist invariant
     * gegen Downscaling, gilt also auch fuer die echten Original-Pixel. */
    const cropData = cropperInstance.getData(true); // rounded ints
    const imageData = cropperInstance.getImageData();
    const sourceW = imageData.naturalWidth || 1;
    const sourceH = imageData.naturalHeight || 1;
    const cropRatioW = Math.min(1, Math.max(0, (cropData.width || sourceW) / sourceW));
    const cropRatioH = Math.min(1, Math.max(0, (cropData.height || sourceH) / sourceH));

    setState({
      photo_url: dataUrl,
      crop_width: cropRatioW,
      crop_height: cropRatioH,
    });
    showUploadedState(pendingFileName);
  } catch (err) {
    console.error('[photo-upload] getCroppedCanvas failed:', err);
    alert('Foto konnte nicht zugeschnitten werden.');
  }

  closeCropperModal();
}

// -------------------------------------------------------------------
// Init — DOMContentLoaded handler
// -------------------------------------------------------------------
function init() {
  uploadZone = document.getElementById('photo-upload-zone');
  fileInput = document.getElementById('photo-file-input');
  changeRow = document.getElementById('photo-change-row');
  nameDisplay = document.getElementById('photo-name-display');
  uploadStatus = document.getElementById('photo-upload-status');
  cropperBackdrop = document.getElementById('photo-cropper-backdrop');
  cropperImage = document.getElementById('photo-cropper-image');
  applyBtn = document.getElementById('photo-cropper-apply');
  cancelBtn = document.getElementById('photo-cropper-cancel');

  if (!uploadZone || !fileInput || !cropperBackdrop || !cropperImage) {
    console.warn('[photo-upload] required DOM nodes missing — skipping init');
    return;
  }

  // Click auf Zone -> File-Picker (label-Element triggert das eh, aber
  // wir lassen es defensiv stehen falls jemand das label durch div ersetzt)
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
  });

  // Drag-Drop
  ['dragenter', 'dragover'].forEach(evt => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(evt => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove('drag-over');
    });
  });
  uploadZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });

  // "Neu zuschneiden" -> Modal mit ORIGINAL-DataURL wieder oeffnen
  // (nicht der bereits gecroppten Variante, sonst kann der User nur
  // weiter reinzoomen, nicht wieder rauszoomen).
  const recropBtn = document.getElementById('photo-recrop-btn');
  if (recropBtn) {
    recropBtn.addEventListener('click', () => {
      const original = state.photo_url_original;
      if (original) {
        openCropperWithUrl(original);
      } else {
        // Fallback: was als <img> in der Render-Area liegt
        const img = document.querySelector('.blanket-photo img');
        if (img && img.src) openCropperWithUrl(img.src);
      }
    });
  }

  // "Anderes Foto" -> Datei-Picker erneut oeffnen
  const changeBtn = document.getElementById('photo-change-btn');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  // Modal-Buttons
  applyBtn.addEventListener('click', applyCrop);
  cancelBtn.addEventListener('click', () => {
    closeCropperModal();
    pendingFileName = null;
  });

  // Drag-aware Backdrop-Close: nur schliessen wenn pointerdown UND pointerup
  // auf dem Backdrop selbst stattfanden — sonst frisst ein Drag aus der
  // Crop-Box raus den click und schliesst das Modal ungewollt
  // (photo.js Z. 561–583 Pattern).
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
