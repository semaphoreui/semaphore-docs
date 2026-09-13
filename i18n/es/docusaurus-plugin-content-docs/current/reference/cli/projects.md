# Proyectos

El comando `semaphore projects` exporta e importa proyectos como archivos de copia de seguridad. Una
copia de seguridad es un único documento JSON que contiene las plantillas, inventarios,
repositorios, entornos, claves, programaciones y ajustes relacionados de un proyecto.

```bash
semaphore projects --help
```

> `project` es un alias de `projects`.

Tiene dos subcomandos:

| Comando | Propósito |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | Escribe la copia de seguridad de un proyecto en un archivo (o en stdout). |
| [`projects import`](#importing-projects-projects-import) | Restaura uno o varios proyectos desde archivos de copia de seguridad. |

## Exportar un proyecto (`projects export`) {#exporting-a-project-projects-export}

Exporta un único proyecto, identificado por su ID numérico o por su nombre.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| Opción | Descripción |
|------|-------------|
| `--project-id <id>` | ID del proyecto que se va a exportar. |
| `--project-name <name>` | Nombre del proyecto que se va a exportar (coincidencia sin distinguir mayúsculas y minúsculas). |
| `--file <path>` | Escribe la copia de seguridad en este archivo. Si se omite, la copia de seguridad se imprime en stdout. |

Se requiere exactamente una de las opciones `--project-id` o `--project-name`; indicar ambas,
o ninguna, es un error.

## Importar proyectos (`projects import`) {#importing-projects-projects-import}

Importa una o varias copias de seguridad de proyectos. Puede importar un único archivo o todas las
copias de seguridad encontradas en un directorio. Cada proyecto importado se crea como un proyecto
**nuevo** cuyo propietario es un administrador existente (el primer administrador de la base de datos, o el
primer usuario si no existe ningún administrador), por lo que la importación nunca sobrescribe un
proyecto existente.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| Opción | Descripción |
|------|-------------|
| `--file <path>` | Ruta a un único archivo de copia de seguridad que se va a importar. |
| `--dir <path>` | Directorio en el que buscar archivos de copia de seguridad. Se importan los archivos que terminan en `.json`, `.backup` o `.bk`, en orden alfabético. |
| `--project-name <name>` | Sobrescribe el nombre del proyecto importado. Solo es válido con `--file`. |

Se requiere exactamente una de las opciones `--file` o `--dir`; indicar ambas, o ninguna, es
un error. `--project-name` solo puede combinarse con `--file`.

Al importar un directorio, los archivos que no se pueden importar se notifican y se omiten;
el comando continúa con el resto y termina con un estado distinto de cero solo si
no se importó nada.
