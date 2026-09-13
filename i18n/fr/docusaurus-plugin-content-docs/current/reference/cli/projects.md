# Projets

La commande `semaphore projects` exporte et importe des projets sous forme de fichiers de
sauvegarde. Une sauvegarde est un document JSON unique contenant les modèles, inventaires,
dépôts, environnements, clés, planifications et paramètres associés d'un projet.

```bash
semaphore projects --help
```

> `project` est un alias de `projects`.

Elle possède deux sous-commandes :

| Commande | Rôle |
|----------|------|
| [`projects export`](#exporting-a-project-projects-export) | Écrire la sauvegarde d'un projet dans un fichier (ou sur stdout). |
| [`projects import`](#importing-projects-projects-import) | Restaurer un ou plusieurs projets à partir de fichiers de sauvegarde. |

## Exporter un projet (`projects export`) {#exporting-a-project-projects-export}

Exporte un seul projet, identifié par son ID numérique ou par son nom.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| Option | Description |
|--------|-------------|
| `--project-id <id>` | ID du projet à exporter. |
| `--project-name <name>` | Nom du projet à exporter (correspondance insensible à la casse). |
| `--file <path>` | Écrire la sauvegarde dans ce fichier. Si omis, la sauvegarde est affichée sur stdout. |

Exactement une des options `--project-id` ou `--project-name` est requise — en fournir les
deux, ou aucune, est une erreur.

## Importer des projets (`projects import`) {#importing-projects-projects-import}

Importe une ou plusieurs sauvegardes de projets. Vous pouvez importer un seul fichier ou toutes
les sauvegardes trouvées dans un répertoire. Chaque projet importé est créé en tant que
**nouveau** projet appartenant à un administrateur existant (le premier administrateur de la
base de données, ou le premier utilisateur s'il n'y a pas d'administrateur) ; l'import n'écrase
donc jamais un projet existant.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| Option | Description |
|--------|-------------|
| `--file <path>` | Chemin d'un fichier de sauvegarde unique à importer. |
| `--dir <path>` | Répertoire à parcourir pour trouver des fichiers de sauvegarde. Les fichiers se terminant par `.json`, `.backup` ou `.bk` sont importés, dans l'ordre trié. |
| `--project-name <name>` | Remplace le nom du projet importé. Valide uniquement avec `--file`. |

Exactement une des options `--file` ou `--dir` est requise — en fournir les deux, ou aucune,
est une erreur. `--project-name` ne peut être combiné qu'avec `--file`.

Lors de l'import d'un répertoire, les fichiers dont l'import échoue sont signalés et ignorés ;
la commande poursuit avec les autres et se termine avec un statut différent de zéro uniquement
si rien n'a été importé.
