# Promenljive okruženja

Pomoću promenljivih okruženja možete nadjačati bilo koju dostupnu konfiguracionu opciju.

Možete koristiti interaktivni generator promenljivih okruženja (za Docker):
* za [server](https://semaphoreui.com/install/docker/2_12/)
* za [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Okruženje aplikacija (Ansible, Terraform itd.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore može prosleđivati promenljive okruženja procesima aplikacija (App) (Ansible, Terraform/OpenTofu, Python, PowerShell itd.). Postoje dve povezane opcije:

- `env_vars` / `SEMAPHORE_ENV_VARS`: statički parovi ključ-vrednost koji će biti postavljeni za procese aplikacija.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: lista imena promenljivih koje će server proslediti iz sopstvenog procesnog okruženja.

Primer konfiguracionog fajla:

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

Ekvivalent sa promenljivim okruženja:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Napomene:
- Prosleđivanje je eksplicitno: procesi aplikacija nasleđuju samo promenljive navedene u `forwarded_env_vars`.
- Tajne treba obezbediti na siguran način (na primer preko Docker/Kubernetes tajni) i zatim ih proslediti pomoću `forwarded_env_vars`.
- Ista lista važi i za `git` procese koji kloniraju i ažuriraju repozitorijume, pa sve što je `git`-u potrebno iz okruženja hosta takođe mora da se prosledi.

---

## Rad iza korporativnog proksija {#running-behind-a-corporate-proxy}

Semaphore ne prosleđuje sopstveno okruženje procesima koje pokreće. Osim `PATH`, promenljiva stiže do zadatka ili do `git` kloniranja samo ako je navedena u `forwarded_env_vars` ili postavljena u `env_vars`.

To je najvažnije kod instalacije iz paketa (systemd). Proksi promenljive postavljene u unit fajlu važe za sam Semaphore server, ali ne i za `git`:

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

Sa gornjom konfiguracijom i ničim drugim, kloniranje repozitorijuma ne uspeva:

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` nikada nije video `NO_PROXY`, pa je zahtev za interni host poslao preko spoljnog proksija, koji ga je odbio. Prosledite tri promenljive eksplicitno da biste to rešili:

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

Ili, kao promenljivu okruženja:

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

Napomene:
- Prosledite `NO_PROXY` zajedno sa proksi promenljivima. Bez nje se i saobraćaj ka internim Git serverima usmerava kroz proksi.
- Mnogi alati čitaju zapise malim slovima (`http_proxy`, `https_proxy`, `no_proxy`). Na Linuxu i macOS-u imena promenljivih razlikuju velika i mala slova, pa navedite oba zapisa ako ih vaše okruženje postavlja malim slovima.
- Prilagođeni CA paketi rade na isti način. Ako vaš proksi terminira TLS, prosledite `GIT_SSL_CAINFO`, `SSL_CERT_FILE` ili `REQUESTS_CA_BUNDLE` po potrebi, umesto da isključujete proveru sertifikata.
- Kod Docker instalacija ovo obično deluje kao da radi samo od sebe, jer su proksi promenljive postavljene za ceo kontejner. Ipak se preporučuje da ih prosledite eksplicitno, kako bi se ista konfiguracija ponašala identično u oba slučaja.

---

## Konfiguracija izvršioca runnera {#runner-executor-configuration}

Za instalacije runnera (Runner), ceo blok izvršioca (executor) može se postaviti kao jedna JSON promenljiva okruženja umesto pojedinačnih ključeva:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Ovo je ekvivalentno postavljanju `runner.executor.type` i ugnježdenih polja `runner.executor.docker.*` u konfiguracionom fajlu. Pogledajte [Konfiguracione opcije](/admin-guide/configuration) za sva podešavanja izvršioca runnera.

---

## Tajne promenljive okruženja u grupama promenljivih {#secret-environment-variables-in-variable-groups}

Pored globalnih promenljivih okruženja, možete definisati tajne na nivou projekta (Project) u grupama promenljivih (Variable Groups). Tajni ključevi su maskirani u korisničkom interfejsu i logovima. Pogledajte `User Guide → Variable Groups` za upotrebu i integraciju sa alatom Terraform preko promenljivih `TF_VAR_*`.
