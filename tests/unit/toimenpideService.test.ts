import { beforeEach, describe, expect, it } from 'vitest';
import { seedDemoData } from '../../src/data/seed';
import { NotFoundError, RuleViolationError } from '../../src/errors';
import { lohkoService } from '../../src/services/lohkoService';
import { toimenpideService } from '../../src/services/toimenpideService';

beforeEach(() => {
  seedDemoData();
});

describe('toimenpideService.add — ruiskutus', () => {
  it('laskee aikaisimman korjuupäivän varoajasta', () => {
    const { toimenpide } = toimenpideService.add('myllyhaka', {
      tyyppi: 'ruiskutus',
      pvm: '2026-06-10',
      tuote: 'Fungex 250', // varoaika 21 pv
      bbchAste: 45,
    });

    expect(toimenpide.tyyppi).toBe('ruiskutus');
    if (toimenpide.tyyppi === 'ruiskutus') {
      expect(toimenpide.aikaisinKorjuuPvm).toBe('2026-07-01');
    }
  });

  it('hylkää tuotteet, joita ei ole luettelossa', () => {
    expect(() =>
      toimenpideService.add('myllyhaka', {
        tyyppi: 'ruiskutus',
        pvm: '2026-06-10',
        tuote: 'Keksitty Aine 9000',
        bbchAste: 30,
      }),
    ).toThrowError(/ei ole kasvinsuojeluaineluettelossa/);
  });

  it('hylkää ruiskutuksen tuotteen BBCH-rajan jälkeen', () => {
    expect(() =>
      toimenpideService.add('myllyhaka', {
        tyyppi: 'ruiskutus',
        pvm: '2026-06-10',
        tuote: 'Ariane S', // max BBCH 39
        bbchAste: 45,
      }),
    ).toThrowError(RuleViolationError);
  });
});

describe('toimenpideService.add — kylvo', () => {
  it('rekisteröi kasvin suunnittelemattomalle vuodelle', () => {
    toimenpideService.add('rantapelto', {
      tyyppi: 'kylvo',
      pvm: '2027-05-05',
      kasvi: 'kaura',
      lajike: 'Niklas',
      siementyyppi: 'sertifioitu',
      kylvomaaraKgPerHa: 190,
    });

    expect(lohkoService.get('rantapelto').kasvit[2027]).toBe('kaura');
  });

  it('hylkää suunnitelmasta poikkeavan kasvin kylvön', () => {
    expect(() =>
      toimenpideService.add('rantapelto', {
        tyyppi: 'kylvo',
        pvm: '2026-05-20',
        kasvi: 'kaura',
        lajike: 'Niklas',
        siementyyppi: 'sertifioitu',
        kylvomaaraKgPerHa: 190,
      }),
    ).toThrowError(/suunniteltu ohra/);
  });
});

describe('toimenpideService.aikaisinKorjuuPvm', () => {
  it('palauttaa myöhäisimmän varoajan päättymisen ruiskutusten yli', () => {
    toimenpideService.add('rantapelto', {
      tyyppi: 'ruiskutus',
      pvm: '2026-06-20',
      tuote: 'Fungex 250', // 21 pv -> 2026-07-11, myöhempi kuin seedattu 2026-07-07
      bbchAste: 50,
    });

    expect(toimenpideService.aikaisinKorjuuPvm('rantapelto', 2026)).toBe('2026-07-11');
  });

  it('palauttaa null, kun mikään ruiskutus ei rajoita korjuuta', () => {
    expect(toimenpideService.aikaisinKorjuuPvm('kotipelto', 2026)).toBeNull();
  });
});

describe('toimenpideService.list', () => {
  it('hylkää tuntemattomat lohkot', () => {
    expect(() => toimenpideService.list('olematon')).toThrowError(NotFoundError);
  });
});
