# Lohkokirja - Copilot-harjoitukset

Harjoitusten pääpaino ei ole sovelluskoodissa. Koodi on valmis pohja, jonka
ympärille rakennat agenttityöskentelyn valjaat (engl. harness): ohjeet, agentit,
hookit, skillit ja MCP-palvelimet. Sovellusta laajennetaan pienin askelin pitkin
matkaa, ja lopussa annat valjastetun agentin toteuttaa kokonaisen ominaisuuden.

**Kesto:** noin 3 h (harjoitukset 0-6). Nopeille on extrat lopussa.

## Pelisäännöt

1. **Anna Copilotin tehdä rungot.** Jokaisessa harjoituksessa on linkki
   viralliseen dokumentaatioon. Anna linkki chatille ja pyydä tiedoston runko.
   Sinä teet suunnittelupäätökset ja karsit tuloksen.
2. **Osoita konteksti täsmällisesti.** Käytä #-viittauksia (`#file`, `#folder`,
   `#selection`, `#codebase`, `#fetch`), Add Context -nappia tai vedä tiedostot
   suoraan chattiin. Maalaa koodinpätkä editorissa ja kirjoita `#selection`,
   kun tarkoitat juuri sitä. Ohje:
   <https://code.visualstudio.com/docs/chat/copilot-chat-context>
3. **Sovellus pysyy vihreänä.** `make check` (tyypit, lint, testit) on tuomari.
   Kaikki komennot näet komennolla `make help`; `Makefile` näyttää myös niiden
   npm-vastineet.
4. **Apua saa.** Repossa on valmiina kaksi agenttia: `Rasmus` (kouluttajan
   avatar, tuntee dokumentaation ja harjoitukset) ja `Tutkija` (tutkii
   koodikantaa ja raportoi). Kysy niiltä ennen kuin jäät jumiin.

---

## Harjoitus 0 - Käyttöönotto (10 min)

**Tavoite:** Sovellus pyörii ja tiedät, mitä repossa on valmiina.

**Vaiheet**

1. `make install && make test`. Tulos: 33 testiä vihreänä.
2. `make dev` ja avaa <http://localhost:3000>. Klikkaile lohkoja.
3. Avaa Copilot Chat (Ctrl+Alt+I, Macissa Ctrl+Cmd+I) ja valitse **Agent**-tila.
4. Agenttivalitsimesta löytyvät `Rasmus` ja `Tutkija`. Kysy Rasmukselta:
   "Mitä .github-kansiossa on valmiina ja mitä minä rakennan itse?"
5. Pyydä Tutkijalta: "Selvitä normaali-syvyydellä, miten ravinnerajasääntö
   toimii ja missä se on toteutettu."
6. Tutustu valmiisiin osiin: `AGENTS.md` (repo-laajuiset säännöt) ja `docs/`
   (arkkitehtuuri, domain, rajapinta, testaus), tiedostokohtainen ohje
   `.github/instructions/backend.instructions.md` sekä agenttimääritykset
   `.github/agents/`. `AGENTS.md` on agenttiohjeiden standarditiedosto, jonka
   Copilot ja muut agenttityökalut lukevat. (Pelkkä Copilot tukee myös nimeä
   `.github/copilot-instructions.md`; tässä projektissa käytetään vain
   `AGENTS.md`:tä, jotta sääntöjä ei kirjoiteta kahteen kertaan.)

**Todenna:** Tutkija vastaa tiedostoviittauksin (esim. `ravinneService.ts`)
eikä muokkaa mitään.

**Pohdittavaa:** Mitä kontekstia Copilot sai automaattisesti jo ennen kuin
kirjoitit mitään? Mistä näet sen? (Vihje: vastauksen References-lista.)

---

## Harjoitus 1 - Ohjeet (25 min)

**Tavoite:** Kaksi uutta rajattua ohjetiedostoa: testit ja frontend.
Repo-laajuiset säännöt (`AGENTS.md`) ja backendin ohje ovat jo olemassa.
Nyt rakennat ohjeistuksen rajatun kerroksen.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/custom-instructions>

**Vaiheet**

1. Lue `.github/instructions/backend.instructions.md` malliksi. Huomaa
   frontmatter-kentät `name`, `description` ja `applyTo`.
