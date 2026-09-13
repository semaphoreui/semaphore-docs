# Runners

El comando `semaphore runner` ejecuta Semaphore en **modo runner** y gestiona el
registro de un runner en el servidor. Un runner ejecuta tareas en una máquina
distinta de la del servidor de Semaphore.

```bash
semaphore runner --help
```

:::tip
Para saber cómo funcionan los runners y cómo configurar el lado del servidor, consulte la
guía de [Runners](/admin-guide/runners).
:::

Ejecutar `semaphore runner` sin subcomando solo muestra la ayuda. Tiene los
siguientes subcomandos:

| Comando | Propósito |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | Crea de forma interactiva un archivo de configuración del runner (y lo registra si se proporciona un token). |
| [`runner register`](#registering-a-runner-runner-register) | Registra el runner en el servidor mediante un token de registro. |
| [`runner start`](#starting-a-runner-runner-start) | Se ejecuta en modo runner y empieza a aceptar tareas. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Elimina el registro del runner en el servidor. |

Todos los subcomandos aceptan la opción global `--config <path>` para indicar el archivo de
configuración del runner (y `--no-config` para ejecutarse únicamente con variables de entorno).

## Configuración interactiva (`runner setup`) {#interactive-setup-runner-setup}

Recorre una configuración interactiva, escribe un archivo de configuración del runner y, si
hay un token de registro disponible (introducido durante las preguntas o definido mediante
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`), registra el runner en el servidor
inmediatamente.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Pase `--config <path>` para elegir dónde se escribe el archivo de configuración.
Sin esta opción, el asistente pregunta por un directorio de salida (predeterminado: el
directorio actual) y escribe `config.runner.json` allí.

Al finalizar, muestra los comandos para lanzar el runner, por ejemplo:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

Después puede editar a mano el archivo de configuración generado en lugar de
volver a ejecutar el asistente.

### Opciones de configuración del runner {#runner-configuration-options}

Campos del bloque `runner` del archivo de configuración:

| Campo | Variable de entorno | Descripción |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Token de autenticación del runner (emitido al registrarse). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Token de registro. Solo como variable de entorno; nunca se escribe en el archivo. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Ruta a un archivo que contiene el token de registro. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Nombre del runner mostrado en el servidor. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | Array JSON de etiquetas para el enrutamiento de runners por proyecto. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL a la que llama el servidor cuando se encola una tarea para este runner. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Indica si el runner acepta tareas. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | ID del proyecto para un runner a nivel de proyecto. Omítalo para un runner global. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Intervalo de sondeo en segundos. Predeterminado: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Número máximo de tareas concurrentes. Predeterminado: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Termina tras procesar un único trabajo. Útil para runners iniciados bajo demanda mediante un webhook. |

Consulte [Runners](/admin-guide/runners) para los detalles de configuración y
[Configuración](/admin-guide/configuration) para la lista completa de opciones.

## Registrar un runner (`runner register`) {#registering-a-runner-runner-register}

Registra el runner en el servidor y guarda el token de runner emitido en el
archivo de configuración (sobrescribiendo cualquier token existente). El servidor debe tener
configurado un `runner_registration_token`; ese mismo token es el que se pasa aquí.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Opción | Descripción |
|------|-------------|
| `--registration-token-file <path>` | Lee el token de registro desde un archivo. |
| `--stdin-registration-token` | Lee el token de registro desde stdin. |
| `--name <name>` | Nombre con el que se registra el runner. |
| `--tags <tags>` | Etiquetas del runner, separadas por comas o repitiendo la opción (p. ej. `--tags a,b` o `--tags a --tags b`). |
| `--webhook <url>` | URL del webhook del runner. |
| `--enabled` | Habilita o deshabilita el runner en el servidor. Predeterminado: `true`; pase `--enabled=false` para registrar un runner deshabilitado. |
| `--project-id <id>` | Registra el runner a nivel de proyecto para el proyecto indicado. Si se omite (o es `0`), el runner se registra como runner global. |

Solo se aplican las opciones que realmente pase; `--name`, `--webhook`, `--tags`
y `--enabled` sobrescriben los valores correspondientes del archivo de configuración
y del entorno únicamente cuando se indican en la línea de comandos.

### De dónde procede el token de registro {#where-the-registration-token-comes-from}

Al registrar, Semaphore obtiene el token de registro de la primera
fuente disponible, en este orden:

1. La opción `--registration-token-file`.
2. El ajuste `registration_token_file` del archivo de configuración (o
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. La entrada estándar, cuando se pasa `--stdin-registration-token`.
4. La variable de entorno `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`.

Un archivo de token que existe pero está vacío es un error. Si ninguna fuente proporciona un
token, se intenta el registro sin él y el servidor lo rechaza.

## Iniciar un runner (`runner start`) {#starting-a-runner-runner-start}

Inicia el runner, se conecta al servidor y empieza a aceptar tareas. Este es
el comando que se ejecuta para mantener en línea un runner registrado.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Opción | Descripción |
|------|-------------|
| `--auto-register` | Registra el runner antes de iniciarlo si aún no está registrado (es decir, si la configuración no tiene token de runner). |
| `--register` | Alias de `--auto-register`. |

Con `--auto-register`, si la configuración no tiene `token`, Semaphore lee el
token de registro desde `registration_token_file` (o
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) o desde
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, y reintenta el registro cada 5
segundos hasta que tiene éxito, recarga la configuración y se inicia. Esto resulta
práctico para runners que se registran a sí mismos en el primer arranque, por ejemplo en
contenedores.

`runner start` no acepta `--registration-token-file` ni
`--stdin-registration-token`; esas opciones pertenecen únicamente a `runner register`.

## Desregistrar un runner (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Elimina el registro del runner en el servidor, usando el token de runner del
archivo de configuración.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
