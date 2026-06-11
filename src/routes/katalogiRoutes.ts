import { Router } from 'express';
import { KASVINSUOJELUAINEET, KASVIT } from '../data/katalogi';

export const katalogiRoutes = Router();

katalogiRoutes.get('/kasvit', (_req, res) => {
  res.json(Object.values(KASVIT));
});

katalogiRoutes.get('/kasvinsuojeluaineet', (_req, res) => {
  res.json(Object.values(KASVINSUOJELUAINEET));
});
