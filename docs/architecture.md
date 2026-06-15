# Arkkitehtuuri

Lohkokirja on Express-pohjainen REST-API ja kevyt vanilla JS -frontend.
Tallennus on muistinvarainen, ja demodata siemennetään käynnistyksessä.

## Kerrokset

Yksisuuntainen kerrostus. Kerros saa importata vain alapuolisia kerroksia.

```
routes -> services -> repositories -> models
           \-> data (katalogit, seed)
```

| Kerros       | Vastuu                                                | Polku               |
| ------------ | ----------------------------------------------------- | ------------------- |
| Reitit       | HTTP: jäsennä ja validoi syöte, kutsu serviceä        | `src/routes/`       |
| Servicet     | Liiketoimintasäännöt, heittävät `DomainError`-virheet | `src/services/`     |
| Repositoriot | Muistinvarainen tallennus (`Map`)                     | `src/repositories/` |
| Mallit       | Zod-skeemat ja tyypit                                 | `src/models/`       |
| Data         | Katalogit ja demotilan siemendata                     | `src/data/`         |

Säännöt, jotka pätevät kaikkialla, ovat tiedostossa `AGENTS.md`.

## Pyynnön kulku

Esimerkki: `POST /api/lohkot/:id/toimenpiteet`.

1. `src/server.ts` siementää datan ja käynnistää palvelimen.
2. `src/app.ts` kytkee middlewaret, reitit ja staattiset tiedostot.
3. `src/routes/lohkoRoutes.ts` validoi rungon Zod-skeemalla
   (`src/models/toimenpide.ts`) ja kutsuu serviceä.
4. `src/services/toimenpideService.ts` soveltaa säännöt (varoaika, BBCH-raja,
   ravinnerajat `src/services/ravinneService.ts`) ja tallentaa
   repositorion kautta.
5. Virheet nousevat `DomainError`-aliluokkina, ja `src/errors.ts`:n middleware
   muotoilee ne vastaukseksi.

## Tiedostokartta

- `src/server.ts` - käynnistys: siemennys ja kuuntelu
- `src/app.ts` - Express-sovelluksen kokoaminen
- `src/config.ts` - portti ja oletussatovuosi
- `src/errors.ts` - virhetyypit ja virhe-middleware
- `src/routes/` - `lohkoRoutes.ts`, `katalogiRoutes.ts`
- `src/services/` - `lohkoService.ts`, `toimenpideService.ts`, `ravinneService.ts`
- `src/repositories/` - `lohkoRepository.ts`, `toimenpideRepository.ts`
- `src/models/` - `lohko.ts`, `toimenpide.ts`
- `src/data/` - `katalogi.ts` (kasvit, kasvinsuojeluaineet), `seed.ts` (demodata)
- `public/` - `index.html`, `app.js`, `styles.css`

## Frontend

`public/`-kansion vanilla JS hakee dataa vain `/api/*`-rajapinnasta. Ei
build-vaihetta, ei frameworkeja. Testattavilla elementeillä on
`data-testid`-attribuutti.
