# Testaus

Testit ajetaan Vitestilla. Ne ovat sovelluksen agronomisten sääntöjen
täsmällisin kuvaus.

## Ajaminen

| Komento                    | Mitä ajaa              |
| -------------------------- | ---------------------- |
| `npm test`                 | Koko testistö          |
| `npm run test:unit`        | Vain yksikkötestit     |
| `npm run test:integration` | Vain integraatiotestit |

## Rakenne

- `tests/unit/` - servicetestit ilman HTTP-kerrosta. Esimerkit:
  `ravinneService.test.ts`, `toimenpideService.test.ts`.
- `tests/integration/` - API-testit supertestilla `src/app.ts`:ää vasten.
  Esimerkit: `lohkot.api.test.ts`, `toimenpiteet.api.test.ts`.

## Periaatteet

- **Siemennys.** Jokainen testi nollaa datan kutsumalla `seedDemoData()`
  (`src/data/seed.ts`) `beforeEach`-vaiheessa.
- **Determinismi.** Siemendata on kiinteä. Älä nojaa kellonaikaan koodissa tai
  testeissä, jotta tulokset pysyvät toistettavina.
- **Asertointi virhekoodilla.** Integraatiotestit tarkistavat HTTP-statuksen ja
  `error.code`-kentän, eivät virheviestin tekstiä.

## Uuden testin lisääminen

1. Valitse kerros: domain-sääntö -> `tests/unit/`, HTTP-käytös -> `tests/integration/`.
2. Kopioi rakenne lähimmästä olemassa olevasta testistä.
3. Pidä tapaus pienenä ja nimeä se kuvaavasti.
4. Aja `npm test`.
