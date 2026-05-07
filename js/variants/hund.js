/* Variant: Hund. Pfotenabdrücke in 4 Ecken, Tiername-Input,
 * Hauptzeile-Dropdown (PetPrinted-Pattern). */
export default {
  variant_name: 'hund',
  product_label: 'Personalisierte Hundematte',
  decoration_png: 'assets/decorations/pfote.png',
  decoration_toggle_label: 'Pfoten anzeigen/ausblenden',
  hauptzeile_input_mode: 'animal_name',     // separater Tiername-Input + festes Prefix
  hauptzeile_templates: [
    'Willkommen bei',
    'Hier wohnt',
    'Hier wohnen',
    'Hello bei',
  ],
  default_hauptzeile_template: 'Willkommen bei',
  default_animal_name: 'BALU',
  default_untertitel: 'Familie Müller lebt hier auch...',
  cart_product_type: 'Personalisierte Hundematte',
};
