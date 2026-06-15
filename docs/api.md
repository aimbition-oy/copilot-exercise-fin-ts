# HTTP-rajapinta

Reittien toteutus on hakemistossa `src/routes/`. Se on rajapinnan totuuden
lähde; tämä tiedosto on yhteenveto.

## Päätepisteet

| Metodi ja polku                             | Kuvaus                                     |
| ------------------------------------------- | ------------------------------------------ |
| `GET /api/health`                           | Elossaolotarkistus                         |
| `GET /api/lohkot`                           | Lohkolista                                 |
| `GET /api/lohkot/:id?vuosi=`                | Lohkon tiedot, ravinnetilanne, korjuupäivä |
| `GET /api/lohkot/:id/toimenpiteet?vuosi=`   | Toimenpideaikajana                         |
| `POST /api/lohkot/:id/toimenpiteet`         | Kirjaa toimenpide                          |
| `GET /api/lohkot/:id/ravinnetilanne?vuosi=` | N/P/K käytetty vs. rajat                   |
| `GET /api/kasvit`                           | Kasviluettelo                              |
| `GET /api/kasvinsuojeluaineet`              | Kasvinsuojeluaineluettelo                  |

`vuosi`-parametri on valinnainen. Oletus: `src/config.ts`.

## Virhevastaus

Kaikki virheet palautuvat samassa muodossa. Muotoilu: `src/errors.ts`.

```json
{ "error": { "code": "...", "message": "...", "details": null } }
```

## Virhekoodit

Koodit ovat vakaita, ja testit nojaavat niihin. Heittävä kohta suluissa.

| Koodi                 | HTTP | Milloin                                                |
| --------------------- | ---- | ------------------------------------------------------ |
| `VALIDATION_ERROR`    | 400  | Syöte ei läpäise skeemaa tai parametri on virheellinen |
| `NOT_FOUND`           | 404  | Lohkoa ei ole                                          |
| `EI_VILJELYKASVIA`    | 422  | Lohkolle ei ole suunniteltu kasvia kyseiselle vuodelle |
| `RAVINNERAJA_YLITTYY` | 422  | Lannoitus ylittäisi ravinnerajan                       |
| `KASVI_RISTIRIITA`    | 422  | Kylvö poikkeaa suunnitellusta kasvista                 |
| `TUNTEMATON_AINE`     | 422  | Kasvinsuojeluainetta ei ole luettelossa                |
| `BBCH_RAJA_YLITETTY`  | 422  | Ruiskutus sallitun BBCH-asteen jälkeen                 |
| `INTERNAL_ERROR`      | 500  | Odottamaton virhe                                      |

Säännöt, jotka näitä tuottavat: `docs/domain.md`.
