import type { KasviKoodi, Ravinteet } from '../models/lohko';

// HUOM: Kaikki tämän luettelon rajat, tuotteet ja varoajat ovat
// yksinkertaistettuja, kuvitteellisia harjoitusarvoja. Ne EIVÄT ole
// agronomista tai juridista ohjeistusta.

export interface Kasvi {
  koodi: KasviKoodi;
  nimi: string;
  /** Suurin sallittu ravinnemäärä satovuotta kohden, kg/ha. */
  ravinnerajatKgPerHa: Ravinteet;
}

export const KASVIT: Record<KasviKoodi, Kasvi> = {
  ohra: {
    koodi: 'ohra',
    nimi: 'Ohra',
    ravinnerajatKgPerHa: { n: 120, p: 15, k: 60 },
  },
  kaura: {
    koodi: 'kaura',
    nimi: 'Kaura',
    ravinnerajatKgPerHa: { n: 110, p: 15, k: 55 },
  },
  sailorehunurmi: {
    koodi: 'sailorehunurmi',
    nimi: 'Säilörehunurmi',
    ravinnerajatKgPerHa: { n: 180, p: 20, k: 90 },
  },
};

export interface Kasvinsuojeluaine {
  nimi: string;
  /** Ruiskutus on sallittu tähän BBCH-kasvuasteeseen asti (raja mukaan lukien). */
  maxBbchAste: number;
  /** Vähimmäisaika päivinä ruiskutuksen ja sadonkorjuun välillä (varoaika). */
  varoaikaPv: number;
}

export const KASVINSUOJELUAINEET: Record<string, Kasvinsuojeluaine> = {
  'Ariane S': { nimi: 'Ariane S', maxBbchAste: 39, varoaikaPv: 35 },
  'Fungex 250': { nimi: 'Fungex 250', maxBbchAste: 61, varoaikaPv: 21 },
  GrassGuard: { nimi: 'GrassGuard', maxBbchAste: 45, varoaikaPv: 14 },
};
