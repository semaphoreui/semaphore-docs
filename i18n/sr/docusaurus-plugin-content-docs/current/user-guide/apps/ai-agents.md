---
title: AI agenti
description: Kreiranje šablona Claude Code ili Codex agenta, njegov prompt i izrazi u promptu, API ključ, MCP serveri, CLI argumenti i log zadatka.
---

# AI agenti

Pomoću Semaphore UI možete da pokrećete AI agente za programiranje: [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) i [Codex](https://developers.openai.com/codex/cli). Šablon agenta pokreće agentov alat komandne linije u direktorijumu repozitorijuma i prosleđuje mu prompt. Agent radi samostalno, bez ikoga ko bi odgovarao na njegova pitanja, i o onome što radi izveštava u logu zadatka.

:::note

Šabloni AI agenata dostupni su od verzije **Semaphore 2.21**.

:::

Koristite šablon agenta za posao koji biste inače opisali kolegi: pregledaj poslednji commit, pronađi i ispravi test koji pada, ažuriraj zavisnost i otvori pull request. Kao i svaki drugi šablon, može se pokrenuti ručno, [rasporedom](/user-guide/schedules), [integracijom](/user-guide/integrations) ili [tokom rada](/user-guide/workflows).

## Pre nego što počnete {#before-you-begin}

- **Agentov alat komandne linije je instaliran** na mašini koja izvršava zadatke: na Semaphore serveru ili na [runner-u](/admin-guide/runners).

  | Aplikacija | ID | Komanda | Instalacija |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore uključuje aplikaciju kada pri pokretanju pronađe njenu komandu u `PATH`-u. Administrator je takođe može uključiti i zadati putanju do izvršnog fajla na stranici [Aplikacije](/user-guide/apps#managing-applications).
- **API ključ** provajdera modela, pogledajte [API ključ](#api-key).
- **Repozitorijum** u kojem agent radi, dodat u [Repozitorijume](/user-guide/repositories).

## Kreiranje šablona {#create-a-template}

1. Otvorite odeljak **Šabloni zadataka** (Task Templates), kliknite na **Novi šablon** (New Template), a zatim na **Claude Code Agent** ili **Codex Agent**.

![Meni Novi šablon sa stavkama Claude Code Agent i Codex Agent](/assets/agent-template-new.webp)

2. Podesite šablon.

![Editor šablona Claude Code Agent](/assets/agent-template-editor.webp)

Šablon omogućava da navedete sledeće parametre:

| Polje | Opis |
|---|---|
| **Repozitorijum** (Repository) | Repozitorijum u kojem agent radi. Semaphore ga klonira ili ažurira pre zadatka, kao i za svaki drugi šablon. |
| **Putanja poddirektorijuma** (Subdirectory path) | Opciono. Direktorijum repozitorijuma u kojem se agent pokreće. Ako se izostavi, agent se pokreće u korenu repozitorijuma. |
| **MCP serveri** (MCP servers) | Opciono. MCP inventar sa serverima čije alate agent može da poziva, pogledajte [MCP serveri](#mcp-servers). |
| **Grupe promenljivih** (Variable Groups) | Promenljive i tajne za agenta: API ključ, vrednosti za [izraze u promptu](#prompt-expressions), promenljive okruženja agentovog procesa. |
| **Prompt** | Uputstvo sa kojim se agent pokreće, pogledajte [Prompt](#prompt). |
| **CLI argumenti** (CLI args) | Dodatni argumenti za komandu agenta, pogledajte [CLI argumenti](#cli-arguments). |
| **Anketne promenljive** (Survey Variables) | Pitanja koja se postavljaju pri pokretanju zadatka. Odgovori se mogu ubaciti u prompt. |
| Polje za potvrdu **Prompt** | Pod **Claude Code upiti** (Claude Code prompts) ili **Codex upiti** (Codex prompts). Omogućava onome ko pokreće zadatak da zameni prompt, pogledajte [Prompt zadatka](#prompt-of-a-task). |

3. Kliknite **Sačuvaj** (Save), a zatim pokrenite šablon dugmetom **Pokreni** (Run).

## API ključ {#api-key}

Agent uzima svoj API ključ iz promenljive okruženja. Dodajte ključ u [grupu promenljivih](/user-guide/environment) (Variable Group) šablona kao **tajnu promenljivu okruženja**:

| Aplikacija | Promenljiva | Takođe se prihvata |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

Prijava korisnika pod kojim Semaphore radi se ne koristi: svaki zadatak dobija sopstveni, prazan konfiguracioni direktorijum agenta, pa je ključ iz grupe promenljivih jedini način autentifikacije.

Ako nijedna od promenljivih nije zadata, log zadatka navodi koju treba dodati, a sam agent zatim pada sa sopstvenom greškom:

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## Prompt {#prompt}

Prompt je ono što biste otkucali agentu: običan tekst, dug koliko je potrebno. Prosleđuje se agentu na standardni ulaz, pa se ne pojavljuje u listi procesa.

Prompt je obavezan, osim ako polje za potvrdu **Prompt** dozvoljava da zadatak donese sopstveni.

### Izrazi u promptu {#prompt-expressions}

Prompt šablona može da preuzima vrednosti iz grupa promenljivih šablona. Napišite izraz u dvostrukim vitičastim zagradama, kao u GitHub Actions, i Semaphore ga zamenjuje kada zadatak počne:

| Izraz | Vrednost |
|---|---|
| `${{ vars.extra.NAME }}` | Dodatna promenljiva grupe promenljivih. |
| `${{ vars.env.NAME }}` | Promenljiva okruženja grupe promenljivih. |
| `${{ secrets.extra.NAME }}` | Tajna dodatna promenljiva grupe promenljivih. |
| `${{ secrets.env.NAME }}` | Tajna promenljiva okruženja grupe promenljivih. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

Pravila:

- **Anketne promenljive** su dodatne promenljive: odgovor na anketnu promenljivu `version` je `${{ vars.extra.version }}`, a tajna je `${{ secrets.extra.NAME }}`. Anketna promenljiva koja se isporučuje kao promenljiva okruženja nalazi se pod `env`. Anketna promenljiva na koju nije odgovoreno daje prazan string.
- **Promenljiva koja ne postoji obara zadatak** pre nego što se agent pokrene, uz poruku koja navodi izraz. Semaphore ne pokreće agenta sa rupom u promptu.
- **Pogrešno napisan izraz se odbija pri čuvanju šablona**: `${{ secrets.TOKEN }}` nema `extra` ni `env`.
- **Ostali izrazi ostaju kakvi jesu.** Samo `vars.…` i `secrets.…` pripadaju Semaphore-u, pa prompt može da zatraži od agenta da napiše workflow koji sadrži `${{ github.sha }}`. Da biste izraz `vars` ili `secrets` zadržali kao tekst, stavite još jedan znak dolara ispred njega: `$${{ secrets.env.NAME }}`.
- **Vrednost se ubacuje onakva kakva jeste.** String se koristi kako je napisan, a lista ili objekat kao JSON. U vrednosti se izrazi ne traže ponovo.
- **Tajna koja je ubačena u prompt se maskira** u logu zadatka, gde god je agent ponovi.

:::warning

Tajna u promptu šalje se provajderu modela zajedno sa ostatkom prompta, a agent može da je upotrebi na svaki način koji prompt dozvoljava. Bolje je da tajnu date agentovim alatima: kao tajnu promenljivu okruženja grupe promenljivih ili kao token [MCP servera](#mcp-servers).

:::

### Prompt zadatka {#prompt-of-a-task}

Kada je polje za potvrdu **Prompt** uključeno, forma zadatka prikazuje prompt šablona i omogućava da ga promenite za jedno pokretanje. Raspored, integracija ili korak toka rada mogu na isti način da čuvaju sopstveni prompt. Preko API-ja ga pošaljite u parametrima zadatka:

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

Prompt koji zada zadatak koristi se tačno onako kako je napisan: **izrazi u promptu zamenjuju se samo u promptu sačuvanom u šablonu**. Tako promenljive i tajne projekta ostaju nedostupne svakome ko sme samo da pokreće zadatke. Ako šablon to ne dozvoljava, zadatak koji donosi prompt se odbija.

## MCP serveri {#mcp-servers}

Agent može da poziva alate udaljenih [MCP](https://modelcontextprotocol.io) servera: sistem za praćenje zadataka, pretragu dokumentacije, vaš sopstveni servis. Serveri se čuvaju u inventaru tipa **MCP Inventory**, a jedan inventar služi i Claude Code i Codex šablonima.

1. Otvorite odeljak **Inventar** (Inventory), kliknite na **Novi inventar** (New Inventory), a zatim na **MCP Inventory**.
2. Dodajte servere i kliknite **Sačuvaj** (Save).
3. Izaberite inventar u polju **MCP serveri** (MCP servers) šablona.

![Forma MCP inventara sa tri servera](/assets/agent-mcp-inventory.webp)

| Polje | Opis |
|---|---|
| Prekidač | Server koji je isključen ostaje u listi i ne daje se agentu. |
| **Naziv** (Name) | Naziv pod kojim agent poznaje server: do 64 slova, cifre, `-` i `_`. Prikazuje se u logu zadatka ispred naziva alata. |
| **URL** | `http` ili `https` adresa servera koji govori MCP preko HTTP-a ili SSE-a. Korisničko ime ili lozinka u URL-u se ne prihvataju. |
| **Token** | Opciono. Agent ga šalje u zaglavlju `Authorization` kao bearer token. |

Sačuvani token čuva se šifrovan i nikada se više ne prikazuje: unesite novi da biste ga zamenili ili ga uklonite krstićem. Token stiže do agenta kao promenljiva okruženja njegovog procesa; ne upisuje se u konfiguracioni fajl agenta, u komandnu liniju niti u log zadatka.

Alati izabranih servera odobreni su unapred, pošto nema nikoga ko bi potvrdio poziv. Agent dobija tačno ove servere: MCP serveri podešeni za korisnika pod kojim Semaphore radi se ne koriste.

## CLI argumenti {#cli-arguments}

**CLI argumenti** (CLI args) dodaju se komandi agenta posle argumenata koje Semaphore sam postavlja. Unesite svaki token kao zaseban argument:

```json
["--model", "claude-sonnet-5-5"]
```

Koristite ih za ono što nudi sama komandna linija agenta: model, ograničenja, dozvole. Agent radi bez nadzora, pa se alat koji bi tražio potvrdu umesto toga odbija; koje alate agent sme da koristi bez pitanja zadaje se njegovim argumentima. Opcije vaše verzije potražite u [referenci za Claude Code CLI](https://docs.claude.com/en/docs/claude-code/cli-reference) i [referenci za Codex CLI](https://developers.openai.com/codex/cli/reference).

Kada su **CLI argumenti** (CLI args) uključeni pod **Upiti** (Prompts), zadatak može da doda sopstvene argumente.

Promenljive i tajne iz grupa promenljivih ne dodaju se u komandnu liniju agenta, gde bi ih lista procesa prikazala. Promenljive okruženja i tajne promenljive okruženja prosleđuju se agentovom procesu.

## Kako se agent pokreće {#how-the-agent-runs}

Semaphore pokreće agenta u direktorijumu repozitorijuma, ili u njegovoj **putanji poddirektorijuma** (Subdirectory path), sa promptom na standardnom ulazu:

| Aplikacija | Komanda |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **Svaki zadatak ima sopstveni konfiguracioni direktorijum** agenta (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`), koji se kreira za zadatak i uklanja posle njega. Podešavanja, prijave i MCP serveri korisnika pod kojim Semaphore radi ne stižu do agenta, a promenljiva iz grupe promenljivih ne može da preusmeri taj direktorijum.
- **Ništa se ne čuva između zadataka**: svako pokretanje je nova sesija agenta. Ono što treba da nadživi pokretanje pripada repozitorijumu: commit, pull request, fajl.
- **Agent čita fajlove sa uputstvima iz repozitorijuma** koje njegov alat komandne linije sam čita u radnom direktorijumu, kao što su `CLAUDE.md` ili `AGENTS.md`.
- **Na Docker i Kubernetes runner-ima** agent radi u kontejneru, pa [executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) mora da sadrži komandu `claude` ili `codex`.

## Log zadatka {#task-log}

Log zadatka prikazuje rad agenta dok se odvija:

![Log Claude Code zadatka: model, pozivi alata, podagent, rezime](/assets/agent-task-log.webp)

- **Tekst** agenta, red po red. Codex ispisuje poruku kada je završena.
- **Pozivi alata**, svaki u jednom redu: stanje, MCP server i alat, argumenti. Kliknite na red da biste videli argumente i rezultat. Neuspeli poziv je otvoren od početka.
- **Podagenti**: redovi podagenta označeni su njegovim nazivom.
- **Prvi red** Claude Code pokretanja navodi model i MCP servere, pri čemu su oni koji se nisu povezali prikazani crvenom bojom.
- **Rezime** na kraju: broj koraka, trajanje, tokeni i cena, u meri u kojoj ih agent prijavljuje.

**Sirovi log** (Raw log) prikazuje isti log kao običan tekst.

## Bezbednost {#security}

- **Agent izvršava komande.** U okviru dozvola koje mu daje njegov alat komandne linije, agent može da čita i menja direktorijum repozitorijuma, pokreće programe kao korisnik koji izvršava zadatke i poziva alate svojih MCP servera. Šablonu agenta dajte pristup kakav biste dali skripti koju je napisao neko drugi: repozitorijum i tokene sa najužim pravima koja su dovoljna za posao, i zaseban [runner](/admin-guide/runners) za posao koji želite da držite odvojeno od servera.
- **Prompt i ono što agent čita odlaze provajderu modela**: fajlovi repozitorijuma, izlaz komandi, rezultati alata.
- **Repozitorijum može da daje uputstva agentu.** Tekst u fajlovima koje agent čita, u issue-u ili u rezultatu alata može da promeni ono što agent radi. Ne usmeravajte agenta sa moćnim tokenima na sadržaj koji ne kontrolišete.
- **Tokeni i tajne se maskiraju u logu zadatka**: tokeni MCP servera i tajne ubačene u prompt zamenjuju se sa `********`.
- **Samo prompt sačuvan u šablonu može da koristi promenljive i tajne**, pogledajte [Prompt zadatka](#prompt-of-a-task).