2. Sparraa sisältö Copilotin kanssa. Lisää konteksti: kirjoita chattiin
   `#folder` ja valitse `tests` (tai vedä kansio chattiin) ja kysy:
   "Mitä konventioita näissä testeissä on? Listaa vain asiat, jotka pätevät
   jokaiseen tiedostoon." Karsi listasta itse pois kaikki, mikä ei päde aina.
3. Luo tiedosto: aja chatissa `/create-instruction` tai luo käsin
   `.github/instructions/testing.instructions.md`, frontmatteriin
   `applyTo: 'tests/**'`.
4. Liitä karsittu lista tiedostoon. Lyhyt on hyvä: alle 30 riviä riittää.
5. Toista frontendille: konteksti `#folder public`, tiedosto
   `.github/instructions/frontend.instructions.md`, `applyTo: 'public/**'`.
   Ytimessä: vanilla JS, ei frameworkeja, näkyvillä elementeillä `data-testid`.

**Todenna:** Pyydä agenttia kirjoittamaan uusi testi `ravinneService`lle
(esim. raja tasan 100 %). Tarkista vastauksen References-listasta, että
`testing.instructions.md` latautui, ja että testi noudattaa konventioitasi.

**Pikatehtävä:** Toteuta PRD:n pientehtävä **P1** (lohkokortit näyttävät
kasvin nimen) Agent-tilassa. Frontend-ohjeesi ohjaa nyt työtä.

**Pohdittavaa:** Mikä kuuluu `AGENTS.md`:hen (aina ladattu), mikä rajattuun
`*.instructions.md`-tiedostoon, mikä `docs/`-kansioon, mikä READMEen? Miksi
väärä väite ohjeessa on pahempi kuin puuttuva?

---

## Harjoitus 2 - Suunnittelija-agentti (25 min)

Työnkulku, johon loppupäivä nojaa: **Tutki -> Suunnittele -> Toteuta**.
Kallis ajattelu tehdään ennen koodia. Tutkija on jo olemassa. Nyt rakennat
ketjun keskimmäisen osan.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/custom-agents>

**Vaiheet**

1. Generoi runko: aja chatissa `/create-agent` tai anna dokumentaatiolinkki ja
   pyydä `.github/agents/suunnittelija.agent.md`.
2. Päätä frontmatter:
   - `tools: [read, search, edit]`. Edit on mukana vain siksi, että tiketti
     kirjoitetaan tiedostoon. Ei terminaalia.
   - `model`: suunnittelu on ajattelutyötä, valitse vahva malli.
3. Kirjoita protokolla tiedoston runko-osaan:
   - Lue PRD:n tehtävä ja Tutkijan raportti, jos sellainen annetaan.
   - Kirjoita tiketti tiedostoon `tasks/<tunnus>.md`. Ei muita
     tiedostomuutoksia.
   - Tiketin muoto: tavoite, kosketettavat tiedostot, hyväksymiskriteerit
     (Oletetaan/Kun/Niin), rajaukset (mitä EI tehdä), testisuunnitelma.
4. Aja ketju kevyesti läpi: pyydä Tutkijalta pikaselvitys "mitkä tiedostot
   liittyvät toimenpiteiden listaukseen", anna raportti Suunnittelijalle ja
   pyydä tiketti PRD:n pientehtävästä **P2**.

**Todenna:** `tasks/`-kansiossa on tiketti, joka nimeää oikeat kerrokset
(malli -> service -> reitti -> testit). Suunnittelija ei koskenut muihin
tiedostoihin.

**Pikatehtävä:** Anna tiketti oletusagentille ja toteuta **P2**. Aja `make test`.

**Pohdittavaa:** Copilot laskuttaa mallit tokeneina: syöte-, tuloste- ja
välimuistitokenit hinnoitellaan mallikohtaisesti, ja edullisimmat mallit
maksavat noin viidesosan kalleimmista
(<https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing>).
Tiketti on muutama tuhat tokenia, toteutus kymmeniä tuhansia. Missä kohtaa
ketjua vahva malli maksaa itsensä takaisin?

