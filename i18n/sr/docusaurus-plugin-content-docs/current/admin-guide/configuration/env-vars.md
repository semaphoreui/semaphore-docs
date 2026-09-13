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
