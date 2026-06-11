import { z } from 'zod';
import { kasviKoodiSchema } from './lohko';

const isoPvm = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Odotettiin ISO-päivämäärää (VVVV-KK-PP)');

export const kylvoSyoteSchema = z.object({
  tyyppi: z.literal('kylvo'),
  pvm: isoPvm,
  kasvi: kasviKoodiSchema,
  lajike: z.string().min(1),
  siementyyppi: z.enum(['sertifioitu', 'tilan-oma', 'muu']),
  kylvomaaraKgPerHa: z.number().positive(),
});

export const lannoitusSyoteSchema = z.object({
  tyyppi: z.literal('lannoitus'),
  pvm: isoPvm,
  tuote: z.string().min(1),
  maaraKgPerHa: z.number().positive(),
  /** Tuotteen ravinnepitoisuus painoprosentteina (esim. NPK 20-3-8). */
  ravinnepitoisuusPct: z.object({
    n: z.number().min(0).max(100),
    p: z.number().min(0).max(100),
    k: z.number().min(0).max(100),
  }),
});

export const ruiskutusSyoteSchema = z.object({
  tyyppi: z.literal('ruiskutus'),
  pvm: isoPvm,
  /** Tuotteen on löydyttävä kasvinsuojeluaineluettelosta. */
  tuote: z.string().min(1),
  /** Havaittu BBCH-kasvuaste (0–99) ruiskutushetkellä. */
  bbchAste: z.number().int().min(0).max(99),
  vesimaaraLPerHa: z.number().positive().optional(),
});

export const toimenpideSyoteSchema = z.discriminatedUnion('tyyppi', [
  kylvoSyoteSchema,
  lannoitusSyoteSchema,
  ruiskutusSyoteSchema,
]);

export type KylvoSyote = z.infer<typeof kylvoSyoteSchema>;
export type LannoitusSyote = z.infer<typeof lannoitusSyoteSchema>;
export type RuiskutusSyote = z.infer<typeof ruiskutusSyoteSchema>;
export type ToimenpideSyote = z.infer<typeof toimenpideSyoteSchema>;

interface TallennetutKentat {
  id: string;
  lohkoId: string;
  /** Johdetaan toimenpiteen päivämäärästä; kaikki kirjataan satovuodelle. */
  satovuosi: number;
}

export type KylvoToimenpide = KylvoSyote & TallennetutKentat;
export type LannoitusToimenpide = LannoitusSyote & TallennetutKentat;
export type RuiskutusToimenpide = RuiskutusSyote &
  TallennetutKentat & {
    /** Ruiskutuspäivä + tuotteen varoaika. */
    aikaisinKorjuuPvm: string;
  };

export type Toimenpide = KylvoToimenpide | LannoitusToimenpide | RuiskutusToimenpide;
