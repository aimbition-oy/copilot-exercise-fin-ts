# Lohkokirja — repositorion ohjeet

Lohkokirja on pieni viljelytoimenpiteiden kirjanpito: lohkot, satovuodet ja
toimenpideaikajana (kylvö, lannoitus, ruiskutus) agronomisine sääntöineen. Se on
**harjoitusalusta**: sovelluskoodi on tarkoituksella valmis ja jäädytetty.
Harjoituksissa rakennetaan Copilot-harnessin osia sen ympärille; uutta
sovelluskoodia kirjoitetaan vain toteutettaessa `PRD.md`:n ominaisuuksia. Kaikki
agronomiset rajat ja tuotetiedot ovat kuvitteellisia.

## Komennot

| Komento                                          | Tarkoitus                                               |
| ------------------------------------------------ | ------------------------------------------------------- |
| `npm run dev`                                    | Käynnistä palvelin watch-tilassa: http://localhost:3000 |
| `npm test`                                       | Aja koko Vitest-testistö (pidettävä vihreänä)           |
| `npm run test:unit` / `npm run test:integration` | Aja yksi testistö                                       |
| `npm run typecheck`                              | `tsc --noEmit` — pidettävä puhtaana                     |
| `npm run lint` / `npm run lint:fix`              | ESLint hakemistoille `src`, `tests`, `public`           |
| `npm run format` / `npm run format:check`        | Prettier                                                |

## Arkkitehtuuri

Tiukka yksisuuntainen kerrostus. Kerros saa importata vain alapuolisia kerroksia.

| Kerros          | Polku               | Säännöt                                                                                                   |
| --------------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| Reitit          | `src/routes/`       | Vain HTTP: jäsennä/validoi syöte Zodilla, kutsu serviceä, palauta JSON. Ei liiketoimintalogiikkaa.        |
| Servicet        | `src/services/`     | Kaikki liiketoimintasäännöt. Heitä `DomainError`-aliluokkia (`src/errors.ts`); älä koske `req`/`res`:ään. |
| Repositoriot    | `src/repositories/` | Vain muistinvarainen tallennus. Ei validointia, ei sääntöjä.                                              |
| Mallit          | `src/models/`       | Zod-skeemat ja tyypit. Ei käyttäytymistä.                                                                 |
| Staattinen data | `src/data/`         | Katalogit (kasvit, kasvinsuojeluaineet) ja demotilan siemendata.                                          |
| Frontend        | `public/`           | Vanilla JS, ei build-vaihetta, ei frameworkeja. Käyttää vain `/api/*`-rajapintaa.                         |

## Konventiot

- Tunnisteet: suomenkielinen domain, englanninkielinen tekninen sanasto
  (`lohkoService.getDetail`, `toimenpideRepository.listByLohko`). Ei ääkkösiä
  tunnisteissa (`kylvomaaraKgPerHa`, ei `kylvömääräKgPerHa`); merkkijonoissa ja
  kommenteissa ääkköset ovat oikein.
- TypeScript strict ESM; suhteelliset importit ilman päätettä (`./lohko`, ei `./lohko.ts`).
- Validointi tapahtuu reittirajalla `src/models/`-skeemoilla; servicet luottavat
  tyypitettyihin syötteisiinsä mutta valvovat domain-säännöt.
- Odotetut virheet ovat `DomainError`-aliluokkia, joilla on vakaa `code`
  (esim. `RAVINNERAJA_YLITTYY`); `src/errors.ts`:n middleware muuntaa ne
  HTTP-vastauksiksi. Älä koskaan rakenna virhe-JSONia käsin reiteissä.
- API-virheillä on aina muoto `{ error: { code, message, details } }`.
- Testit siementävät datan `seedDemoData()`-kutsulla `beforeEach`-vaiheessa;
  siemendata on deterministinen — älä koskaan nojaa kellonaikaan koodissa tai
  testeissä.
- Frontend-elementeillä, joita testit tai agentit etsivät, on `data-testid`-attribuutti.

## Domain-sanasto

- **Lohko** — peltopalsta; yksikkö, johon kaikki kirjataan.
- **Satovuosi** — toimenpiteet kuuluvat aina yhdelle; johdetaan päivämäärästä.
- **Ravinnerajat** — lailliset N/P/K-maksimit (kg/ha) kasvia kohden; ylitys on 422,
  90 %:n ylittäminen rajasta antaa varoituksen.
- **BBCH-kasvuaste** — 0–99-asteikko; kasvinsuojeluaineilla on suurin sallittu aste.
- **Varoaika** — päivät ruiskutuksen ja aikaisimman sallitun korjuun välillä.
