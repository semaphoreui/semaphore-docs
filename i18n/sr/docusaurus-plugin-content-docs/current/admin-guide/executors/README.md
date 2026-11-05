---
title: Executori
description: Kako runner izvršava zadatke pomoću lokalnog, Docker ili Kubernetes executora, šta se pokreće unutar kontejnera i šta kontejnerski executori ne podržavaju.
---

# Executori

Executor određuje **gde runner pokreće proces zadatka**. Runner i dalje proverava
server, prima zadatak i šalje log nazad; menja se samo mesto na kome se pokreće
Ansible, Terraform ili shell proces.

| Executor | `runner.executor.type` | Gde se zadatak izvršava | Izdanje |
|---|---|---|---|
| Lokalni | `local` (podrazumevano) | Podređeni proces na hostu runnera, sa datotekama, alatima i `PATH` runnera. | Community |
| Docker | `docker` | Novi kontejner na Docker daemonu, uklanja se posle zadatka. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Novi Pod u Kubernetes namespace-u, briše se posle zadatka. | <FeatureState feature="k8s-executor" /> |

Executor je podešavanje **runnera**, a ne servera ili šablona. Sam Semaphore server
uvek izvršava zadatke lokalno; da biste izvršavali zadatke u kontejnerima, pokrenite
[runner](/admin-guide/runners) i usmerite šablone na njega pomoću oznake runnera.

## Izbor executora {#choose-an-executor}

| Potrebno vam je | Koristite |
|---|---|
| Alati instalirani na jednoj mašini, pristup njenim datotekama, izlazi workflow-a | Lokalni |
| Čisto okruženje za svaki zadatak, različiti alati po šablonu, na jednom ili nekoliko hostova | [Docker](./docker) |
| Zadaci raspoređeni po klasteru, Kubernetes RBAC i Secrets, bez Docker socketa | [Kubernetes](./kubernetes) |

## Podešavanje executora {#set-the-executor}

Dodajte blok `executor` u sekciju `runner` konfiguracione datoteke runnera:

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

Ili postavite promenljivu okruženja:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

