import type { Lohko } from '../models/lohko';

const lohkot = new Map<string, Lohko>();

/**
 * Muistinvarainen tallennus. Data elää prosessin elinkaaren ajan ja
 * siemennetään uudelleen käynnistyksessä (ja joka testissä) funktiolla
 * `seedDemoData()`.
 */
export const lohkoRepository = {
  list(): Lohko[] {
    return [...lohkot.values()];
  },

  get(id: string): Lohko | undefined {
    return lohkot.get(id);
  },

  save(lohko: Lohko): Lohko {
    lohkot.set(lohko.id, lohko);
    return lohko;
  },

  clear(): void {
    lohkot.clear();
  },
};
