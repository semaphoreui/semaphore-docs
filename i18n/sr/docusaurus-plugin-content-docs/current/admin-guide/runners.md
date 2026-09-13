# Runneri

Runneri (Runner) omogućavaju izvršavanje zadataka (Task) na serveru odvojenom od Semaphore UI.

Semaphore runneri rade po istom principu kao GitLab ili GitHub Actions runneri:

- Pokrećete runner na zasebnom serveru, navodeći adresu Semaphore servera i token za autentifikaciju.
- Runner se povezuje na Semaphore i signalizira da je spreman da prihvata zadatke.
- Kada se pojavi novi zadatak, Semaphore prosleđuje runneru sve potrebne informacije, a runner zatim klonira repozitorijum (Repository) i pokreće Ansible, Terraform, PowerShell itd.
- Runner šalje rezultate izvršavanja zadatka nazad u Semaphore.

Za krajnje korisnike rad sa Semaphore-om izgleda isto sa runnerima ili bez njih.

Kada nijedan runner nije definisan, sam Semaphore UI server se ponaša kao runner. Svi zadaci se izvršavaju u kontekstu Semaphore UI servera i imaju pristup njegovom sistemu datoteka.

Korišćenje runnera donosi sledeće prednosti:
- Bezbednije izvršavanje zadataka. Na primer, runner se može nalaziti u zatvorenoj podmreži ili izolovanom Docker kontejneru.
- Raspodela opterećenja na više servera. Možete pokrenuti više runnera, a zadaci će se nasumično raspoređivati među njima.

## Podešavanje {#set-up}

### Podešavanje servera {#set-up-a-server}

Da biste podesili server za rad sa runnerima, dodajte sledeću opciju u konfiguraciju Semaphore servera:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

ili pomoću promenljivih okruženja:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Podešavanje runnera {#setup-a-runner}

Da biste podesili runner, koristite sledeću komandu:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

Ova komanda će kreirati konfiguracionu datoteku na putanji `/path/to/your/config/file.json`.

Pre nego što upotrebite ovu komandu, potrebno je da razumete kako se runneri registruju na serveru.

### Registracija runnera na serveru {#registering-the-runner-on-the-server}

Postoje dva načina da registrujete runner na Semaphore serveru:
1) Dodajte ga preko veb interfejsa ili API-ja.
2) Koristite komandnu liniju sa komandom `semaphore runner register`.

#### Dodavanje runnera preko veb interfejsa {#adding-the-runner-via-the-web-ui}

![Slika runnera](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Registracija preko CLI-ja {#registering-via-cli}

Da biste registrovali runner na ovaj način, potrebno je da dodate opciju `runner_registration_token` u konfiguracionu datoteku Semaphore servera. Ova opcija treba da bude postavljena na proizvoljan niz znakova. Izaberite dovoljno složen niz kako biste izbegli bezbednosne probleme.

Kada vas komanda `semaphore runner setup` upita da li imate token runnera (Runner token), odgovorite No. Zatim upotrebite sledeću komandu da registrujete runner:

`semaphore runner register --config /path/to/your/config/file.json`

ili

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Konfiguraciona datoteka {#configuration-file}

Kao rezultat izvršavanja komande `semaphore runner setup` biće kreirana konfiguraciona datoteka nalik sledećoj:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

Ovu datoteku možete ručno menjati bez potrebe da ponovo pozivate `semaphore runner setup`.

Da biste ponovo registrovali runner, možete koristiti komandu `semaphore runner register`. Ona će prepisati token u datoteci navedenoj u konfiguraciji.

## Pokretanje runnera {#running-the-runner}

Sada možete pokrenuti runner komandom:

```
semaphore runner start --config /path/to/your/config/file.json
```

Vaš runner je spreman da izvršava zadatke.

### Pokretanje runnera u Dockeru {#running-the-runner-in-docker}

Image `semaphoreui/runner` pokreće runner automatski. Prosledite URL servera i registracioni token kroz promenljive okruženja:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Ako su vašim playbook-ovima potrebni dodatni Python paketi, montirajte datoteku `requirements.txt` na putanju `/etc/semaphore/requirements.txt`. Kontejner je instalira pomoću `pip3` pri svakom pokretanju, pre nego što se runner poveže na server:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

Pogledajte [Instaliranje dodatnih Python zavisnosti](/admin-guide/installation/docker#installing-additional-python-dependencies) za detalje o tome gde se paketi instaliraju i kako se obrađuju greške.

### Interval provere (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Svaki runner u fiksnom intervalu proverava Semaphore server radi novih poslova i
prijavljuje napredak zadataka. Podesite ga u konfiguracionoj datoteci runnera:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

Ili pomoću promenljive okruženja:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Vrednost | Efekat |
|-------|--------|
| **1** (podrazumevano) | Poslovi se preuzimaju u roku od otprilike jedne sekunde; najbolje za pokretanja sa malim kašnjenjem. |
| **Veća** (npr. 5–30) | Smanjuje HTTP saobraćaj kada imate mnogo runnera prema jednom serveru. Poslovi mogu početi nešto kasnije. |

Stranica Runneri (Runners) u Semaphore UI prikazuje ovu opciju pod **Napredne opcije** (Advanced options) prilikom
generisanja isečaka za podešavanje (primeri za konfiguracionu datoteku, Docker i promenljive okruženja).

Nevažeće ili nulte vrednosti vraćaju se na podrazumevanu vrednost od 1 sekunde.

### Oznake runnera (Pro) {#runner-tags-pro}

Runneru projekta (Project) možete dodeliti jednu ili više oznaka. Šabloni zadataka (Task Template) zatim mogu zahtevati oznaku, tako da se zadaci izvršavaju samo na runnerima koji joj odgovaraju. Oznake podešavate prilikom dodavanja runnera u korisničkom interfejsu projekta, a zahtevanu oznaku postavljate u podešavanjima šablona.

## Uklanjanje registracije runnera {#runner-deregistration}

Runner možete ukloniti preko veb interfejsa.

![Slika runnera](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

Ili poništite registraciju runnera preko CLI-ja:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Bezbednost {#security}

Runneri se autentifikuju na serveru pomoću neprozirnog bearer tokena
(`X-Runner-Token`) koji se izdaje pri registraciji. Štitite ovaj token kao i svaki drugi
kredencijal — čuvajte ga u konfiguracionoj datoteci sa ograničenim pristupom ili u menadžeru tajni.

:::warning
Koristite HTTPS za komunikaciju između servera i runnera, naročito kada
nisu u istoj privatnoj mreži. Za samopotpisane sertifikate ili sertifikate internog CA
podesite `runner.connection.server_ca_cert_file` na runneru.
Ne koristite `runner.connection.skip_tls_verify` u produkciji.
:::