Svaka opcija ima promenljivu okruženja; kompletne liste su na stranicama
[Docker](./docker#configuration-reference) i [Kubernetes](./kubernetes#configuration-reference).
Restartujte runner posle promene executora.

:::info
Kontejnerski executori su deo Pro verzije runnera. Koristite image
`semaphoreui/runner` ili zvanični binarni fajl `semaphore`. Image
`semaphoreui/runner-community` je izgrađen bez njih i pri pokretanju beleži
`docker executor is only available in the proprietary build`.
:::

## Kako se izvršava kontejnerski zadatak {#how-a-container-task-runs}

Oba kontejnerska executora izvršavaju zadatak na isti način:

1. **Priprema.** Runner kreira zajednički radni prostor i postavlja tajne zadatka
   (SSH ključeve, vault lozinke, dodatne promenljive, statički inventar) tamo gde ih
   kontejneri mogu pročitati.
2. **Kloniranje.** Kratkotrajni *pomoćni* (helper) kontejner klonira repozitorijum u
   `/workspace/repo` (`git clone --depth 1` grane zadatka).
3. **Izvršavanje.** *Build* kontejner se pokreće u `/workspace/repo` i pokreće aplikaciju:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` ili binarni fajl prilagođene aplikacije. Njegov izlazni kod je rezultat zadatka.
4. **Log.** Izlaz oba kontejnera se prenosi u log zadatka dok rade.
5. **Čišćenje.** Kontejneri, volumeni, Secrets i ConfigMaps zadatka se uklanjaju,
   bez obzira na to da li je zadatak uspeo, nije uspeo ili je zaustavljen.

| Korak | Docker | Kubernetes |
|---|---|---|
| Radni prostor | Imenovani volumen `semaphore-workspace-<task>-<random>` | `emptyDir` volumen Poda |
| Tajne | Imenovani volumen `semaphore-secrets-<task>-<random>`, montiran samo za čitanje | Jedan Secret ili ConfigMap po vrsti, montiran samo za čitanje |
| Kloniranje | Kontejner `semaphore-job-<task>-<random>-clone` | Init kontejner `git-clone` |
| Izvršavanje | Kontejner `semaphore-job-<task>-<random>-build` | Kontejner `build` Poda `semaphore-job-<task>-<random>` |
| Dugme Stop | `docker stop` sa `cleanup_grace_seconds`, zatim uklanjanje | Pod se briše sa `cleanup_grace_seconds` |

Zadatak zaustavljen iz korisničkog interfejsa završava se statusom **Stopped**, kao i kod lokalnog executora.

## Unutar build kontejnera {#inside-the-build-container}

| Putanja | Sadržaj |
|---|---|
| `/workspace` | Radni prostor u koji se može pisati; ujedno i `HOME` zadatka. |
| `/workspace/repo` | Klonirani repozitorijum; radni direktorijum. |
| `/secrets/ssh/<key id>/id_rsa` | Privatni SSH ključ repozitorijuma ili inventara. Učitava se u `ssh-agent` pre pokretanja aplikacije. |
| `/secrets/vault/<name>` | Ansible vault lozinka, prosleđuje se kao `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Dodatne promenljive iz Variable Group plus `semaphore_vars`, prosleđuju se kao `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` ili `inventory.yml` | Statički inventar sačuvan u Semaphore-u. Inventari tipa File se čitaju iz repozitorijuma. |

Kontejner dobija fiksan skup promenljivih okruženja, navedenih u
[Promenljive okruženja zadatka](/reference/task-environment#container-executors).
Sopstveni `env_vars`, `forwarded_env_vars`, `PATH` i putanje `apps.*` runnera se **ne**
prosleđuju u kontejner.

## Image-i {#images}

U svakom zadatku učestvuju dva image-a:

| Image | Podrazumevano | Koristi se za | Potrebno |
|---|---|---|---|
| Build image | `semaphoreui/job:latest` | Pokretanje aplikacije. | `sh`, binarni fajl aplikacije u `PATH`; za SSH ključeve `ssh-agent`, `ssh-add`, `setsid`. |
| Helper image | `semaphoreui/helper:latest` | Kloniranje repozitorijuma (Docker ga koristi i za popunjavanje volumena tajni). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` je Debian sa Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu i Terragrunt. Pokreće se kao korisnik `nobody`, grupa `0`.

Build image se podešava po runneru (`image`) i može se zameniti po šablonu poljem
**Executor image**, pogledajte
[Executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
Helper image se podešava samo po runneru.

### Izgradnja prilagođenog image-a {#build-a-custom-image}

Proširite `semaphoreui/job` kada su vašim zadacima potrebne dodatne Ansible kolekcije,
Python paketi ili alati. Kontejnerski executori **ne** instaliraju `requirements.yml` iz
repozitorijuma, pa kolekcije i role ugradite u image:

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

Ako image gradite od nule, zadržite ova svojstva `semaphoreui/job`:

- `/workspace` postoji i u njega može da piše korisnik pod kojim se kontejner pokreće.
- U `/etc/passwd` grupa može da piše (`chmod g=u /etc/passwd`). Kontejner pokrenut sa
  nasumičnim UID-om (OpenShift) tada dobija unos u passwd, koji su potrebni OpenSSH-u i Git-u.
- Image-u nije potreban poseban entrypoint: executor pokreće svoju skriptu pomoću `sh -c`.

## Ograničenja {#limitations}

U poređenju sa lokalnim executorom, kontejnerski executori trenutno:

| Nije podržano | Šta uraditi umesto toga |
|---|---|
| Kredencijali inventara tipa **Login with password** (SSH lozinka ili become lozinka) | Koristite SSH ključ. Zadatak sa takvim ključem ne uspeva sa `inventory login_password authentication is not supported`. |
| Terraform zadaci koji čekaju ručnu potvrdu | Uključite **Auto approve** u šablonu ili pokrećite samo plan zadatke. U suprotnom zadatak ne uspeva sa `terraform manual approval is not supported`. |
| Repozitorijumi tipa **Local** | Radni prostor ostaje prazan; koristite Git repozitorijum. |
| Instaliranje `requirements.yml` (Galaxy role i kolekcije) | [Ugradite ih u image](#build-a-custom-image). |
| Izlazi workflow-a (`SEMAPHORE_OUTPUTS_FILE`) | Koristite lokalni executor za zadatke čije izlaze čita workflow. |
| Kredencijali po hostu iz konfiguracije hosta | Koristite lokalni executor. |
| Git istorija pre poslednjeg commita | Klon je plitak (`--depth 1`). |

SSH ključevi hostova se ne proveravaju: kloniranje prihvata nov ključ hosta, a Ansible
se pokreće sa `ANSIBLE_HOST_KEY_CHECKING=False`.

## Povezane stranice {#related-pages}

- [Docker executor](./docker): podešavanje, konfiguracija, bezbednost, rešavanje problema.
- [Kubernetes executor](./kubernetes): RBAC, raspoređivanje runnera, konfiguracija, rešavanje problema.
- [Runneri](/admin-guide/runners): registracija i pokretanje runnera.
- [Opcije konfiguracije](/reference/configuration): sve opcije `runner.executor.*`.
