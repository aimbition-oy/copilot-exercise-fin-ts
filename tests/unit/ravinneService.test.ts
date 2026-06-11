import { beforeEach, describe, expect, it } from 'vitest';
import { seedDemoData } from '../../src/data/seed';
import { RuleViolationError } from '../../src/errors';
import { lohkoService } from '../../src/services/lohkoService';
import { ravinneService } from '../../src/services/ravinneService';

beforeEach(() => {
  seedDemoData();
});

describe('ravinneService.computeUsed', () => {
  it('summaa ravinteet vain lannoitustoimenpiteistä', () => {
    // Seed: NPK 20-3-8, 400 kg/ha -> N 80, P 12, K 32
    expect(ravinneService.computeUsed('rantapelto', 2026)).toEqual({ n: 80, p: 12, k: 32 });
  });

  it('palauttaa nollat vuodelle ilman lannoituksia', () => {
    expect(ravinneService.computeUsed('rantapelto', 2025)).toEqual({ n: 0, p: 0, k: 0 });
  });
});

describe('ravinneService.getStatus', () => {
  it('raportoi rajat, käytön ja jäljellä olevan varan suunnitellulle kasville', () => {
    const lohko = lohkoService.get('rantapelto');
    const tilanne = ravinneService.getStatus(lohko, 2026);

    expect(tilanne.kasvi.koodi).toBe('ohra');
    expect(tilanne.rajatKgPerHa).toEqual({ n: 120, p: 15, k: 60 });
    expect(tilanne.jaljellaKgPerHa).toEqual({ n: 40, p: 3, k: 28 });
  });

  it('hylkää vuoden, jolle ei ole suunniteltu kasvia', () => {
    const lohko = lohkoService.get('rantapelto');
    expect(() => ravinneService.getStatus(lohko, 2030)).toThrowError(RuleViolationError);
  });
});

describe('ravinneService.checkApplication', () => {
  const lohko = () => lohkoService.get('rantapelto');

  it('hyväksyy selvästi turvallisen levityksen ilman varoituksia', () => {
    const result = ravinneService.checkApplication(lohko(), 2026, 40, { n: 20, p: 3, k: 8 });
    expect(result.varoitukset).toEqual([]);
  });

  it('varoittaa, kun levitys nostaa ravinteen yli 90 %:iin rajasta', () => {
    // N käytetty 80; +34 -> 114 / 120 = 95 %
    const result = ravinneService.checkApplication(lohko(), 2026, 170, { n: 20, p: 0, k: 0 });
    expect(result.varoitukset).toHaveLength(1);
    expect(result.varoitukset[0]).toContain('N-määrä');
  });

  it('heittää RAVINNERAJA_YLITTYY, kun raja ylittyisi', () => {
    expect(() =>
      ravinneService.checkApplication(lohko(), 2026, 400, { n: 20, p: 3, k: 8 }),
    ).toThrowError(/ylittäisi kasvin Ohra N-rajan/);
  });
});
