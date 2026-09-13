# Projekti

Komanda `semaphore projects` izvozi i uvozi projekte (Project) kao datoteke rezervne kopije.
Rezervna kopija je jedan JSON dokument koji sadrži šablone, inventare, repozitorijume,
okruženja, ključeve, rasporede i povezana podešavanja projekta.

```bash
semaphore projects --help
```

> `project` je alijas za `projects`.

Ima dve potkomande:

| Komanda | Namena |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | Upisuje rezervnu kopiju projekta u datoteku (ili na stdout). |
| [`projects import`](#importing-projects-projects-import) | Vraća jedan ili više projekata iz datoteka rezervne kopije. |

## Izvoz projekta (`projects export`) {#exporting-a-project-projects-export}

Izvozi jedan projekat, identifikovan numeričkim ID-jem ili nazivom.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| Fleg | Opis |
|------|-------------|
| `--project-id <id>` | ID projekta koji se izvozi. |
| `--project-name <name>` | Naziv projekta koji se izvozi (poklapanje bez razlikovanja velikih i malih slova). |
| `--file <path>` | Upisuje rezervnu kopiju u ovu datoteku. Ako se izostavi, rezervna kopija se ispisuje na stdout. |

Obavezan je tačno jedan od flegova `--project-id` ili `--project-name` — navođenje oba,
ili nijednog, je greška.

## Uvoz projekata (`projects import`) {#importing-projects-projects-import}

Uvozi jednu ili više rezervnih kopija projekata. Možete uvesti jednu datoteku ili sve
rezervne kopije pronađene u direktorijumu. Svaki uvezeni projekat se kreira kao **novi**
projekat čiji je vlasnik postojeći administrator (prvi administrator u bazi podataka, ili
prvi korisnik ako administrator ne postoji), tako da uvoz nikada ne prepisuje postojeći
projekat.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| Fleg | Opis |
|------|-------------|
| `--file <path>` | Putanja do jedne datoteke rezervne kopije za uvoz. |
| `--dir <path>` | Direktorijum u kome se traže datoteke rezervne kopije. Uvoze se datoteke sa nastavkom `.json`, `.backup` ili `.bk`, sortiranim redosledom. |
| `--project-name <name>` | Zamenjuje naziv uvezenog projekta. Važi samo uz `--file`. |

Obavezan je tačno jedan od flegova `--file` ili `--dir` — navođenje oba, ili nijednog, je
greška. `--project-name` se može kombinovati samo sa `--file`.

Pri uvozu direktorijuma, datoteke čiji uvoz ne uspe se prijavljuju i preskaču;
komanda nastavlja sa ostalima i završava sa statusom različitim od nule samo ako
ništa nije uvezeno.
