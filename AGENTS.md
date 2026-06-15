# Lohkokirja - agenttiohjeet

Repon agenttiohjeet. Tämä tiedosto ladataan jokaiseen sessioon, joten se on
lyhyt ja sisältää vain sääntöjä, jotka pätevät kaikkialla koodikannassa.
Komennot, domain-arvot ja yksityiskohdat ovat koodissa, `Makefile`ssa ja
`docs/`-kansiossa, eivät täällä. Näin tämä ei vanhene eikä joudu ristiriitaan
koodin kanssa.

## Mikä tämä on

Lohkokirja on viljelytoimenpiteiden kirjanpito: lohkot, satovuodet ja
toimenpideaikajana (kylvö, lannoitus, ruiskutus) agronomisine sääntöineen.
Sovelluskoodi on valmis ja toimiva. Uutta sovelluskoodia kirjoitetaan, kun
toteutetaan `PRD.md`:n tehtäviä.

## Komennot

Kaikki projektin komennot ovat `Makefile`ssa. Aja `make help` nähdäksesi ne, tai
avaa `Makefile` (se näyttää myös kunkin komennon taustalla ajettavan
npm-komennon). Aja `make check` ennen kuin julistat työn valmiiksi.

## Arkkitehtuuri

Yksisuuntainen kerrostus: `routes -> services -> repositories -> models/data`.
Kerros saa importata vain alapuolisia kerroksia. Reitit hoitavat HTTP:n,
servicet liiketoimintasäännöt, repositoriot tallennuksen. Kartta ja pyynnön
kulku: `docs/architecture.md`.

## Säännöt

Nämä pätevät aina. Niiden rikkominen kaataa käännöksen tai testit.

- **Determinismi.** Ei `Date.now()`-kutsua eikä argumentitonta `new Date()`-kutsua.
  Demotila elää kiinteässä satovuodessa, ja testit nojaavat determinismiin.
- **Virheet.** Heitä `DomainError`-aliluokkia (`src/errors.ts`). Middleware
  muuntaa ne HTTP-vastauksiksi muotoon `{ error: { code, message, details } }`.
  Älä rakenna virhe-JSONia käsin.
- **Validointi.** Tapahtuu reittirajalla Zod-skeemoilla. Servicet luottavat
  tyypitettyihin syötteisiinsä mutta valvovat domain-säännöt.
- **Tunnisteet.** Suomenkielinen domain, englanninkielinen tekninen sanasto.
  Ei ääkkösiä tunnisteissa (`kylvomaaraKgPerHa`). Merkkijonoissa ja
  kommenteissa ääkköset ovat oikein.

## Rajat

- **Aina:** pidä muutos pienenä ja kerrokset erillään; aja testit, typecheck ja
  lint ennen valmista.
- **Kysy ensin:** uudet riippuvuudet; julkisen rajapinnan rikkovat muutokset;
  tiedostojen poisto tai uudelleennimeäminen.
- **Älä koskaan:** muokkaa `src/data/seed.ts`:n arvoja (testit nojaavat niihin);
  lue tai tulosta `.env*`-salaisuuksia; muokkaa `node_modules`-kansiota.

## Mistä tieto löytyy

- `docs/architecture.md` - kerrokset, pyynnön kulku, tiedostokartta
- `docs/domain.md` - domain-käsitteet ja mistä ajantasaiset arvot löytyvät
- `docs/api.md` - HTTP-rajapinta ja virhekoodit
- `docs/testing.md` - testien rakenne ja ajaminen
- `PRD.md` - toteutettavat tehtävät
- `.github/instructions/` - tiedostokohtaiset ohjeet (latautuvat polun mukaan)
- `.github/agents/` - valmiit erikoisagentit (Tutkija, Rasmus)
