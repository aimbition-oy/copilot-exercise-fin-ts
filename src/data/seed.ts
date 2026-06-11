import { lohkoRepository } from '../repositories/lohkoRepository';
import { toimenpideRepository } from '../repositories/toimenpideRepository';

/**
 * Demotila satovuodelle 2026. Testit siementävät datan uudelleen ennen joka
 * tapausta, joten pidä data deterministisenä: kiinteät id:t, kiinteät päivät.
 *
 * Siemendatan ravinnekirjanpito (kaikki rajojen sisällä):
 *   Rantapelto (ohra, rajat N120/P15/K60):           N 80, P 12, K 32
 *   Kotipelto (säilörehunurmi, rajat N180/P20/K90):  N 60, P 10, K 70
 *   Myllyhaka (kaura, rajat N110/P15/K55):           N 78, P 6,  K 9
 */
export function seedDemoData(): void {
  lohkoRepository.clear();
  toimenpideRepository.clear();

  lohkoRepository.save({
    id: 'rantapelto',
    nimi: 'Rantapelto',
    pintaAlaHa: 4.2,
    kasvit: { 2026: 'ohra' },
  });
  lohkoRepository.save({
    id: 'kotipelto',
    nimi: 'Kotipelto',
    pintaAlaHa: 6.8,
    kasvit: { 2026: 'sailorehunurmi' },
  });
  lohkoRepository.save({
    id: 'myllyhaka',
    nimi: 'Myllyhaka',
    pintaAlaHa: 3.5,
    kasvit: { 2026: 'kaura' },
  });

  toimenpideRepository.save({
    id: 'tp-001',
    lohkoId: 'rantapelto',
    satovuosi: 2026,
    tyyppi: 'kylvo',
    pvm: '2026-05-08',
    kasvi: 'ohra',
    lajike: 'Trekker',
    siementyyppi: 'sertifioitu',
    kylvomaaraKgPerHa: 220,
  });
  toimenpideRepository.save({
    id: 'tp-002',
    lohkoId: 'rantapelto',
    satovuosi: 2026,
    tyyppi: 'lannoitus',
    pvm: '2026-05-08',
    tuote: 'NPK 20-3-8',
    maaraKgPerHa: 400,
    ravinnepitoisuusPct: { n: 20, p: 3, k: 8 },
  });
  toimenpideRepository.save({
    id: 'tp-003',
    lohkoId: 'rantapelto',
    satovuosi: 2026,
    tyyppi: 'ruiskutus',
    pvm: '2026-06-02',
    tuote: 'Ariane S',
    bbchAste: 31,
    vesimaaraLPerHa: 200,
    aikaisinKorjuuPvm: '2026-07-07',
  });

  toimenpideRepository.save({
    id: 'tp-004',
    lohkoId: 'kotipelto',
    satovuosi: 2026,
    tyyppi: 'kylvo',
    pvm: '2026-05-12',
    kasvi: 'sailorehunurmi',
    lajike: 'Nurmiseos 2',
    siementyyppi: 'sertifioitu',
    kylvomaaraKgPerHa: 25,
  });
  toimenpideRepository.save({
    id: 'tp-005',
    lohkoId: 'kotipelto',
    satovuosi: 2026,
    tyyppi: 'lannoitus',
    pvm: '2026-05-14',
    tuote: 'Naudan lietelanta',
    maaraKgPerHa: 20000,
    ravinnepitoisuusPct: { n: 0.3, p: 0.05, k: 0.35 },
  });

  toimenpideRepository.save({
    id: 'tp-006',
    lohkoId: 'myllyhaka',
    satovuosi: 2026,
    tyyppi: 'kylvo',
    pvm: '2026-05-15',
    kasvi: 'kaura',
    lajike: 'Niklas',
    siementyyppi: 'tilan-oma',
    kylvomaaraKgPerHa: 190,
  });
  toimenpideRepository.save({
    id: 'tp-007',
    lohkoId: 'myllyhaka',
    satovuosi: 2026,
    tyyppi: 'lannoitus',
    pvm: '2026-05-15',
    tuote: 'NPK 26-2-3',
    maaraKgPerHa: 300,
    ravinnepitoisuusPct: { n: 26, p: 2, k: 3 },
  });
}
