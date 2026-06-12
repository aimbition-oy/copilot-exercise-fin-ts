---
name: 'Backend-konventiot'
description: 'Kerrossäännöt ja mallit Express-backendille'
applyTo: 'src/**/*.ts'
---

# Backend-konventiot

## Kerrostus (valvotaan katselmoinnissa, ei työkaluilla)

- Reitit importtaavat servicejä; servicet importtaavat repositorioita, malleja
  ja dataa; repositoriot importtaavat vain malleja. Älä importtaa ylöspäin
  (service ei importtaa reittiä).
- Uudet päätepisteet: määrittele tai laajenna Zod-skeema hakemistossa
  `src/models/`, lisää sääntö serviceen, pidä reittikäsittelijä alle 10
  rivissä.

## Kopioitavat mallit

- Domain-säännöt heittävät, eivät palauta virheobjekteja:

  ```ts
  throw new RuleViolationError('RAVINNERAJA_YLITTYY', 'viesti', { details });
  ```

- Validointi reittirajalla:

  ```ts
  const parsed = jokinSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError('Virheellinen syöte', parsed.error.flatten());
  ```

- Repositoriot pysyvät tyhminä: `Map`-tallennus, `list/get/save/clear`, ei
  ehtologiikkaa suodatusta lukuun ottamatta.

## Kiellot

- Ei uusia riippuvuuksia kysymättä ensin käyttäjältä.
- Ei `console.log`-kutsuja `src/`-hakemistossa. Ainoa poikkeus on palvelimen
  käynnistysrivi `server.ts`:ssä.
- Ei `Date.now()`-kutsua eikä argumentitonta `new Date()`-kutsua. Demotila
  elää kiinteässä satovuodessa (2026) ja testit nojaavat determinismiin.
- Älä muokkaa `src/data/seed.ts`:n arvoja. Testit asertoivat niitä vasten.
