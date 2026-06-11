import { KASVIT, type Kasvi } from '../data/katalogi';
import { RuleViolationError } from '../errors';
import type { Lohko, Ravinteet } from '../models/lohko';
import { toimenpideRepository } from '../repositories/toimenpideRepository';

/** Tämän rajaosuuden ylittävät levitykset onnistuvat, mutta varoituksella. */
export const VAROITUSKYNNYS = 0.9;

const RAVINTEET = ['n', 'p', 'k'] as const;

function ravinteetLevityksesta(maaraKgPerHa: number, pitoisuusPct: Ravinteet): Ravinteet {
  return {
    n: (maaraKgPerHa * pitoisuusPct.n) / 100,
    p: (maaraKgPerHa * pitoisuusPct.p) / 100,
    k: (maaraKgPerHa * pitoisuusPct.k) / 100,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface RavinneTilanne {
  satovuosi: number;
  kasvi: Kasvi;
  rajatKgPerHa: Ravinteet;
  kaytettyKgPerHa: Ravinteet;
  jaljellaKgPerHa: Ravinteet;
}

export const ravinneService = {
  /** Lohkolle satovuonna levitettyjen ravinteiden summa, kg/ha. */
  computeUsed(lohkoId: string, satovuosi: number): Ravinteet {
    const kaytetty = { n: 0, p: 0, k: 0 };
    for (const toimenpide of toimenpideRepository.listByLohko(lohkoId, satovuosi)) {
      if (toimenpide.tyyppi !== 'lannoitus') continue;
      const levitys = ravinteetLevityksesta(
        toimenpide.maaraKgPerHa,
        toimenpide.ravinnepitoisuusPct,
      );
      kaytetty.n += levitys.n;
      kaytetty.p += levitys.p;
      kaytetty.k += levitys.k;
    }
    return { n: round(kaytetty.n), p: round(kaytetty.p), k: round(kaytetty.k) };
  },

  getStatus(lohko: Lohko, satovuosi: number): RavinneTilanne {
    const kasviKoodi = lohko.kasvit[satovuosi];
    if (!kasviKoodi) {
      throw new RuleViolationError(
        'EI_VILJELYKASVIA',
        `Lohkolle "${lohko.nimi}" ei ole suunniteltu kasvia satovuodelle ${satovuosi}`,
      );
    }
    const kasvi = KASVIT[kasviKoodi];
    const kaytetty = this.computeUsed(lohko.id, satovuosi);
    const rajat = kasvi.ravinnerajatKgPerHa;
    return {
      satovuosi,
      kasvi,
      rajatKgPerHa: rajat,
      kaytettyKgPerHa: kaytetty,
      jaljellaKgPerHa: {
        n: round(rajat.n - kaytetty.n),
        p: round(rajat.p - kaytetty.p),
        k: round(rajat.k - kaytetty.k),
      },
    };
  },

  /**
   * Tarkistaa aiotun lannoituksen kasvin laillisia rajoja vasten. Heittää,
   * kun jokin ravinne ylittäisi rajansa; palauttaa varoituksia, kun levitys
   * nostaa käytön yli VAROITUSKYNNYS-osuuden rajasta.
   */
  checkApplication(
    lohko: Lohko,
    satovuosi: number,
    maaraKgPerHa: number,
    ravinnepitoisuusPct: Ravinteet,
  ): { varoitukset: string[] } {
    const tilanne = this.getStatus(lohko, satovuosi);
    const levitys = ravinteetLevityksesta(maaraKgPerHa, ravinnepitoisuusPct);
    const varoitukset: string[] = [];

    for (const ravinne of RAVINTEET) {
      const raja = tilanne.rajatKgPerHa[ravinne];
      if (raja === 0) continue;
      const yhteensa = tilanne.kaytettyKgPerHa[ravinne] + levitys[ravinne];
      if (yhteensa > raja) {
        throw new RuleViolationError(
          'RAVINNERAJA_YLITTYY',
          `Levitys ylittäisi kasvin ${tilanne.kasvi.nimi} ${ravinne.toUpperCase()}-rajan: ` +
            `${round(yhteensa)} kg/ha > ${raja} kg/ha`,
          { ravinne, rajaKgPerHa: raja, yhteensaKgPerHa: round(yhteensa) },
        );
      }
      if (yhteensa > raja * VAROITUSKYNNYS) {
        varoitukset.push(
          `${ravinne.toUpperCase()}-määrä nousisi tasolle ${round(yhteensa)} / ${raja} kg/ha ` +
            `(${Math.round((yhteensa / raja) * 100)} % rajasta)`,
        );
      }
    }
    return { varoitukset };
  },
};
