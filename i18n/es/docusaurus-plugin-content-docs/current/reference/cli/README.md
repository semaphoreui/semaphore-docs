# CLI

El binario `semaphore` es a la vez el servidor y una herramienta de administración completa. Ejecútelo
sin argumentos (o con `semaphore help`) para listar todos los comandos:

```bash
semaphore help
```

Para la lista exhaustiva y generada de todos los comandos y opciones, consulte la
[referencia de comandos](/reference/cli/commands). La mayoría de las tareas
administrativas tienen un grupo de comandos dedicado:

| Grupo de comandos | Propósito |
|---------------|---------|
| [`semaphore users`](/reference/cli/users) | Añadir, modificar, eliminar e inspeccionar usuarios; gestionar tokens de API y TOTP (2FA). |
| [`semaphore projects`](/reference/cli/projects) | Exportar e importar proyectos (copias de seguridad). |
| [`semaphore vaults`](/reference/cli/vaults) | Volver a cifrar los secretos almacenados e inspeccionar el uso de las claves de cifrado. |
| [`semaphore runner`](/reference/cli/runners) | Ejecutar en modo runner y registrar/desregistrar runners. |
| [`semaphore migrate`](/reference/cli/migrations) | Aplicar o revertir migraciones de la base de datos. |

Varios grupos de comandos tienen alias más cortos: `users`/`user`, `projects`/`project`,
`vaults`/`vault` y `server`/`service`.

:::info
Todo comando que accede a la base de datos (`users`, `projects`, `vaults`, `migrate`,
`server`) aplica las migraciones de esquema pendientes antes de ejecutarse. Haga una copia
de seguridad de la base de datos antes de ejecutar la CLI de una versión más reciente de
Semaphore contra una base de datos existente.
:::

## Opciones globales {#global-options}

Estas opciones son aceptadas por todos los comandos:

| Opción | Descripción |
|--------|-------------|
| `--config <path>` | Ruta al archivo de configuración. |
| `--no-config` | No leer ningún archivo de configuración; usar únicamente variables de entorno. |
| `--log-level <level>` | Nivel de detalle del registro: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` o `PANIC`. Si no se indica, se usa la variable de entorno `SEMAPHORE_LOG_LEVEL`. |
| `--debug-filter <spec>` | Restringe la salida `DEBUG` a espacios de nombres concretos, p. ej. `'runner,task_*'` o `'*,-db'`. Solo tiene efecto cuando el nivel de registro es `DEBUG`. Si no se indica, se usa `SEMAPHORE_DEBUG_FILTER`. |

### Cómo se localiza el archivo de configuración {#how-the-configuration-file-is-found}

Cuando se omite `--config`, Semaphore busca el archivo en este orden y usa
el primero que exista:

1. La ruta indicada en la variable de entorno `SEMAPHORE_CONFIG_PATH`.
2. `config.json`, `config.yaml` o `config.yml` en el directorio actual.
3. `/usr/local/etc/semaphore/config.json` (o `.yaml` / `.yml`).
4. `/etc/semaphore/config.json` (o `.yaml` / `.yml`).

Las variables de entorno se aplican sobre el archivo, por lo que sobrescriben los
valores del archivo. Con `--no-config`, solo se usan las variables de entorno y los valores predeterminados. Consulte
[Configuración](/admin-guide/configuration) para ver la lista completa de opciones.

## Versión {#version}

Muestra la versión actual.

```bash
semaphore version
```

## Configuración interactiva {#interactive-setup}

Use esta opción para la configuración inicial. Genera los secretos, recorre un
cuestionario interactivo, escribe el archivo de configuración, ejecuta las migraciones
de la base de datos y crea el primer usuario administrador.

```bash
semaphore setup
```

Pase `--config <path>` para elegir dónde se escribe el archivo de configuración.
Sin esta opción, el asistente pregunta por un directorio de salida (predeterminado: el
directorio actual) y escribe `config.json` allí.

Si el nombre de usuario o el correo electrónico que introduce ya existen, el asistente conserva el
usuario existente en lugar de crear uno nuevo.

Al finalizar, muestra los comandos para iniciar el servidor, por ejemplo:

```bash
./semaphore server --config /path/to/config.json
```

## Modo servidor {#server-mode}

Inicia el servidor de Semaphore (interfaz web y API). `service` es un alias de `server`.

```bash
semaphore server --config /path/to/config.json
```

El servidor aplica las migraciones pendientes de la base de datos al arrancar y muestra la
base de datos, la ruta temporal, la interfaz y el puerto que está usando.

## Modo runner {#runner-mode}

Ejecuta Semaphore como runner de tareas. Consulte [Runners](/reference/cli/runners) para ver el
conjunto completo de subcomandos (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/runner-config.json
```

## Migración de la base de datos {#database-migration}

Actualiza el esquema de la base de datos. Consulte
[Migraciones de la base de datos](/reference/cli/migrations) para aplicar o revertir
hasta una versión concreta.

```bash
semaphore migrate --config /path/to/config.json
```
