---
title: Klijent
description: Upravljanje Semaphore serverom iz terminala i iz skripti pomoću semaphore client - prijava i konteksti, redosled prioriteta podešavanja, formati izlaza, izlazni kodovi i pokretanje zadataka iz CI-ja.
---

# Klijent

`semaphore client` upravlja pokrenutim Semaphore serverom preko njegovog REST API-ja. Potrebni
su mu samo URL servera i API token — bez pristupa bazi podataka i bez konfiguracionog
fajla servera — pa radi sa laptopa, iz CI posla ili sa računara koji nikada nije
video serverov `config.json`.

```bash
semaphore client --help
```

Komande imaju oblik `semaphore client <resource> <action> [id|name]`.
Resursi se navode u jednini, a množina je alijas
(`template list` i `templates list` su isto). Svaki resurs ima `list`,
`get`, `create`, `update` i `delete`; zadaci dodaju `run`, `logs`, `wait`, `stop`
i slične. Potpun, generisan spisak svih komandi i flegova nalazi se u
[referenci komandi](/reference/cli/commands#semaphore-client).

| Grupa | Namena |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Prijava, provera tokena, ispis tokena, odjava. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Čuvanje više servera u jednom konfiguracionom fajlu i prebacivanje između njih. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Projekti, njihovi članovi, rezervne kopije i vraćanje iz njih. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Šabloni zadataka i `template run` za pokretanje zadatka. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Logovi, čekanje, zaustavljanje, potvrđivanje i ponovno pokretanje zadataka. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | Ostali resursi projekta. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Resursi na nivou celog servera (samo za administratore). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Verzija i podešavanja servera. |

## Prva prijava {#first-login}

Interaktivno: klijent traži login, lozinku i, kada je TOTP
uključen, kod, a zatim kreira API token i čuva ga. Lozinka se koristi
jednom i nikada se ne čuva.

```bash
semaphore client auth login --url https://semaphore.example.com
```

Sa postojećim tokenom (to je i način prijave na server koji nudi samo
jedinstvenu prijavu (SSO) — kreirajte token na stranici **Tokens** svog profila):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Oba oblika čuvaju *kontekst* nazvan po hostu servera u
`~/.semaphore/client.yml` i postavljaju ga kao trenutni. Šta se trenutno koristi proverite
komandom `semaphore client auth status`.

## Konfiguracija {#configuration}

Svako podešavanje može doći iz flega, promenljive okruženja ili trenutnog
konteksta, ovim redosledom prioriteta: **fleg > okruženje > kontekst > podrazumevano**.

| Fleg | Promenljiva okruženja | Značenje |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | URL servera, na primer `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Naziv konteksta koji se koristi umesto trenutnog. |
| — | `SEMAPHORE_CLIENT_TOKEN` | API token. Fleg `--token` namerno ne postoji: argumenti procesa su vidljivi u `ps` i u istoriji šela. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | Fajl koji sadrži token (završni prelazak u novi red se zanemaruje). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | ID ili naziv projekta za komande vezane za projekat. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (podrazumevano), `json` ili `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Vremensko ograničenje jednog HTTP zahteva, podrazumevano `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | PEM fajl sa CA koji je potpisao sertifikat servera. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | Preskače TLS verifikaciju. Svaki poziv ispisuje upozorenje; bolje koristite `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | Nikada ne postavlja pitanja; komanda kojoj bi bio potreban odgovor umesto toga ne uspeva. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | Ispisuje trag HTTP zahteva na stderr. Zaglavlja za autorizaciju i kolačiće su maskirana. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Putanja do konfiguracionog fajla, podrazumevano `~/.semaphore/client.yml`. |

Token iz okruženja se koristi samo kada i URL dolazi iz
okruženja ili iz flega. Tako se sprečava da CI token bude poslat drugom
serveru kada neko pokrene isti posao sa `--context other`.

### Konfiguracioni fajl {#the-configuration-file}

`~/.semaphore/client.yml` sadrži imenovane kontekste. Upisuju ga `auth login` i `context set`;
možete ga uređivati i ručno.

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # ili token_file
    project: 3                # podrazumevani projekat, ID ili naziv
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

Klijent kreira direktorijum sa režimom `0700`, a fajl sa `0600`. Fajl
u koji mogu da pišu grupa ili ostali se odbija, uz savet da pokrenete
`chmod 600`; za fajl koji ostali mogu da čitaju ispisuje se upozorenje.

## Izlaz {#output}

Podaci idu na stdout; poruke, upozorenja i napredak idu na stderr, tako da skripta
može da uhvati jedno bez drugog.

| Fleg | Efekat |
|------|--------|
| `-o json` | Ispravan JSON bez ukrasa. Lista je uvek niz, prazna lista je `[]`. Nazivi polja su isti kao u API-ju. |
| `-o yaml` | Isti podaci u YAML formatu. |
| `--fields id,name,status` | Samo navedene kolone ili polja. Ugnežđena polja se pišu sa tačkom: `--fields id,params.limit`. |
| `-q`, `--quiet` | Samo ID-jevi, po jedan u redu — za `xargs` i petlje. |
| `--no-headers` | Tabela bez reda sa zaglavljem. |
| `--no-color` | Bez boja. Boje su isključene i kada stdout nije terminal ili kada je postavljen `NO_COLOR`. |

Kada stdout nije terminal, kolone tabele su razdvojene tabulatorom i nikada se
ne skraćuju.

Objektima se pristupa po numeričkom ID-ju ili po nazivu. Naziv se traži u
projektu, bez razlikovanja velikih i malih slova; kada više objekata ima isti naziv, komanda završava
sa kodom 5 i navodi kandidate na stderr.

## Izlazni kodovi {#exit-codes}

| Kod | Značenje |
|------|---------|
| `0` | Uspeh. Za komandu koja čeka: zadatak je završen sa `success`. |
| `1` | Greška klijenta ili API-ja — mrežni problem, greška servera, neočekivan odgovor. |
| `2` | Greška u upotrebi: nepoznat fleg, nedostaje argument, projekat nije naveden ili je potrebna potvrda bez terminala (prosledite `--yes`). |
| `3` | Zadatak koji se čeka završen je sa statusom `error`. |
| `4` | Autentifikacija nije uspela (HTTP 401 ili 403). |
| `5` | Objekat nije pronađen ili naziv odgovara većem broju objekata. |
| `6` | Zadatak koji se čeka završen je sa statusom `stopped`. |
| `124` | Isteklo je `--wait-timeout`. Zadatak nastavlja da se izvršava na serveru. |
| `130` | Prekinuto sa Ctrl+C. Klijent prekida vezu; zadatak nastavlja da se izvršava osim ako nije zadat `--stop-on-interrupt`. |

## Pokretanje zadataka iz skripti {#running-tasks-from-scripts}

Podesite CI posao u potpunosti preko okruženja i pustite da izlazni kod
odluči o ishodu:

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Pokreni zadatak, prati njegov log, završi sa 0/3/6 prema konačnom statusu
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Pokreni sada, sačekaj kasnije
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` i `--extra-vars-file` popunjavaju dodatne promenljive zadatka;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` i `--diff` menjaju
ono što šablon dozvoljava da se promeni.

Zadatak može da stane na pola puta i čeka odobrenje: Terraform plan pre primene,
ili bilo koji šablon čija aplikacija prvo pita. U terminalu klijent ispisuje
`Apply task <id>? [yes/no]` i šalje odgovor serveru. Bez terminala prijavljuje
zastoj na stderr i nastavlja da čeka, pa je CI poslu potreban
`task confirm <id>` ili `task reject <id>` sa druge strane, `--auto-approve`
kada šablon to dozvoljava, ili `--wait-timeout` da odustane. Za cevovod koji ne
sme da stane ni pred jednom kapijom, `--auto-reject` odbija takav zadatak čim
pita. Odbijen zadatak završava kao `error`, što znači izlazni kod 3.

Kombinujte `-o json` sa `jq` za sve što tabela ne prikazuje:

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Tajne i tokeni {#secrets-and-tokens}

- Token se nikada ne ispisuje, osim komandom `auth token`, koja postoji da bi ga predala
  drugom alatu i upozorava kada je stdout terminal.
- Lozinke i materijal ključeva čitaju se samo iz fajlova ili sa stdin-a:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. Tajne okruženja se prosleđuju preko
  `environment create --secrets-file`.
- `environment get` i `key get` prikazuju nazive tajni, nikada vrednosti,
  u svim formatima izlaza.
- `auth logout --revoke` briše token i na serveru i lokalno.
- Destruktivne komande traže potvrdu u terminalu, a bez njega zahtevaju `--yes`;
  `project delete` zahteva naziv projekta uz `--confirm`.
