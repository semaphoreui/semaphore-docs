# Build i deploy šabloni

Pored običnih šablona tipa **Zadatak** (Task), Semaphore ima dva tipa šablona zadataka (Task Template) koji čine jednostavan pipeline: **Build** kreira verzionisani artefakt, a **Deploy** isporučuje izabranu verziju na servere. Oba tipa se biraju u formi šablona i menjaju ono što korisnik vidi prilikom pokretanja zadatka.

## Build šabloni {#build-templates}

Build šablon proizvodi artefakt: tarball, image kontejnera, paket. Svaki build zadatak dobija automatski uvećanu verziju, počevši od **Početne verzije** (Start Version) šablona (na primer `1.0.0`). Verzija se prikazuje u koloni **Verzija** (Version) u listi šablona i u istoriji zadataka.

<div class="DialogScreenshot">
  ![Dijalog Novi zadatak za build šablon](/assets/task-new-build.webp)
</div>

Koristite verziju u svom playbook-u preko `semaphore_vars.task_details.target_version` da biste imenovali artefakt.

## Deploy šabloni {#deploy-templates}

Deploy šablon je povezan sa build šablonom preko polja **Build šablon** (Build Template). Kada korisnik klikne na **Deploy**, dijalog Novi zadatak (New Task) traži **Build verziju** (Build Version) za isporuku; poslednji uspešan build je unapred izabran.

<div class="DialogScreenshot">
![Dijalog Novi zadatak za deploy šablon](/assets/task-new-deploy.webp)
</div>

Uključite **Automatsko pokretanje** (Autorun) u deploy šablonu da bi se deploy automatski pokretao nakon svakog uspešnog build-a. Verzija za isporuku dostupna je u playbook-u kao `semaphore_vars.task_details.incoming_version`.

## Promenljiva `semaphore_vars` {#the-semaphore_vars-variable}

Semaphore prosleđuje promenljivu `semaphore_vars` svakom Ansible playbook-u koji pokreće. Koristite je da saznate koji tip zadatka je pokrenut, koju verziju treba build-ovati ili isporučiti, ko je pokrenuo zadatak i koja je poruka zadatka.

Primer za `build` zadatke:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

Primer za `deploy` zadatke:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

Za **Bash**, **PowerShell** i **Python** šablone Semaphore obezbeđuje iste vrednosti `task_details` kao promenljive okruženja:

| Polje `task_details` | Promenljiva okruženja | Napomene |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` ili `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | Korisnik koji je pokrenuo zadatak |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | Poruka zadatka |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Prisutna za `build` zadatke |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Prisutna za `deploy` zadatke |

Primer za Bash:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

Primer za PowerShell:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Primer za Python:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## Primer pipeline-a {#example-pipeline}

`build` Ansible uloga:

1. Preuzima izvorni kod aplikacije sa GitHub-a.
2. Kompajlira izvorni kod.
3. Pakuje binarni fajl u `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`.
4. Otprema tarball u S3 bucket.

`deploy` Ansible uloga:

1. Preuzima `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` iz S3 bucket-a na odredišne servere.
2. Raspakuje ga u odredišni direktorijum.
3. Kreira ili ažurira konfiguracione fajlove.
4. Ponovo pokreće servis aplikacije.

Da biste povezali više od dva koraka, dodali odobrenja ili grananje u slučaju neuspeha, koristite [Tokove rada](../workflows) (Workflows).
