# Lohkokirja - repositorion ohjeet

Lohkokirja on pieni viljelytoimenpiteiden kirjanpito: lohkot, satovuodet ja
toimenpideaikajana (kylvö, lannoitus, ruiskutus) agronomisine sääntöineen. Repo
on harjoitusalusta: pääpaino on Copilot-valjaiden (ohjeet, agentit, hookit,
skillit, MCP) rakentamisessa, ei koodin tuottamisessa. Sovellusta laajennetaan
`PRD.md`:n tehtävillä. Kaikki agronomiset rajat ja tuotetiedot ovat
kuvitteellisia.

## Komennot

| Komento                                          | Tarkoitus                                               |
| ------------------------------------------------ | ------------------------------------------------------- |
| `npm run dev`                                    | Käynnistä palvelin watch-tilassa: http://localhost:3000 |
| `npm test`                                       | Aja koko Vitest-testistö (pidettävä vihreänä)           |
| `npm run test:unit` / `npm run test:integration` | Aja yksi testistö                                       |
| `npm run typecheck`                              | `tsc --noEmit`, pidettävä puhtaana                      |
| `npm run lint` / `npm run lint:fix`              | ESLint hakemistoille `src`, `tests`, `public`           |
| `npm run format` / `npm run format:check`        | Prettier                                                |

## Arkkitehtuuri

Tiukka yksisuuntainen kerrostus. Kerros saa importata vain alapuolisia kerroksia.

| Kerros          | Polku               | Säännöt                                                                                                        |
| --------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Reitit          | `src/routes/`       | Vain HTTP: jäsennä/validoi syöte Zodilla, kutsu serviceä, palauta JSON. Ei liiketoimintalogiikkaa.             |
| Servicet        | `src/services/`     | Kaikki liiketoimintasäännöt. Heitä `DomainError`-aliluokkia (`src/errors.ts`). Älä koske `req`/`res`-olioihin. |
| Repositoriot    | `src/repositories/` | Vain muistinvarainen tallennus. Ei validointia, ei sääntöjä.                                                   |
| Mallit          | `src/models/`       | Zod-skeemat ja tyypit. Ei käyttäytymistä.                                                                      |
| Staattinen data | `src/data/`         | Katalogit (kasvit, kasvinsuojeluaineet) ja demotilan siemendata.                                               |
| Frontend        | `public/`           | Vanilla JS, ei build-vaihetta, ei frameworkeja. Käyttää vain `/api/*`-rajapintaa.                              |

## Konventiot

- Tunnisteet: suomenkielinen domain, englanninkielinen tekninen sanasto
  (`lohkoService.getDetail`, `toimenpideRepository.listByLohko`). Ei ääkkösiä
  tunnisteissa (`kylvomaaraKgPerHa`, ei `kylvömääräKgPerHa`). Merkkijonoissa ja
  kommenteissa ääkköset ovat oikein.
- TypeScript strict ESM. Suhteelliset importit ilman päätettä (`./lohko`, ei
  `./lohko.ts`).
- Validointi tapahtuu reittirajalla `src/models/`-skeemoilla. Servicet
  luottavat tyypitettyihin syötteisiinsä mutta valvovat domain-säännöt.
- Odotetut virheet ovat `DomainError`-aliluokkia, joilla on vakaa `code`
  (esim. `RAVINNERAJA_YLITTYY`). `src/errors.ts`:n middleware muuntaa ne
  HTTP-vastauksiksi. Älä rakenna virhe-JSONia käsin reiteissä.
- API-virheillä on aina muoto `{ error: { code, message, details } }`.
- Testit siementävät datan `seedDemoData()`-kutsulla `beforeEach`-vaiheessa.
  Siemendata on deterministinen: älä nojaa kellonaikaan koodissa tai testeissä.
- Frontend-elementeillä, joita testit tai agentit etsivät, on
  `data-testid`-attribuutti.

## Domain-sanasto

- **Lohko**: peltopalsta, yksikkö johon kaikki kirjataan.
- **Satovuosi**: toimenpiteet kuuluvat aina yhdelle, johdetaan päivämäärästä.
- **Ravinnerajat**: lailliset N/P/K-maksimit (kg/ha) kasvia kohden. Ylitys on
  422, rajan 90 prosentin ylittäminen antaa varoituksen.
- **BBCH-kasvuaste**: asteikko 0-99. Kasvinsuojeluaineilla on suurin sallittu
  aste.
- **Varoaika**: päivät ruiskutuksen ja aikaisimman sallitun korjuun välillä.
