---
title: Docker executor
description: Izvršavajte svaki zadatak runnera u novom Docker kontejneru na lokalnom ili udaljenom daemonu, uz primere konfiguracije, napomene o bezbednosti i rešavanje problema.
sidebar_custom_props:
  edition: pro
---

# Docker executor <FeatureState feature="docker-executor" />

Sa Docker executorom runner pokreće svaki zadatak u novom kontejneru i uklanja ga
kada se zadatak završi. Runner komunicira sa Docker daemonom preko njegovog API-ja:
daemon može biti na istom hostu ili udaljen, preko TLS-a.

Kako se izvršava kontejnerski zadatak, šta se nalazi u kontejneru i šta nije podržano
opisano je u [Executori](./#how-a-container-task-runs). Ova stranica pokriva podešavanje Docker-a.

## Pre nego što počnete {#before-you-begin}

- Semaphore server sa Pro ili Enterprise licencom.
- Runner registrovan na serveru, pogledajte [Runneri](/admin-guide/runners). Koristite
  image `semaphoreui/runner` ili zvanični binarni fajl `semaphore`.
- Docker Engine dostupan sa runnera i dozvola da se koristi: članstvo u grupi
  `docker`, pristup montiranom socketu ili TLS klijentski sertifikati.
- Daemon može da preuzme `semaphoreui/job` i `semaphoreui/helper` (ili vaše image-e).

## Brzi početak {#quick-start}

Dodajte executor u konfiguraciju runnera i restartujte runner:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

Bez drugih opcija runner koristi lokalni socket (`DOCKER_HOST` ako je postavljen,
inače `unix:///var/run/docker.sock`), build image `semaphoreui/job:latest` i
mrežu `bridge`.

Pokrenite bilo koji zadatak usmeren na ovaj runner. Log zadatka počinje sa:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

Dok zadatak radi, možete videti njegove kontejnere:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Primeri {#examples}

### Binarni fajl runnera na Docker hostu {#runner-binary-on-a-docker-host}

Runner radi kao systemd servis na istom hostu kao i Docker. Dajte njegovom korisniku
pristup socketu:

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### Runner u kontejneru sa socketom hosta {#runner-in-a-container-with-the-host-socket}

Kontejner runnera upravlja daemonom hosta preko montiranog socketa; kontejneri zadataka
su na istom nivou kao runner, a ne ugnežđeni u njega. Image runnera se pokreće sa UID
`1001`, pa ga dodajte u grupu koja je vlasnik socketa:

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

Volumen `semaphore-runner-data` čuva token runnera izdat pri registraciji, pa se
runner ne registruje ponovo posle restarta.

Isto sa Docker Compose:

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

Tajne stižu do zadatka preko imenovanog volumena na daemonu, nikada preko sistema
datoteka runnera, pa nije potrebno deliti druge putanje između runnera i hosta.

### Udaljeni Docker daemon preko TLS-a {#remote-docker-daemon-over-tls}

Runner i daemon su na različitim mašinama. Zaštitite port daemona međusobnim TLS-om
(pogledajte [Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
i postavite klijentske datoteke na runner:

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

Kada je `cert_path` postavljen, runner proverava sertifikat daemona pomoću `ca.pem` i
autentifikuje se pomoću `cert.pem` i `key.pem`. Imena datoteka su fiksna.

:::warning
Bez `cert_path` veza `tcp://` je običan HTTP i svako ko dođe do porta upravlja
daemonom. Samo `tls_verify` ne uključuje TLS (⚠️ 2026-11-05: opcija se čita, ali se ne
primenjuje); za udaljeni daemon uvek postavite `cert_path`.
:::

### Mreža za interne servise {#a-network-for-internal-services}

Podrazumevano se kontejneri zadataka priključuju mreži `bridge`. Da bi zadaci mogli da
pristupe servisima po imenu kontejnera ili da biste ih izolovali u posebnu mrežu,
kreirajte mrežu i podesite je:

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` prihvata bilo koji mrežni režim koji Docker razume: ime mreže, `bridge`,
`host` ili `none`. Kontejner za kloniranje se priključuje istoj mreži, pa sa `none`
repozitorijum ne može da se klonira.

### Image-i iz privatnog registra {#images-from-a-private-registry}

Executor preuzima image-e bez kredencijala registra. Za privatni image prijavite se
i preuzmite ga na hostu daemona, i zadržite pull politiku koja ga ne preuzima ponovo:

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

Uz `if-not-present` koristite tag verzije umesto `latest`: tag koji je već na
daemonu se nikada ne osvežava. `never` čini da nedostajući image obori zadatak umesto
pokušaja preuzimanja.

### Ceo blok kao jedna promenljiva {#the-whole-block-as-one-variable}

Za instalacije koje se konfigurišu samo preko okruženja, prosledite blok executora kao
JSON:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Referenca konfiguracije {#configuration-reference}

Sve opcije se nalaze pod `runner.executor.docker` u konfiguraciji runnera.

| Opcija | Promenljiva okruženja | Podrazumevano | Opis |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, zatim socket platforme | Adresa daemona: `unix:///path`, `tcp://host:port` ili `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Direktorijum sa `ca.pem`, `cert.pem` i `key.pem` za međusobni TLS. Postavljanjem se uključuje TLS. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Još se ne primenjuje; koristite `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Build image. **Executor image** šablona ga zamenjuje. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image za kontejner za kloniranje i za popunjavanje volumena tajni. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Mreža kontejnera za kloniranje i build kontejnera. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` ili `never`. Nepoznata vrednost se svodi na `if-not-present`. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | bez ograničenja | CPU po kontejneru, kao `docker run --cpus`. Dozvoljeni su razlomci: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | bez ograničenja | Memorija po kontejneru: bajtovi ili sa `k`, `m`, `g` (`512m`, `2g`). Vrednost koja se ne može parsirati znači bez ograničenja. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Pokreće kontejnere sa `--privileged`. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Koliko sekundi `docker stop` čeka posle **Stop** pre nego što ubije kontejner. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | Ne koristi se: executor čeka da se kontejner završi umesto da ga proverava. |

Ograničenja, mreža i `privileged` važe podjednako za kontejner za kloniranje i build kontejner.

## Zaustavljanje i čišćenje {#stop-and-clean-up}

**Stop** u korisničkom interfejsu šalje `docker stop` pokrenutom kontejneru, čeka do
`cleanup_grace_seconds`, a zatim uklanja kontejnere i oba volumena.

Ako se proces runnera ubije tokom zadatka, njegovi kontejneri i volumeni ostaju na
daemonu; runner ih ne prikuplja pri sledećem pokretanju. Sve što executor kreira
nosi oznaku `com.semaphoreui.runner=semaphore`, a
`com.semaphoreui.task-id` sadrži ID zadatka. Uklonite ostatke kada nijedan zadatak ne
radi na ovom daemonu:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Rešavanje problema {#troubleshooting}

| Poruka | Uzrok i rešenje |
|---|---|
| `docker executor is only available in the proprietary build` (log runnera) | Runner je Community verzija. Koristite `semaphoreui/runner` ili zvanični binarni fajl. |
| `docker executor: daemon not reachable` | Pogrešan `host`, daemon ne radi ili korisnik runnera ne može da otvori socket (`permission denied`). Proverite sa `docker -H <host> info` kao korisnik runnera; dodajte korisnika u grupu socketa. |
| `pull image ...: ... unauthorized` ili `not found` | Image je privatan ili pogrešno napisan. Prvo ga preuzmite na hostu daemona, pogledajte [privatni registar](#images-from-a-private-registry). |
| `git clone exited with status 128` | URL repozitorijuma, grana ili SSH ključ su pogrešni, ili mreža blokira Git host. Izlaz kloniranja iznad te linije prikazuje Git grešku. |
| `interpreter python3 not found in image; set a runner image that provides it` | Build image-u nedostaje binarni fajl aplikacije. Podesite image koji ga ima, na runneru ili u polju **Executor image** šablona. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | Image nema OpenSSH klijent; Ansible ne može da koristi ključ inventara. Instalirajte `openssh-client`. |
| `Permission denied` pod `/workspace` | Prilagođeni image se pokreće kao korisnik koji ne može da piše u `/workspace`. Pogledajte [Izgradnja prilagođenog image-a](./#build-a-custom-image). |
| `build container exited with status N` | Aplikacija nije uspela sa izlaznim kodom `N`; razlog je u logu iznad. |
| `inventory login_password authentication is not supported` | Pogledajte [Ograničenja](./#limitations). |

## Povezane stranice {#related-pages}

- [Executori](/admin-guide/executors): kako se izvršavaju kontejnerski zadaci, image-i, ograničenja.
- [Kubernetes executor](./kubernetes): isti model na klasteru.
- [Runneri](/admin-guide/runners): registracija i pokretanje runnera.
- [Executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): drugi image za jedan šablon.
