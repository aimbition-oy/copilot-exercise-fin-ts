# Lohkokirja — GitHub Copilot -harnessharjoitusten alusta

Lohkokirja on pieni, valmis viljelytoimenpiteiden kirjanpito: lohkot, satovuodet
ja toimenpideaikajana (kylvö, lannoitus, ruiskutus) kahdella oikealla
agronomisella säännöllä — N/P/K-ravinnerajat ja ruiskutusten varoajoista
johdettu aikaisin sallittu korjuupäivä.

Tämä repo on **harjoitusalusta**: sovellus on tarkoituksella valmis, vihreä ja
jäädytetty, jotta tokenit ja huomio menevät olennaiseen — **Copilot-harnessin
rakentamiseen** sen ympärille. Harjoitukset ovat tiedostossa
[EXERCISES.md](EXERCISES.md) ja niiden raaka-aine tiedostossa [PRD.md](PRD.md).

> Kaikki rajat, tuotteet ja varoajat ovat kuvitteellisia harjoitusarvoja —
> eivät viljelyohjeita.

## Pikastartti

```bash
nvm use          # Node 20
npm install
npm test         # 33 testiä vihreänä
npm run dev      # http://localhost:3000
```

## Komennot

| Komento                                          | Tarkoitus                            |
| ------------------------------------------------ | ------------------------------------ |
| `npm run dev`                                    | Palvelin watch-tilassa portissa 3000 |
| `npm test`                                       | Koko Vitest-testistö                 |
| `npm run test:unit` / `npm run test:integration` | Yksi testistö kerrallaan             |
| `npm run typecheck`                              | TypeScript-tyypitys (`tsc --noEmit`) |
| `npm run lint` / `npm run lint:fix`              | ESLint                               |
| `npm run format` / `npm run format:check`        | Prettier                             |

## Rakenne

```
src/
  models/         Zod-skeemat ja tyypit (lohko, toimenpide)
  data/           Katalogit (kasvit, kasvinsuojeluaineet) ja demotilan seed
  repositories/   Muistinvarainen tallennus
  services/       Liiketoimintasäännöt (ravinnerajat, varoajat)
  routes/         Express-reitit (vain HTTP)
public/           Vanilla JS -käyttöliittymä, ei build-vaihetta
tests/            Vitest: unit + integration (supertest)
.github/          Valmis harnessin alku — katso alla
```

## Mitä on valmiina, mitä rakennat itse

| Valmiina repossa                                                        | Rakennat harjoituksissa                                    |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `.github/copilot-instructions.md` — repo-laajuiset ohjeet               | `testing.instructions.md`, `frontend.instructions.md`      |
| `.github/instructions/backend.instructions.md` — rajattu malliesimerkki | `suunnittelija.agent.md`, `toteuttaja.agent.md`            |
| `.github/agents/tutkija.agent.md` — valmis tutkimusagentti              | `.github/hooks/` — portinvartija ja laatuautomaatio        |
| Sovellus + 33 vihreää testiä + lint                                     | `.github/skills/aja-testit/` — deterministinen testiskilli |
| `PRD.md` — neljä toteuttamatonta ominaisuutta                           | `.vscode/mcp.json` — Playwright MCP                        |

## API lyhyesti

| Päätepiste                                        | Kuvaus                                       |
| ------------------------------------------------- | -------------------------------------------- |
| `GET /api/health`                                 | Elossaolotarkistus                           |
| `GET /api/lohkot`                                 | Lohkolista                                   |
| `GET /api/lohkot/:id?vuosi=2026`                  | Lohkon tiedot + ravinnetilanne + korjuupäivä |
| `GET /api/lohkot/:id/toimenpiteet?vuosi=2026`     | Toimenpideaikajana                           |
| `POST /api/lohkot/:id/toimenpiteet`               | Kirjaa toimenpide (validointi + säännöt)     |
| `GET /api/lohkot/:id/ravinnetilanne?vuosi=2026`   | N/P/K käytetty vs. rajat                     |
| `GET /api/kasvit`, `GET /api/kasvinsuojeluaineet` | Katalogit                                    |

Virheet palautuvat aina muodossa `{ "error": { "code", "message", "details" } }` —
domain-virhekoodit (esim. `RAVINNERAJA_YLITTYY`, `BBCH_RAJA_YLITETTY`) ovat
vakaita ja testattuja.
