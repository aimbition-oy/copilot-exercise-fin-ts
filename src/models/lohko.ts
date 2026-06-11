import { z } from 'zod';

export const kasviKoodiSchema = z.enum(['ohra', 'kaura', 'sailorehunurmi']);
export type KasviKoodi = z.infer<typeof kasviKoodiSchema>;

export interface Ravinteet {
  /** Typpi, kg/ha */
  n: number;
  /** Fosfori, kg/ha */
  p: number;
  /** Kalium, kg/ha */
  k: number;
}

/**
 * Peltolohko — perusyksikkö, johon kaikki Lohkokirjassa kirjataan.
 */
export interface Lohko {
  id: string;
  nimi: string;
  pintaAlaHa: number;
  /** Viljelysuunnitelma: mikä kasvi kasvaa minäkin satovuonna. */
  kasvit: Record<number, KasviKoodi>;
}
