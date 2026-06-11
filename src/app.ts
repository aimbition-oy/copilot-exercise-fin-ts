import { fileURLToPath } from 'node:url';
import express from 'express';
import { errorHandler } from './errors';
import { katalogiRoutes } from './routes/katalogiRoutes';
import { lohkoRoutes } from './routes/lohkoRoutes';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/lohkot', lohkoRoutes);
  app.use('/api', katalogiRoutes);

  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));

  app.use(errorHandler);
  return app;
}
