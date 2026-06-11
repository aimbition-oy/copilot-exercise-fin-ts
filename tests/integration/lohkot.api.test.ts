import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { seedDemoData } from '../../src/data/seed';

const app = createApp();

beforeEach(() => {
  seedDemoData();
});

describe('GET /api/health', () => {
  it('vastaa ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/lohkot', () => {
  it('listaa demotilan lohkot', async () => {
    const res = await request(app).get('/api/lohkot');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.map((l: { id: string }) => l.id)).toEqual([
      'rantapelto',
      'kotipelto',
      'myllyhaka',
    ]);
  });
});

describe('GET /api/lohkot/:id', () => {
  it('palauttaa tiedot ravinnetilanteella ja aikaisimmalla korjuupäivällä', async () => {
    const res = await request(app).get('/api/lohkot/rantapelto?vuosi=2026');
    expect(res.status).toBe(200);
    expect(res.body.nimi).toBe('Rantapelto');
    expect(res.body.ravinneTilanne.kaytettyKgPerHa).toEqual({ n: 80, p: 12, k: 32 });
    expect(res.body.aikaisinKorjuuPvm).toBe('2026-07-07');
  });

  it('palauttaa null-ravinnetilanteen vuodelle ilman kasvia', async () => {
    const res = await request(app).get('/api/lohkot/rantapelto?vuosi=2030');
    expect(res.status).toBe(200);
    expect(res.body.ravinneTilanne).toBeNull();
  });

  it('vastaa 404 tuntemattomalle lohkolle', async () => {
    const res = await request(app).get('/api/lohkot/olematon');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('vastaa 400 virheelliselle vuodelle', async () => {
    const res = await request(app).get('/api/lohkot/rantapelto?vuosi=banaani');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/lohkot/:id/ravinnetilanne', () => {
  it('raportoi käytön kasvin rajoja vasten', async () => {
    const res = await request(app).get('/api/lohkot/kotipelto/ravinnetilanne?vuosi=2026');
    expect(res.status).toBe(200);
    expect(res.body.kasvi.koodi).toBe('sailorehunurmi');
    expect(res.body.kaytettyKgPerHa).toEqual({ n: 60, p: 10, k: 70 });
  });

  it('vastaa 422, kun vuodelle ei ole suunniteltu kasvia', async () => {
    const res = await request(app).get('/api/lohkot/kotipelto/ravinnetilanne?vuosi=2030');
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('EI_VILJELYKASVIA');
  });
});

describe('GET /api/kasvit ja /api/kasvinsuojeluaineet', () => {
  it('tarjoavat katalogit', async () => {
    const kasvit = await request(app).get('/api/kasvit');
    const aineet = await request(app).get('/api/kasvinsuojeluaineet');
    expect(kasvit.body).toHaveLength(3);
    expect(aineet.body.map((a: { nimi: string }) => a.nimi)).toContain('Ariane S');
  });
});
