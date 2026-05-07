/* Variant-Loader. Liest ?variant=… aus URL, gibt active Config zurück.
 * Default: mensch. */
import mensch from './mensch.js';
import hund from './hund.js';
import katze from './katze.js';
import pferd from './pferd.js';

const VARIANTS = { mensch, hund, katze, pferd };

const params = new URLSearchParams(window.location.search);
const requested = (params.get('variant') || 'mensch').toLowerCase();

export const variant = VARIANTS[requested] || VARIANTS.mensch;