Huomaa myös: Suunnittelijan "vain tasks/-kansioon" on pelkkä ohje, ei tae.
Harjoituksessa 3 rakennat takeen.

---

## Harjoitus 3 - Hookit (25 min)

**Tavoite:** Portinvartija ja laatuautomaatio. Ohje on toive, hooki on tae.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/hooks>

**Vaiheet**

1. Luo kansio `.github/hooks/`. Anna dokumentaatiolinkki Copilotille ja pyydä
   hook-määritys (JSON) ja skriptit valmiiksi.
2. **Portinvartija** (`PreToolUse`): skripti lukee työkalukutsun stdinistä ja
   palauttaa `permissionDecision`-päätöksen:
   - `deny`: tuhoavat komennot (`rm -rf`, `git push --force`, `npm uninstall`)
   - `ask`: `npm install` (uusi riippuvuus vaatii ihmisen)
   - `allow`: kaikki muu.
3. **Laatuautomaatio** (`PostToolUse`): kun agentti muokkaa tiedostoa, aja
   `npx prettier --write` muokatulle tiedostolle. Prettier on jo
   devDependency, joten npx käyttää paikallista asennusta.
4. **Globaali hooki:** sama mekanismi toimii myös käyttäjätasolla, jolloin
   hooki pätee kaikissa repoissasi. Luo `~/.copilot/hooks`-kansioon
   `SessionStart`-hooki, joka kirjaa session alun lokitiedostoon. Vertaa:
   workspace-hooki kulkee repon mukana koko tiimille, käyttäjätason hooki vain
   sinulla.

**Todenna:** Pyydä agenttia ajamaan `rm -rf /tmp/testi`. Eston pitää tulla
hookilta, ei mallin harkinnasta. Pyydä sitten pieni muokkaus johonkin
tiedostoon rumalla formatoinnilla: Prettier siistii jäljen. Avaa uusi sessio
ja tarkista, että globaali hooki kirjasi sen.

**Pikatehtävä:** Toteuta PRD:n pientehtävä **P3** (`GET /api/versio`). Seuraa
hookien toimintaa työn aikana.

**Pohdittavaa:** Mitkä `AGENTS.md`:n säännöistä ovat oikeasti toiveita, jotka
kuuluisivat hookiksi? Mitä hookin EI kannata tehdä (kesto, kohina, väärät
estot)? Miten takaisit Suunnittelijan tasks/-rajauksen hookilla?

---

## Harjoitus 4 - Skilli: aja-testit (25 min)

**Tavoite:** Skilli niputtaa toistuvan työvaiheen: täsmälleen oikean komennon
ja ohjeet tuloksen käsittelyyn. Agentti ei keksi komentoa itse, vaan ajaa
skillin skriptin ja analysoi tuloksen joka kerta samalla tavalla.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/agent-skills>

**Vaiheet**

1. Luo kansio `.github/skills/aja-testit/` ja siihen `SKILL.md` sekä
   `scripts/run-tests.sh`. Anna dokumentaatiolinkki Copilotille ja pyydä runko.
2. Skripti ajaa `npx vitest run --reporter=json` ja tulostaa tiiviin
   yhteenvedon: läpäisseet, epäonnistuneet ja epäonnistumisten virheviestit.
3. `SKILL.md`:n ohjeosa kertoo, mitä tuloksella tehdään: kun testi on rikki,
   tee juurisyyanalyysi. Lue epäonnistunut testi ja testattava koodi, kerro
   miksi testi hajosi ja ehdota korjaus. Älä korjaa ilman lupaa.
4. Päätä frontmatter: `name`, `description` (milloin agentin kannattaa ladata
   tämä itse) ja tarvitaanko `disable-model-invocation`.

**Todenna:** Aja `/aja-testit` chatissa: raportti vihreä. Riko sitten yksi
testi tahallaan (muuta odotusarvoa testitiedostossa) ja aja `/aja-testit`
uudelleen: skilli nimeää rikkinäisen testin, kertoo juurisyyn ja ehdottaa
korjauksen. Palauta muutos.

**Pikatehtävä:** Toteuta PRD:n pientehtävä **P4** (kasvinsuojeluaineet
aakkosjärjestykseen + testi). Päätä työ ajamalla `/aja-testit`.

