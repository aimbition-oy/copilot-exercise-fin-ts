import { NotFoundError } from '../errors';
import type { Lohko } from '../models/lohko';
import { lohkoRepository } from '../repositories/lohkoRepository';
import { ravinneService, type RavinneTilanne } from './ravinneService';
import { toimenpideService } from './toimenpideService';

export interface LohkoTiedot extends Lohko {
  satovuosi: number;
  /** Null, kun lohkolle ei ole suunniteltu kasvia satovuodelle. */
  ravinneTilanne: RavinneTilanne | null;
  aikaisinKorjuuPvm: string | null;
}

export const lohkoService = {
  list(): Lohko[] {
    return lohkoRepository.list();
  },

  get(id: string): Lohko {
    const lohko = lohkoRepository.get(id);
    if (!lohko) {
      throw new NotFoundError(`Lohkoa "${id}" ei ole olemassa`);
    }
    return lohko;
  },

  getDetail(id: string, satovuosi: number): LohkoTiedot {
    const lohko = this.get(id);
    return {
      ...lohko,
      satovuosi,
      ravinneTilanne: lohko.kasvit[satovuosi] ? ravinneService.getStatus(lohko, satovuosi) : null,
      aikaisinKorjuuPvm: toimenpideService.aikaisinKorjuuPvm(id, satovuosi),
    };
  },
};
