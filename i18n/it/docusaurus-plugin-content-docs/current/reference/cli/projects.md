# Progetti

Il comando `semaphore projects` esporta e importa progetti come file di backup. Un
backup è un singolo documento JSON che contiene i template, gli inventory, i repository,
gli environment, le chiavi, le pianificazioni e le impostazioni correlate di un progetto.

```bash
semaphore projects --help
```

> `project` è un alias di `projects`.

Ha due sottocomandi:

| Comando | Scopo |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | Scrive il backup di un progetto su file (o su stdout). |
| [`projects import`](#importing-projects-projects-import) | Ripristina uno o più progetti da file di backup. |

## Esportare un progetto (`projects export`) {#exporting-a-project-projects-export}

Esporta un singolo progetto, identificato dal suo ID numerico oppure dal nome.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| Flag | Descrizione |
|------|-------------|
| `--project-id <id>` | ID del progetto da esportare. |
| `--project-name <name>` | Nome del progetto da esportare (corrispondenza senza distinzione tra maiuscole e minuscole). |
| `--file <path>` | Scrive il backup in questo file. Se omesso, il backup viene stampato su stdout. |

È richiesto esattamente uno tra `--project-id` e `--project-name`: fornirli entrambi,
o nessuno dei due, genera un errore.

## Importare progetti (`projects import`) {#importing-projects-projects-import}

Importa uno o più backup di progetti. È possibile importare un singolo file oppure tutti i
backup trovati in una directory. Ogni progetto importato viene creato come **nuovo**
progetto di proprietà di un amministratore esistente (il primo amministratore nel database, o il
primo utente se non esiste alcun amministratore), quindi l'importazione non sovrascrive mai un
progetto esistente.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| Flag | Descrizione |
|------|-------------|
| `--file <path>` | Percorso di un singolo file di backup da importare. |
| `--dir <path>` | Directory in cui cercare i file di backup. Vengono importati, in ordine alfabetico, i file che terminano con `.json`, `.backup` o `.bk`. |
| `--project-name <name>` | Sovrascrive il nome del progetto importato. Valido solo con `--file`. |

È richiesto esattamente uno tra `--file` e `--dir`: fornirli entrambi, o nessuno dei due,
genera un errore. `--project-name` può essere combinato solo con `--file`.

Quando si importa una directory, i file la cui importazione fallisce vengono segnalati e saltati;
il comando prosegue con i restanti ed esce con uno stato diverso da zero solo se
non è stato importato nulla.