**Pohdittavaa:** Sama asia kolmella mekanismilla: ohje ("aja testit aina"),
hooki (testit ajetaan joka muokkauksen jälkeen) ja skilli (agentti ajaa
tarvittaessa). Milloin mikäkin on oikea valinta?

---

## Harjoitus 5 - MCP (20 min)

**Tavoite:** Kytke ensimmäinen MCP-palvelin ja anna agentin todentaa sovellus
oikeassa selaimessa.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/mcp-servers>
ja <https://github.com/microsoft/playwright-mcp>

**Vaiheet**

1. MCP-palvelimia löytyy kuratoidusta rekisteristä <https://github.com/mcp>
   ja VS Coden Extensions-näkymästä haulla `@mcp`. Selaa hetki: mikä näistä
   palvelisi omaa tiimiäsi oikeasti?
2. Tässä harjoituksessa käytetään Playwrightia. Luo `.vscode/mcp.json`:

   ```json
   {
     "servers": {
       "playwright": {
         "type": "stdio",
         "command": "npx",
         "args": ["@playwright/mcp@latest"]
       }
     }
   }
   ```

3. Käynnistä palvelin: `mcp.json`-tiedostossa näkyy Start-painike palvelimen
   kohdalla (tai komentopaletista **MCP: List Servers**). Tarkista chatin
   Configure Tools -valikosta, mitä työkaluja ilmestyi.
4. Pidä `make dev` käynnissä ja pyydä agenttia: "Avaa http://localhost:3000,
   valitse Rantapelto ja raportoi sen ravinnetilanne ja aikaisin sallittu
   korjuupäivä. Vertaa lukuja /api/lohkot/rantapelto-vastaukseen."

**Todenna:** Luvut täsmäävät: N 80/120, P 12/15, K 32/60, korjuu 2026-07-07.

**Pikatehtävä:** Toteuta PRD:n pientehtävä **P5** (yläpalkkiin lohkojen
yhteispinta-ala) ja pyydä agenttia todentamaan selaimessa: 14.5 ha.

**Pohdittavaa:** MCP tuo agentille kykyjä ja samalla uutta hyökkäyspintaa.
Miten rajaat työkalut agenttikohtaisesti (`tools: ['playwright/*']`)? Mitä
rekisterin palvelimista ottaisit oikeasti käyttöön ja millä perusteella?

---

## Harjoitus 6 - Toteuttaja ja koko ketju (45 min)

**Tavoite:** Rakenna Toteuttaja ja aja koko ketju Tutki -> Suunnittele ->
Toteuta -> Todenna ominaisuudelle **F1 - Sadonkorjuun kirjaus**. Kaikki
aiemmin rakennettu on nyt käytössä.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agents/subagents>

**Vaiheet**

1. Rakenna `.github/agents/toteuttaja.agent.md` (`/create-agent` tai
   dokumentaatiolinkki):
   - `tools`: read, search, edit, terminal sekä `playwright/*`
   - `agents: ['Tutkija']`: Toteuttaja delegoi taustaselvitykset subagentille,
     jolloin sen oma konteksti pysyy puhtaana
   - `model`: toteutus on suorittavaa työtä. Riittääkö edullisempi malli?
   - Protokolla: TDD eli testi ensin, sitten toteutus. Aja `/aja-testit` ennen
     valmiiksi julistamista. Pysähdy hyväksyntään ennen uusia riippuvuuksia.
2. **Tutki:** Pyydä Tutkijalta perusteellinen selvitys: "Miten toimenpiteet on
   toteutettu ja mitä F1 (sadonkorjuu) koskettaa?" Tutkija ei kirjoita
   tiedostoja, joten tallenna raportti itse tiedostoon `tasks/f1-tutkimus.md`.
3. **Suunnittele:** Anna raportti ja PRD:n F1 Suunnittelijalle. Tiketti syntyy
   tiedostoon `tasks/f1.md`. Lue ja korjaa tiketti itse. Sinä olet portti.
4. **Toteuta:** Anna tiketti Toteuttajalle (`#file tasks/f1.md`). Seuraa
   työtä: hookit valvovat, `/aja-testit` todentaa.
