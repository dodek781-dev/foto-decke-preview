/* Text-Tab: 2 Inputs (Hauptzeile + Untertitel) + Quick-Templates + Font-Style.
 * Pattern angelehnt an Mama-Definitionsposter, aber schmaler (2 statt 4 Zeilen). */
import { setState, state, HAUPTZEILE_TEMPLATES, FONT_STYLES } from './state.js';

const $hauptInput = document.getElementById('input-hauptzeile');
const $unterInput = document.getElementById('input-untertitel');
const $templateRow = document.getElementById('hauptzeile-templates');
const $fontStyleRow = document.querySelectorAll('.text-font-btn');

if ($hauptInput) {
  $hauptInput.value = state.hauptzeile;
  $hauptInput.addEventListener('input', e => {
    setState({ hauptzeile: e.target.value });
  });
}

if ($unterInput) {
  $unterInput.value = state.untertitel;
  $unterInput.addEventListener('input', e => {
    setState({ untertitel: e.target.value });
  });
}

/* Quick-Template-Buttons: Click setzt die Hauptzeile auf den Template-Wert.
 * User kann danach im Input weiter editieren (z.B. "Familie" → "Familie Müller"). */
if ($templateRow) {
  HAUPTZEILE_TEMPLATES.forEach(template => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hauptzeile-template-btn';
    btn.textContent = template;
    btn.addEventListener('click', e => {
      e.preventDefault();
      if ($hauptInput) $hauptInput.value = template;
      setState({ hauptzeile: template });
    });
    $templateRow.appendChild(btn);
  });
}

/* Font-Style-Buttons (Modern/Elegant/Verspielt) */
$fontStyleRow.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const style = btn.dataset.style;
    if (!style || !FONT_STYLES[style]) return;
    document.querySelectorAll('.text-font-btn').forEach(b => {
      b.classList.toggle('current', b === btn);
    });
    setState({ text_font_style: style });
  });
});
