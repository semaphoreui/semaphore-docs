# CLI

Binarni fajl `semaphore` je istovremeno i server i kompletan administratorski alat. Pokrenite ga
bez argumenata (ili `semaphore help`) da biste izlistali sve komande:

```bash
semaphore help
```

Potpun, generisan spisak svih komanda i opcija nalazi se u
[referenci komanda](/reference/cli/commands). Većina administratorskih poslova ima
posebnu grupu komandi:

| Grupa komandi | Namena |
|---------------|--------|
| [`semaphore users`](/reference/cli/users) | Dodavanje, izmena, uklanjanje i pregled korisnika; upravljanje API tokenima i TOTP-om (2FA). |
| [`semaphore projects`](/reference/cli/projects) | Izvoz i uvoz projekata (Project) u vidu rezervnih kopija. |
| [`semaphore vaults`](/reference/cli/vaults) | Ponovno šifrovanje sačuvanih tajni i pregled upotrebe ključeva za šifrovanje. |
| [`semaphore runner`](/reference/cli/runners) | Rad u runner režimu i registracija/odjava runnera (Runner). |
| [`semaphore migrate`](/reference/cli/migrations) | Primena ili vraćanje migracija baze podataka. |

Nekoliko grupa komandi ima kraće alijase: `users`/`user`, `projects`/`project`,
`vaults`/`vault` i `server`/`service`.

:::info
Svaka komanda koja pristupa bazi podataka (`users`, `projects`, `vaults`, `migrate`,
`server`) pre pokretanja primenjuje sve neprimenjene migracije šeme. Napravite rezervnu
kopiju baze podataka pre nego što pokrenete CLI novije verzije Semaphore-a nad postojećom
bazom.
:::

## Globalne opcije {#global-options}

Ove zastavice prihvata svaka komanda:

| Opcija | Opis |
|--------|------|
| `--config <path>` | Putanja do konfiguracionog fajla. |
| `--no-config` | Ne čitaj nijedan konfiguracioni fajl — koristi samo promenljive okruženja. |
| `--log-level <level>` | Nivo detaljnosti logova: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` ili `PANIC`. Ako nije zadat, koristi se promenljiva okruženja `SEMAPHORE_LOG_LEVEL`. |
| `--debug-filter <spec>` | Sužava `DEBUG` izlaz na određene prostore imena, npr. `'runner,task_*'` ili `'*,-db'`. Ima efekta samo kada je nivo logovanja `DEBUG`. Ako nije zadat, koristi se `SEMAPHORE_DEBUG_FILTER`. |

### Kako se pronalazi konfiguracioni fajl {#how-the-configuration-file-is-found}

Kada je `--config` izostavljen, Semaphore traži fajl ovim redosledom i koristi
prvi koji postoji:

1. Putanja iz promenljive okruženja `SEMAPHORE_CONFIG_PATH`.
2. `config.json`, `config.yaml` ili `config.yml` u tekućem direktorijumu.
3. `/usr/local/etc/semaphore/config.json` (ili `.yaml` / `.yml`).
4. `/etc/semaphore/config.json` (ili `.yaml` / `.yml`).

Promenljive okruženja se primenjuju preko fajla, tako da imaju prednost nad vrednostima
iz fajla. Sa `--no-config` koriste se samo promenljive okruženja i podrazumevane vrednosti. Pogledajte
[Konfiguraciju](/admin-guide/configuration) za kompletan spisak opcija.

## Verzija {#version}

Ispisuje trenutnu verziju.

```bash
semaphore version
```

## Interaktivno podešavanje {#interactive-setup}

Koristite ovo za prvo podešavanje. Generiše tajne, vodi vas kroz
interaktivni upitnik, zapisuje konfiguracioni fajl, pokreće migracije
baze podataka i kreira prvog administratora.

```bash
semaphore setup
```

Prosledite `--config <path>` da biste izabrali gde će konfiguracioni fajl biti zapisan.
Bez toga, podešavanje pita za izlazni direktorijum (podrazumevano: tekući
direktorijum) i tamo zapisuje `config.json`.

Ako korisničko ime ili e-adresa koju unesete već postoji, podešavanje zadržava postojećeg
korisnika umesto da kreira novog.

Po završetku ispisuje komande za pokretanje servera, na primer:

```bash
./semaphore server --config /path/to/config.json
```

## Serverski režim {#server-mode}

Pokreće Semaphore server (veb interfejs i API). `service` je alijas za `server`.

```bash
semaphore server --config /path/to/config.json
```

Server pri pokretanju primenjuje neprimenjene migracije baze podataka i ispisuje
bazu podataka, privremenu putanju, interfejs i port koje koristi.

## Runner režim {#runner-mode}

Pokreće Semaphore kao izvršioca zadataka (Task). Pogledajte [Runneri](/reference/cli/runners) za
kompletan skup potkomandi (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/runner-config.json
```

## Migracija baze podataka {#database-migration}

Ažurira šemu baze podataka na najnovije stanje. Pogledajte
[Migracije baze podataka](/reference/cli/migrations) za primenu ili vraćanje
na određenu verziju.

```bash
semaphore migrate --config /path/to/config.json
```
