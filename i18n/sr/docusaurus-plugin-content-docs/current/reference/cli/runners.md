# Runneri

Komanda `semaphore runner` pokreće Semaphore u **režimu runnera** i upravlja
registracijom runnera (Runner) na serveru. Runner izvršava zadatke (Task) na mašini
odvojenoj od Semaphore servera.

```bash
semaphore runner --help
```

:::tip
Kako runneri rade i kako se konfiguriše serverska strana opisano je u vodiču
[Runneri](/admin-guide/runners).
:::

Pokretanje `semaphore runner` bez potkomande samo ispisuje pomoć. Komanda ima
sledeće potkomande:

| Komanda | Namena |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | Interaktivno kreira konfiguracionu datoteku runnera (i registruje ga ako je naveden token). |
| [`runner register`](#registering-a-runner-runner-register) | Registruje runner na serveru pomoću registracionog tokena. |
| [`runner start`](#starting-a-runner-runner-start) | Pokreće režim runnera i počinje da prihvata zadatke. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Uklanja registraciju runnera sa servera. |

Sve potkomande prihvataju globalni fleg `--config <path>` koji ukazuje na
konfiguracionu datoteku runnera (i `--no-config` za rad isključivo iz promenljivih okruženja).

## Interaktivno podešavanje (`runner setup`) {#interactive-setup-runner-setup}

Vodi vas kroz interaktivno podešavanje, upisuje konfiguracionu datoteku runnera i, ako
je registracioni token dostupan (unet tokom upita ili postavljen preko
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`), odmah registruje runner na serveru.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Prosledite `--config <path>` da biste odabrali gde se konfiguraciona datoteka upisuje.
Bez njega podešavanje traži izlazni direktorijum (podrazumevano: tekući
direktorijum) i tamo upisuje `config.runner.json`.

Po završetku ispisuje komande za pokretanje runnera, na primer:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

Generisanu konfiguracionu datoteku kasnije možete ručno izmeniti umesto da
ponovo pokrećete podešavanje.

### Opcije konfiguracije runnera {#runner-configuration-options}

Polja u bloku `runner` konfiguracione datoteke:

| Polje | Promenljiva okruženja | Opis |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Token za autentifikaciju runnera (izdaje se pri registraciji). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Registracioni token. Samo kao promenljiva okruženja; nikada se ne upisuje u datoteku. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Putanja do datoteke koja sadrži registracioni token. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Naziv runnera koji se prikazuje na serveru. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | JSON niz oznaka za usmeravanje runnera po projektima. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL koji server poziva kada se zadatak stavi u red za ovaj runner. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Da li runner prihvata zadatke. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | ID projekta (Project) za runner na nivou projekta. Izostavite za globalni runner. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Interval provere u sekundama. Podrazumevano: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Maksimalan broj istovremenih zadataka. Podrazumevano: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Izlazi nakon obrade jednog posla. Korisno za runnere koji se pokreću na zahtev preko webhook-a. |

Detalje podešavanja potražite u [Runneri](/admin-guide/runners), a
kompletnu listu opcija u [Konfiguracija](/admin-guide/configuration).

## Registrovanje runnera (`runner register`) {#registering-a-runner-runner-register}

Registruje runner na serveru i čuva izdati token runnera u konfiguracionoj
datoteci (prepisujući postojeći token). Server mora imati konfigurisan
`runner_registration_token`; isti taj token prosleđujete ovde.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Fleg | Opis |
|------|-------------|
| `--registration-token-file <path>` | Čita registracioni token iz datoteke. |
| `--stdin-registration-token` | Čita registracioni token sa standardnog ulaza (stdin). |
| `--name <name>` | Naziv pod kojim se runner registruje. |
| `--tags <tags>` | Oznake runnera, razdvojene zarezom ili ponavljanjem flega (npr. `--tags a,b` ili `--tags a --tags b`). |
| `--webhook <url>` | Webhook URL runnera. |
| `--enabled` | Uključuje ili isključuje runner na serveru. Podrazumevano `true`; prosledite `--enabled=false` da registrujete isključen runner. |
| `--project-id <id>` | Registruje runner na nivou projekta za zadati projekat. Ako se izostavi (ili je `0`), runner se registruje kao globalni runner. |

Primenjuju se samo flegovi koje zaista prosledite; `--name`, `--webhook`, `--tags`
i `--enabled` prepisuju odgovarajuće vrednosti iz konfiguracione datoteke
i okruženja samo kada su navedeni u komandnoj liniji.

### Odakle dolazi registracioni token {#where-the-registration-token-comes-from}

Pri registraciji Semaphore uzima registracioni token iz prvog
dostupnog izvora, sledećim redosledom:

1. Fleg `--registration-token-file`.
2. Podešavanje `registration_token_file` u konfiguracionoj datoteci (ili
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. Standardni ulaz, kada je prosleđen `--stdin-registration-token`.
4. Promenljiva okruženja `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`.

Datoteka sa tokenom koja postoji, ali je prazna, predstavlja grešku. Ako nijedan izvor ne
obezbedi token, registracija se pokušava bez njega i server je odbija.

## Pokretanje runnera (`runner start`) {#starting-a-runner-runner-start}

Pokreće runner, povezuje se sa serverom i počinje da prihvata zadatke. Ovo je
komanda kojom registrovani runner držite na mreži.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Fleg | Opis |
|------|-------------|
| `--auto-register` | Registruje runner pre pokretanja ako još nije registrovan (tj. konfiguracija nema token runnera). |
| `--register` | Alijas za `--auto-register`. |

Sa `--auto-register`, ako konfiguracija nema `token`, Semaphore čita
registracioni token iz `registration_token_file` (ili
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) ili iz
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, zatim ponavlja registraciju svakih 5
sekundi dok ne uspe, ponovo učitava konfiguraciju i pokreće se. Ovo je
pogodno za runnere koji se sami registruju pri prvom pokretanju, na primer u
kontejnerima.

`runner start` ne prihvata `--registration-token-file` ni
`--stdin-registration-token`; ti flegovi pripadaju isključivo komandi `runner register`.

## Uklanjanje registracije runnera (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Uklanja registraciju runnera sa servera, koristeći token runnera iz
konfiguracione datoteke.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
