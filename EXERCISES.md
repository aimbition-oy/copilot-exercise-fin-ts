# Lohkokirja — Copilot-harnessharjoitukset

Näiden harjoitusten pohjantähti **ei ole sovelluskoodi** — se on valmis ja
jäädytetty. Rakennat sen ympärille _harnessin_: ohjeet, agentit, hookit, skillit
ja MCP-kytkennät, jotka tekevät agenttityöskentelystä ennustettavaa ja
ohjattavaa. Lopuksi annat rakentamasi valjaikon toteuttaa oikean ominaisuuden.

**Kesto:** ~3 h (harjoitukset 0–6). Nopeille on extroja lopussa.

## Pelisäännöt

1. **Skaffoldaa, älä käsinkirjoita.** Jokaisessa harjoituksessa on linkki
   viralliseen dokumentaatioon. Anna linkki Copilotille ja pyydä sitä
   generoimaan tiedoston runko — sinun työsi on _suunnittelupäätökset_, ei
   YAML-syntaksi.
2. **Tokenitalous kulkee mukana.** Aina kun luot agentin, frontmatterin
   `model`-kenttä on päätös, joka maksaa (tai säästää) rahaa. Kirjaa jokaiseen
   agenttiin yhden rivin kommentti: _miksi tämä malli tälle roolille?_
3. **Sovellus pysyy vihreänä.** `npm test` ja `npm run lint` ovat tuomareita.
   Jos ne hajoavat harnessia rakentaessa, jokin on pielessä.
4. **Tutkija auttaa.** Repoon on valmiiksi asennettu `Tutkija`-agentti
   (`.github/agents/tutkija.agent.md`). Käytä sitä, kun haluat selvittää, miten
   jokin toimii — se on samalla mallikappale siitä, mitä olet itse rakentamassa.

---

## Harjoitus 0 — Käyttöönotto ja savutesti (10 min)

**Tavoite:** Sovellus pyörii, testit ovat vihreät ja tunnet valmiin harnessin osat.

**Rakenna**

1. `npm install && npm test` — 33 testiä vihreänä.
2. `npm run dev` → avaa http://localhost:3000 ja klikkaile lohkoja.
3. Avaa Copilot Chat, vaihda **Agent**-tilaan ja kokeile agenttivalitsinta:
   sieltä löytyy `Tutkija`.
4. Pyydä Tutkijalta: _"Selvitä normaali-syvyydellä: miten ravinnerajasääntö
   toimii ja missä se on toteutettu?"_
5. Silmäile valmis harness: `.github/copilot-instructions.md`,
   `.github/instructions/backend.instructions.md`, `.github/agents/tutkija.agent.md`.

**Todenna:** Tutkija vastaa tiedostoviittauksin (esim. `ravinneService.ts`) eikä
yritä muokata mitään.

**Pohdittavaa:** Mitä kontekstia Copilot sai automaattisesti jo ennen kuin
kirjoitit mitään? Mistä tiedät?

---

## Harjoitus 1 — Ohjeistuskerros (20 min)

**Tavoite:** Täydennä kaksitasoinen ohjeistus: repo-laajuinen
`copilot-instructions.md` on jo olemassa, samoin yksi rajattu
`*.instructions.md` (backend). Sinä kirjoitat puuttuvat.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/custom-instructions>

**Rakenna**

1. Lue `.github/instructions/backend.instructions.md` malliksi — huomaa
   `applyTo`-frontmatter.
2. Luo `testing.instructions.md` (`applyTo: 'tests/**'`): miten testit tässä
   repossa kirjoitetaan (seedaus, determinismi, supertest-tyyli…). Anna
   Copilotille dokumentaatiolinkki + testitiedostot ja pyydä luonnos — **karsi
   sitten itse**: jokainen väite, joka ei päde universaalisti, pois.
3. Luo `frontend.instructions.md` (`applyTo: 'public/**'`): vanilla JS,
   `data-testid`-vaatimus, ei frameworkeja.

**Todenna:** Pyydä agenttia kirjoittamaan uusi testi
(`ravinneService`: esim. raja täsmälleen 100 %). Tarkista chatin
viiteluettelosta (References), että `testing.instructions.md` latautui — ja että
testi noudattaa konventioitasi.

**Pohdittavaa:** Mikä kuuluu `copilot-instructions.md`:hen, mikä rajattuun
tiedostoon, mikä READMEen? Miksi väärä väite ohjeessa on pahempi kuin puuttuva?

---

## Harjoitus 2 — Suunnittelija-agentti (25 min)

