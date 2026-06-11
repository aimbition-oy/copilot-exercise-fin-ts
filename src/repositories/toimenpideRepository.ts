import type { Toimenpide } from '../models/toimenpide';

const toimenpiteet = new Map<string, Toimenpide>();

export const toimenpideRepository = {
  listByLohko(lohkoId: string, satovuosi?: number): Toimenpide[] {
    return [...toimenpiteet.values()]
      .filter(
        (t) => t.lohkoId === lohkoId && (satovuosi === undefined || t.satovuosi === satovuosi),
      )
      .sort((a, b) => a.pvm.localeCompare(b.pvm));
  },

  save(toimenpide: Toimenpide): Toimenpide {
    toimenpiteet.set(toimenpide.id, toimenpide);
    return toimenpide;
  },

  clear(): void {
    toimenpiteet.clear();
  },
};
