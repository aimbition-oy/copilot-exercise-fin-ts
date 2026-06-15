# Domain

Käsitteet ja säännöt selitettynä. Ajantasaiset arvot ja toteutus ovat koodissa.
Tämä tiedosto osoittaa, mistä ne löytyvät, eikä toista niitä, jotta dokumentti
ei joudu ristiriitaan koodin kanssa.

## Käsitteet

- **Lohko** - peltopalsta. Perusyksikkö, johon kaikki kirjataan. Tyyppi:
  `src/models/lohko.ts`.
- **Satovuosi** - vuosi, jolle toimenpide kuuluu. Johdetaan toimenpiteen
  päivämäärästä. Oletussatovuosi: `src/config.ts`.
- **Toimenpide** - kylvö, lannoitus tai ruiskutus. Tyypit ja syöteskeemat:
  `src/models/toimenpide.ts`.
- **Ravinnerajat** - kasvikohtaiset lailliset N/P/K-ylärajat (kg/ha).
- **BBCH-kasvuaste** - asteikko 0-99 kasvin kehitykselle. Kasvinsuojeluaineella
  on suurin sallittu aste.
- **Varoaika** - vähimmäisaika ruiskutuksen ja aikaisimman sallitun korjuun
  välillä.

## Mistä arvot ja säännöt löytyvät

- **Kasvit, ravinnerajat, kasvinsuojeluaineet, BBCH-rajat ja varoajat:**
  `src/data/katalogi.ts`. Tämä on arvojen ainoa totuuden lähde.
- **Ravinnerajan tarkistus** (ylitys ja varoitusraja): `src/services/ravinneService.ts`.
- **BBCH-raja, varoaika ja aikaisin korjuupäivä:** `src/services/toimenpideService.ts`.
- **Demotilan data** (lohkot ja niiden toimenpiteet): `src/data/seed.ts`. Tiedoston
  kommentti kuvaa siemendatan ravinnekirjanpidon.

## Säännöt lyhyesti

- Lannoituksen ravinnemäärä ei saa ylittää kasvin rajaa. Lähellä rajaa olevasta
  levityksestä tulee varoitus. Tarkat rajat: `ravinneService.ts`.
- Ruiskutusta ei voi kirjata kasvinsuojeluaineen sallitun BBCH-asteen jälkeen.
- Ruiskutus asettaa aikaisimman sallitun korjuupäivän varoajan perusteella.

Virhekoodit, joita säännöt tuottavat: `docs/api.md`.