**Tavoite:** Ensimmäinen oma agenttisi: _Suunnittelija_, joka lukee `PRD.md`:n
ja tuottaa toteutuskelpoisen, yhden kontekstin kokoisen tiketin. Vain luku.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/custom-agents>

**Rakenna**

1. Anna Copilotille dokumentaatiolinkki ja pyydä generoimaan
   `.github/agents/suunnittelija.agent.md` -runko.
2. Suunnittelupäätökset (nämä ovat harjoituksen ydin):
   - `tools`: vain luku ja haku — miksi ei `edit`/`terminal`?
   - `model`: suunnittelu on ajattelutyötä — valitse kalliimpi malli ja kirjaa
     yhden rivin kustannusperustelu.
   - Protokolla runkoon: tiketin muoto = tavoite, kosketettavat tiedostot,
     hyväksymiskriteerit (Oletetaan/Kun/Niin), rajaukset (_mitä EI tehdä_),
     testisuunnitelma.
3. Tiketin on mahduttava yhteen agenttikontekstiin: ohjeista agentti
   viittaamaan tiedostoihin polkuina, ei kopioimaan sisältöä.

**Todenna:** Valitse Suunnittelija valitsimesta ja pyydä tiketti ominaisuudesta
**F1 — Sadonkorjuun kirjaus**. Agentti ei saa yrittää muokata tiedostoja, ja
tiketin pitää nimetä oikeat kerrokset (malli → service → reitti → testit → UI).
Talleta tiketti talteen — tarvitset sitä harjoituksessa 6.

**Pohdittavaa:** GitHubin laskutuksessa premium-pyynnöt kertautuvat mallin
hinnalla. Milloin kallis malli maksaa itsensä takaisin — ja missä kohtaa
työnkulkua se on hukkaa?

---

## Harjoitus 3 — Hookit (25 min)

**Tavoite:** Kaksi hookia: deterministinen portinvartija ja laatuautomaatio.
Ohje on toive — hooki on tae.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/hooks>

**Rakenna**

1. Luo `.github/hooks/`-hakemisto. Anna Copilotille dokumentaatiolinkki ja
   pyydä generoimaan:
2. **Portinvartija** (`PreToolUse`): skripti, joka lukee työkalukutsun stdinistä
   ja palauttaa `permissionDecision`-päätöksen:
   - `deny`: tuhoavat komennot (`rm -rf`, `git push --force`, `npm uninstall`…)
   - `ask`: `npm install` (uusi riippuvuus vaatii ihmisen)
   - `allow`: kaikki muu.
3. **Laatuautomaatio** (`PostToolUse`): kun agentti muokkaa tiedostoa, aja
   `npx prettier --write` muokatulle tiedostolle.

**Todenna:** Pyydä agenttia (Agent-tilassa) ajamaan `rm -rf /tmp/testi` → eston
pitää tulla hookilta, ei mallin harkinnasta. Pyydä sitten pieni muokkaus
johonkin tiedostoon rumalla formatoinnilla → Prettier siistii jäljen.

**Pohdittavaa:** Mitkä `copilot-instructions.md`:n säännöistä ovat oikeasti
toiveita, jotka kuuluisivat hookiksi? Entä mitä hookin EI kannata tehdä
(kesto, kohina, väärät positiiviset)?

---

## Harjoitus 4 — Skilli: aja-testit (25 min)

**Tavoite:** Deterministinen skilli, joka ajaa testit ja palauttaa tuloksen
koneluettavana — agentti ei enää _tulkitse_ testitulostetta, se _lukee_ sen.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/agent-skills>

**Rakenna**

1. Luo `.github/skills/aja-testit/SKILL.md` + skripti (Copilot generoi:
   anna dokumentaatiolinkki ja kerro tavoite).
2. Skripti ajaa `npx vitest run --reporter=json` ja tiivistää stdoutiin:
   `{ "lapaisi": n, "epaonnistui": n, "epaonnistumiset": [{ "testi": "...", "syy": "..." }] }`.
3. Frontmatter-päätökset: `name`, `description` (milloin agentin kannattaa
   käyttää tätä itse?), tarvitaanko `disable-model-invocation`?

**Todenna:** Aja `/aja-testit` chatissa. Riko sitten tahallaan yksi testi
(muuta odotusarvoa testitiedostossa), aja skilli uudelleen → raportin pitää
nimetä täsmälleen rikkoutunut testi. Palauta muutos.

**Pohdittavaa:** Sama asia kolmella mekanismilla: ohje ("aja testit aina"),
hooki (testit ajetaan joka muokkauksen jälkeen) ja skilli (agentti ajaa
halutessaan). Milloin mikäkin on oikea valinta?

---

## Harjoitus 5 — MCP: Playwright (20 min)