5. **Todenna:** Pyydä Toteuttajaa näyttämään Playwrightilla, että sato näkyy
   aikajanalla ja että varoaikasääntö estää liian aikaisen kirjauksen
   (`VAROAIKA_VOIMASSA`).

**Todenna:** Kaikki testit vihreät, uudet mukaan lukien. Hookit laukesivat
matkalla.

**Pohdittavaa:** Mitä kukin rooli luki ja tuotti? Missä ihminen oli portti,
liikaa vai liian vähän? Mitä siirtäisit ohjeista hookeiksi seuraavassa
projektissa?

---

## Extra - Agenttitiimi ja Orkestroija

**Tavoite:** Koko ketju agenttien välisenä delegointina. Orkestroija ohjaa
subagentteja: Tutkija, Suunnittelija, Toteuttaja ja Testaaja.

**Vaiheet**

1. Rakenna **Testaaja**: agentti, joka ajaa `/aja-testit`, tekee
   juurisyyanalyysin ja raportoi. Saa muokata vain `tests/`-kansiota.
2. Rakenna **Orkestroija**:
   - `tools`: vain read ja subagenttien kutsu. Ei editiä, ei terminaalia:
     Orkestroija ei tee työtä itse.
   - `agents: ['Tutkija', 'Suunnittelija', 'Toteuttaja', 'Testaaja']`
   - Protokolla: Tutki -> Suunnittele -> näytä tiketti käyttäjälle ja pyydä
     hyväksyntä -> Toteuta -> Testaa -> raportoi lopputulos.
3. Säädä mallit rooleittain: ajattelu vahvalla mallilla, suoritus edullisella.
4. Aja koko ketju yhdellä promptilla ominaisuudelle **F2** (muistiinpanot)
   tai **F3** (ravinnerajan ohitus).

**Todenna:** Ominaisuus valmis, testit vihreät, ja koko ketju kulki yhden
promptin kautta hyväksyntäpisteineen.

**Pohdittavaa:** Milloin orkestrointi kannattaa ja milloin suora agentti
riittää? Mihin kohtiin hyväksyntäpisteet kuuluvat?

**Pienet lisäextrat:**

- Handoff: Suunnittelijalle `handoffs`-kenttä, josta tiketti siirtyy nappia
  painamalla Toteuttajalle.
- Agenttikohtainen hooki: audit-loki vain Toteuttajalle (`hooks`-kenttä
  agenttimäärityksessä, vaatii asetuksen `chat.useCustomAgentHooks`).

---

## Bonus - Agents-ikkuna

**Tavoite:** Tutustu VS Coden Agents-ikkunaan: agenttivetoiseen näkymään,
jossa sessiot, muutokset ja kustomoinnit ovat etusijalla ja editori
sivuroolissa.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agents/agents-window>

**Huom:** Agents-ikkuna vaatii VS Coden uusimman version. Päivitä ensin:
Code > Check for Updates.

**Vaiheet**

1. Avaa Agents-ikkuna ja kierrä dokumentaation opastuksella näkymän osat:
   sessiolista, chat, Changes-paneeli ja Customizations-paneeli.
2. Customizations-paneelista löydät kaikki päivän aikana rakentamasi osat
   yhdestä paikasta: ohjeet, agentit, skillit, hookit ja MCP-palvelimet.
3. Halutessasi: aloita uusi sessio ja anna agentille toteutettavaksi F2, F3
   tai F4. Käytä Suunnittelijaa ja Toteuttajaa tästä näkymästä.
4. Seuraa työtä Changes-paneelista: diffit, kommentointi (Add Feedback) ja
   testien ajo Tasks-valikosta (`make test`).
5. Kokeile rinnakkaisia sessioita: käynnistä toinen sessio toiselle
   tehtävälle ja vertaa, miltä monen agentin seuraaminen tuntuu.

**Todenna:** Vapaamuotoinen tutustuminen riittää. Jos toteutit ominaisuuden,
testit vihreiksi kuten aiemmin.

**Pohdittavaa:** Mikä muuttuu, kun editori ei ole enää työn keskipiste?
Missä kohdissa haluat yhä tavallisen editorinäkymän?
