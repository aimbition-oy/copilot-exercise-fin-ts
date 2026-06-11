import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { seedDemoData } from '../../src/data/seed';

const app = createApp();

beforeEach(() => {
  seedDemoData();
});

describe('GET /api/lohkot/:id/toimenpiteet', () => {
  it('listaa satovuoden toimenpiteet päivämääräjärjestyksessä', async () => {
    const res = await request(app).get('/api/lohkot/rantapelto/toimenpiteet?vuosi=2026');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.map((t: { tyyppi: string }) => t.tyyppi)).toEqual([
      'kylvo',
      'lannoitus',
      'ruiskutus',
    ]);
  });

  it('palauttaa tyhjän listan vuodelle ilman toimenpiteitä', async () => {
    const res = await request(app).get('/api/lohkot/rantapelto/toimenpiteet?vuosi=2024');
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/lohkot/:id/toimenpiteet — lannoitus', () => {
  const lannoitus = (maaraKgPerHa: number) => ({
    tyyppi: 'lannoitus',
    pvm: '2026-06-15',
    tuote: 'NPK 20-3-8',
    maaraKgPerHa,
    ravinnepitoisuusPct: { n: 20, p: 3, k: 8 },
  });

  it('tallentaa turvallisen levityksen ilman varoituksia', async () => {
    const res = await request(app).post('/api/lohkot/rantapelto/toimenpiteet').send(lannoitus(40));
    expect(res.status).toBe(201);
    expect(res.body.varoitukset).toEqual([]);
    expect(res.body.toimenpide.id).toBeTruthy();
  });

  it('tallentaa mutta varoittaa, kun käyttö ylittää 90 % rajasta', async () => {
    // N: 80 käytetty + 30 -> 110 / 120 (92 %); puhdas N-tuote ei kosketa P:tä ja K:ta
    const res = await request(app)
      .post('/api/lohkot/rantapelto/toimenpiteet')
      .send({
        tyyppi: 'lannoitus',
        pvm: '2026-06-15',
        tuote: 'Typpitehoste',
        maaraKgPerHa: 150,
        ravinnepitoisuusPct: { n: 20, p: 0, k: 0 },
      });
    expect(res.status).toBe(201);
    expect(res.body.varoitukset.length).toBeGreaterThan(0);
  });

  it('vastaa 422, kun levitys ylittäisi ravinnerajan', async () => {
    const res = await request(app).post('/api/lohkot/rantapelto/toimenpiteet').send(lannoitus(400));
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('RAVINNERAJA_YLITTYY');
  });
});

describe('POST /api/lohkot/:id/toimenpiteet — ruiskutus', () => {
  it('tallentaa ja palauttaa lasketun aikaisimman korjuupäivän', async () => {
    const res = await request(app).post('/api/lohkot/kotipelto/toimenpiteet').send({
      tyyppi: 'ruiskutus',
      pvm: '2026-06-20',
      tuote: 'GrassGuard',
      bbchAste: 40,
    });
    expect(res.status).toBe(201);
    expect(res.body.toimenpide.aikaisinKorjuuPvm).toBe('2026-07-04');
  });

  it('vastaa 422, kun BBCH-ikkuna on sulkeutunut', async () => {
    const res = await request(app).post('/api/lohkot/rantapelto/toimenpiteet').send({
      tyyppi: 'ruiskutus',
      pvm: '2026-06-20',
      tuote: 'Ariane S',
      bbchAste: 51,
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('BBCH_RAJA_YLITETTY');
  });
});

describe('POST /api/lohkot/:id/toimenpiteet — validointi', () => {
  it('vastaa 400 virheelliselle rungolle zod-yksityiskohdin', async () => {
    const res = await request(app)
      .post('/api/lohkot/rantapelto/toimenpiteet')
      .send({ tyyppi: 'lannoitus', pvm: 'ei-paivamaara' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeTruthy();
  });

  it('vastaa 404 tuntemattomalle lohkolle', async () => {
    const res = await request(app).post('/api/lohkot/olematon/toimenpiteet').send({
      tyyppi: 'ruiskutus',
      pvm: '2026-06-20',
      tuote: 'GrassGuard',
      bbchAste: 30,
    });
    expect(res.status).toBe(404);
  });
});
