import { randomUUID } from 'node:crypto';
import { KASVINSUOJELUAINEET } from '../data/katalogi';
import { RuleViolationError } from '../errors';
import type { Toimenpide, ToimenpideSyote } from '../models/toimenpide';
import { toimenpideRepository } from '../repositories/toimenpideRepository';
import { lohkoService } from './lohkoService';
import { ravinneService } from './ravinneService';

function satovuosiFrom(pvm: string): number {
  return Number(pvm.slice(0, 4));
}

function addDays(pvm: string, paivia: number): string {
  const d = new Date(`${pvm}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + paivia);
  return d.toISOString().slice(0, 10);
}

export interface AddToimenpideResult {
  toimenpide: Toimenpide;
  varoitukset: string[];
}

export const toimenpideService = {
  list(lohkoId: string, satovuosi?: number): Toimenpide[] {
    lohkoService.get(lohkoId); // 404 tuntemattomille lohkoille
    return toimenpideRepository.listByLohko(lohkoId, satovuosi);
  },

  add(lohkoId: string, syote: ToimenpideSyote): AddToimenpideResult {
    const lohko = lohkoService.get(lohkoId);
    const satovuosi = satovuosiFrom(syote.pvm);
    const tallennetut = { id: randomUUID(), lohkoId, satovuosi };
    let varoitukset: string[] = [];
    let toimenpide: Toimenpide;

    switch (syote.tyyppi) {
      case 'kylvo': {
        const suunniteltu = lohko.kasvit[satovuosi];
        if (suunniteltu && suunniteltu !== syote.kasvi) {
          throw new RuleViolationError(
            'KASVI_RISTIRIITA',
            `Lohkolle "${lohko.nimi}" on suunniteltu ${suunniteltu} vuodelle ${satovuosi}, ei ${syote.kasvi}`,
            { suunniteltu, kylvetty: syote.kasvi },
          );
        }
        if (!suunniteltu) {
          // Suunnittelemattoman lohkon kylvö rekisteröi kasvin satovuodelle.
          lohko.kasvit[satovuosi] = syote.kasvi;
        }
        toimenpide = { ...syote, ...tallennetut };
        break;
      }
      case 'lannoitus': {
        varoitukset = ravinneService.checkApplication(
          lohko,
          satovuosi,
          syote.maaraKgPerHa,
          syote.ravinnepitoisuusPct,
        ).varoitukset;
        toimenpide = { ...syote, ...tallennetut };
        break;
      }
      case 'ruiskutus': {
        const aine = KASVINSUOJELUAINEET[syote.tuote];
        if (!aine) {
          throw new RuleViolationError(
            'TUNTEMATON_AINE',
            `"${syote.tuote}" ei ole kasvinsuojeluaineluettelossa`,
            { tunnetutAineet: Object.keys(KASVINSUOJELUAINEET) },
          );
        }
        if (syote.bbchAste > aine.maxBbchAste) {
          throw new RuleViolationError(
            'BBCH_RAJA_YLITETTY',
            `Ainetta ${aine.nimi} ei saa ruiskuttaa BBCH-asteen ${aine.maxBbchAste} jälkeen ` +
              `(kasvusto havaittu asteella BBCH ${syote.bbchAste})`,
            { maxBbchAste: aine.maxBbchAste, havaittuBbchAste: syote.bbchAste },
          );
        }
        toimenpide = {
          ...syote,
          ...tallennetut,
          aikaisinKorjuuPvm: addDays(syote.pvm, aine.varoaikaPv),
        };
        break;
      }
    }

    return { toimenpide: toimenpideRepository.save(toimenpide), varoitukset };
  },

  /**
   * Aikaisin päivä, jolloin sadon saa korjata, kun satovuoden kaikkien
   * ruiskutusten varoajat huomioidaan. Null, kun mikään ei rajoita korjuuta.
   */
  aikaisinKorjuuPvm(lohkoId: string, satovuosi: number): string | null {
    const pvmt = toimenpideRepository
      .listByLohko(lohkoId, satovuosi)
      .filter((t) => t.tyyppi === 'ruiskutus')
      .map((t) => t.aikaisinKorjuuPvm);
    return pvmt.length > 0 ? pvmt.reduce((a, b) => (a > b ? a : b)) : null;
  },
};
