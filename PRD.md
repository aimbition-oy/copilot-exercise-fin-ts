# Lohkokirja — tuotebacklog

Neljä ominaisuutta, joita demotila odottaa. Ne ovat harjoitusten raaka-ainetta:
**agenttisi** suunnittelevat ne, **harnessisi** pitää toteutuksen rehellisenä.
Jokainen on mitoitettu yhteen fokusoituun agenttisessioon.

Hyväksymiskriteerit käyttävät samaa Oletetaan / Kun / Niin -muotoa kuin
tuotetiimi. Ne eivät tarkoituksella ole tyhjentäviä — reunatapausten löytäminen
on osa suunnittelutyötä.

---

## F1 — Sadonkorjuun kirjaus

Kirjaa, mitä lohkolta tuli, ja laske sato.

- Uusi toimenpidetyyppi `sadonkorjuu`: `pvm`, `maaraKg`, valinnainen
  `kuivaAinePct` (0–100), valinnainen `hehtolitrapainoKg`.
- API laskee ja tallentaa kentän `satoKgPerHa` (= `maaraKg` / lohkon pinta-ala).
- Sadonkorjuuta **ei saa kirjata ennen lohkon aikaisinta sallittua korjuupäivää**
  (varoaikasääntö) — se on 422 vakaalla virhekoodilla.
- Sadonkorjuut näkyvät käyttöliittymän aikajanalla.

```gherkin
Ominaisuus: Kirjaa sadonkorjuu

  Tapaus: Kirjaa viljasato laatulukuineen
    Oletetaan että Rantapellolla (4,2 ha) on ohraa satovuonna 2026
    Ja sen aikaisin sallittu korjuupäivä on 2026-07-07
    Kun kuljettaja kirjaa 16800 kg sadon päivälle 2026-08-20
    Niin toimenpide tallentaa sadoksi 4000 kg/ha
    Ja sadonkorjuu näkyy lohkon aikajanalla

  Tapaus: Hylkää sadonkorjuu varoajan sisällä
    Oletetaan että Rantapellon aikaisin sallittu korjuupäivä on 2026-07-07
    Kun sadonkorjuu kirjataan päivälle 2026-07-01
    Niin API vastaa 422 ja virhekoodilla VAROAIKA_VOIMASSA
```

## F2 — Lohkomuistiinpanot

Mikä tahansa muistamisen arvoinen havainto, sidottuna lohkoon, valinnaisesti
paikannettuna.

- Uusi resurssi: `POST/GET /api/lohkot/:id/muistiinpanot` — `pvm`, `teksti`,
  valinnainen `sijainti { lat, lng }`, valinnainen `kuvaPolku`.
- Muistiinpanot ovat satovuosikohtaisia, kuten toimenpiteet.
- Muistiinpanot näkyvät aikajanalla visuaalisesti toimenpiteistä erottuen.

```gherkin
Ominaisuus: Lohkomuistiinpanot

  Tapaus: Kirjaa lakoontumiskohta kuvalla
    Oletetaan että kuljettaja huomaa lakoontumista Rantapellolla
    Kun hän lähettää muistiinpanon tekstillä ja kuvaPolulla
    Niin muistiinpano tallentuu Rantapellolle satovuodelle 2026
    Ja se näkyy aikajanalla muistiinpanoksi merkittynä
```

## F3 — Ravinnerajan ohitus

Nykyisin rajan ylittävä levitys hylätään suoraan. Agronomia joskus perustelee
ylityksen — jäljitettävästi.

- Lannoituksen syöte voi sisältää kentän `ohitus: { perustelu: string }`
  (perustelu pakollinen, ei-tyhjä).
- Kelvollisella ohituksella rajan ylittävä levitys **tallennetaan**, merkitään
  `ohitettu: true`, ja vastaus sisältää varoituksen 422:n sijaan.
- Ilman ohitusta nykyinen 422-käyttäytyminen säilyy täsmälleen ennallaan.
- Ohitetut levitykset erottuvat näkyvästi aikajanalla.

```gherkin
Ominaisuus: Ohita ravinneraja

  Tapaus: Ylitä typpiraja perustellen
    Oletetaan että Rantapellolla on 40 kg/ha typpivaraa jäljellä
    Kun kirjataan 400 kg/ha levitys tuotteella NPK 20-3-8
      perustelulla "jaettu levitys sovittu neuvojan kanssa"
    Niin toimenpide tallennetaan ja merkitään ohitetuksi
    Ja vastaus sisältää varoituksen, joka nimeää ylittyneen rajan

  Tapaus: Perustelematon ohitus hylätään
    Kun sama levitys sisältää ohituksen tyhjällä perustelulla
    Niin API vastaa 400
```

## F4 — Vaatimustenmukaisuusraportin vienti

Kauden hiljainen päätösvaihe: kirjaukset rekisterille.

- `GET /api/lohkot/:id/raportti?vuosi=` palauttaa vaatimustenmukaisuusraportin:
  lohkon tiedot, kasvi ja kaikki **raportoitavat** toimenpiteet (lannoitus,
  ruiskutus, sadonkorjuu — ei kylvö, ei muistiinpanot) rekisterin tarvitsemine
  tietoineen.
- Raportti sisältää yhteenvedot: käytetyt ravinteet rajoja vasten ja sovellettu
  aikaisin sallittu korjuupäivä.
- `?muoto=csv` palauttaa saman datan CSV:nä (`text/csv`).

```gherkin
Ominaisuus: Vaatimustenmukaisuusraportti

  Tapaus: Vie lohkon kausi JSON-muodossa
    Oletetaan että Rantapellolla on kylvö, lannoitus ja ruiskutus vuonna 2026
    Kun vuoden 2026 raportti pyydetään
    Niin se listaa 2 raportoitavaa toimenpidettä ravinneyhteenvetoineen
    Ja kertoo sovelletun aikaisimman sallitun korjuupäivän

  Tapaus: Vie CSV-muodossa
    Kun raportti pyydetään parametrilla muoto=csv
    Niin vastauksen sisältötyyppi on text/csv
    Ja jokaisesta raportoitavasta toimenpiteestä on yksi rivi
```
