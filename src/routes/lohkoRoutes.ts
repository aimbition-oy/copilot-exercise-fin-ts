import { Router } from 'express';
import { config } from '../config';
import { ValidationError } from '../errors';
import { toimenpideSyoteSchema } from '../models/toimenpide';
import { lohkoService } from '../services/lohkoService';
import { ravinneService } from '../services/ravinneService';
import { toimenpideService } from '../services/toimenpideService';

function parseVuosi(value: unknown): number {
  if (value === undefined) return config.oletusSatovuosi;
  const vuosi = Number(value);
  if (!Number.isInteger(vuosi) || vuosi < 2000 || vuosi > 2100) {
    throw new ValidationError(`"${value}" ei ole kelvollinen satovuosi`);
  }
  return vuosi;
}

export const lohkoRoutes = Router();

lohkoRoutes.get('/', (_req, res) => {
  res.json(lohkoService.list());
});

lohkoRoutes.get('/:id', (req, res) => {
  res.json(lohkoService.getDetail(req.params.id, parseVuosi(req.query.vuosi)));
});

lohkoRoutes.get('/:id/ravinnetilanne', (req, res) => {
  const lohko = lohkoService.get(req.params.id);
  res.json(ravinneService.getStatus(lohko, parseVuosi(req.query.vuosi)));
});

lohkoRoutes.get('/:id/toimenpiteet', (req, res) => {
  const vuosi = req.query.vuosi === undefined ? undefined : parseVuosi(req.query.vuosi);
  res.json(toimenpideService.list(req.params.id, vuosi));
});

lohkoRoutes.post('/:id/toimenpiteet', (req, res) => {
  const parsed = toimenpideSyoteSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Virheellinen toimenpide', parsed.error.flatten());
  }
  const result = toimenpideService.add(req.params.id, parsed.data);
  res.status(201).json(result);
});