**Tavoite:** Kytke ensimmäinen MCP-palvelin ja anna agentin todentaa sovellus
oikeassa selaimessa.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agent-customization/mcp-servers>
ja <https://github.com/microsoft/playwright-mcp>

**Rakenna**

1. Luo `.vscode/mcp.json`, jossa Playwright MCP stdio-palvelimena
   (`npx @playwright/mcp@latest`). Copilot generoi rungon dokumentaatiolinkistä.
2. Käynnistä palvelin VS Codessa ja tarkista työkalulistasta, mitä työkaluja
   ilmestyi (Configure Tools).
3. Pidä `npm run dev` käynnissä ja pyydä agenttia: _"Avaa http://localhost:3000,
   valitse Rantapelto ja raportoi sen ravinnetilanne ja aikaisin sallittu
   korjuupäivä. Vertaa lukuja API-vastaukseen ja kerro täsmäävätkö ne."_

**Todenna:** Agentin raportoimat luvut täsmäävät käyttöliittymään
(N 80/120, P 12/15, K 32/60, korjuu 2026-07-07).

**Pohdittavaa:** MCP-palvelin tuo agentille uusia kykyjä — ja uuden
hyökkäyspinnan. Miten rajaat työkalut agenttikohtaisesti
(`tools: ['playwright/*']`)? Mitä muita MCP-palvelimia tämä tiimi oikeasti
hyötyisi? (esim. Context7 kirjastodokumentaatioon.)

---

## Harjoitus 6 — Päätösharjoitus: Toteuttaja ja orkestrointi (45 min)

**Tavoite:** Rakenna _Toteuttaja_-agentti ja anna koko valjaikon tehdä oikeaa
työtä: **F1 — Sadonkorjuun kirjaus** suunnitelmasta selaindemoon. Tässä
harjoituksessa kaikki aiemmin rakennettu lyö kättä.

**Dokumentaatio:** <https://code.visualstudio.com/docs/agents/subagents>

**Rakenna**

1. `.github/agents/toteuttaja.agent.md`:
   - `tools`: nyt myös `edit` ja `terminal` — sekä `playwright/*`.
   - `agents: ['Tutkija']` — taustaselvitykset delegoidaan subagentille, jotta
     toteuttajan konteksti pysyy puhtaana.
   - `model`: toteutus on suorittavaa työtä — kelpaako edullisempi malli?
     Kirjaa perustelu.
   - Protokolla: TDD (testi ensin, sitten toteutus), aja `/aja-testit` ennen
     valmiiksi julistamista, pysähdy hyväksyntään ennen uusia tiedostoja.
2. Aja työnkulku:
   - **a)** Suunnittelijan tiketti F1:stä (harjoituksesta 2) → **b)** lue ja
     korjaa tiketti itse (sinä olet portti) → **c)** anna tiketti Toteuttajalle
     ja seuraa: hookkisi valvovat, skillisi todentaa → **d)** lopuksi pyydä
     Toteuttajaa näyttämään Playwrightilla, että sato näkyy aikajanalla.

**Todenna:** Kaikki testit vihreät uudet mukaan lukien; varoaikasääntö
(`VAROAIKA_VOIMASSA`) toimii; UI näyttää sadonkorjuun. Ja: tarkista hookiesi
lokeista/käyttäytymisestä, että ne todella laukesivat matkalla.

**Pohdittavaa:** Avaa kunkin roolin kontekstiprofiili: mitä Suunnittelija,
Tutkija ja Toteuttaja kukin lukivat ja tuottivat? Missä kohdin ihminen oli
portti — oliko portteja liikaa vai liian vähän? Mitä siirtäisit ohjeista
hookeiksi seuraavaan projektiin?

---

## Extrat nopeille

- **E1 — Handoff:** Lisää Suunnittelijalle `handoffs`-frontmatter: nappi, joka
  siirtää valmiin tiketin suoraan Toteuttajalle esitäytettynä promptina.
- **E2 — Agenttikohtainen hooki:** Audit-loki vain Toteuttajalle: jokainen
  työkalukutsu riviksi `toteuttaja-audit.log`-tiedostoon (`hooks`-kenttä
  agentin frontmatterissa; vaatii asetuksen `chat.useCustomAgentHooks`).
- **E3 — Toinen ominaisuus:** F2, F3 tai F4 koko putkella — tällä kertaa
  vähemmällä käsiohjauksella. Mittaa: montako korjauskierrosta tarvittiin?
- **E4 — Subagenttiviuhka:** Lähetä kaksi Tutkijaa rinnakkain vertailemaan
  kahta toteutustapaa F4:n CSV-viennille ja anna Suunnittelijan syntetisoida
  suositus raporteista.
