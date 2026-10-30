---
title: Cliente
description: Administrar un servidor Semaphore desde la terminal y desde scripts con semaphore client - inicio de sesión y contextos, precedencia de la configuración, formatos de salida, códigos de salida y ejecución de tareas desde CI.
---

# Cliente

`semaphore client` controla un servidor Semaphore en ejecución a través de su API REST.
Solo necesita una URL del servidor y un token de API — sin acceso a la base de datos ni
archivo de configuración del servidor —, por lo que funciona desde un portátil, un job de
CI o un host que nunca ha visto el `config.json` del servidor.

```bash
semaphore client --help
```

Los comandos siguen la forma `semaphore client <resource> <action> [id|name]`.
Los recursos se nombran en singular, con el plural como alias
(`template list` y `templates list` son lo mismo). Todos los recursos tienen `list`,
`get`, `create`, `update` y `delete`; las tareas añaden `run`, `logs`, `wait`, `stop`
y similares. La lista exhaustiva y generada de todos los comandos y opciones está en la
[referencia de comandos](/reference/cli/commands#semaphore-client).

| Grupo | Propósito |
|-------|-----------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Iniciar sesión, comprobar el token, mostrarlo, cerrar sesión. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Guardar varios servidores en un único archivo de configuración y alternar entre ellos. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Proyectos, sus miembros, copias de seguridad y restauraciones. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Plantillas de tareas, y `template run` para iniciar una tarea. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Registros, espera, detención, confirmación y reejecución de tareas. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | Los demás recursos de un proyecto. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Recursos de todo el servidor (solo administradores). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Versión y configuración del servidor. |

## Primer inicio de sesión {#first-login}

De forma interactiva: el cliente pide el login, la contraseña y, si TOTP está
habilitado, el código; después crea un token de API y lo guarda. La contraseña se
usa una sola vez y nunca se almacena.

```bash
semaphore client auth login --url https://semaphore.example.com
```

Con un token existente (también es la forma de iniciar sesión en un servidor que solo
ofrece inicio de sesión único — cree el token en la página **Tokens** de su perfil):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Ambas formas guardan un *contexto* con el nombre del host del servidor en
`~/.semaphore/client.yml` y lo convierten en el actual. Compruebe cuál se está usando con
`semaphore client auth status`.

## Configuración {#configuration}

Cada ajuste puede proceder de una opción, de una variable de entorno o del contexto
actual, en este orden de precedencia: **opción > entorno > contexto > valor predeterminado**.

| Opción | Variable de entorno | Significado |
|--------|---------------------|-------------|
| `--url` | `SEMAPHORE_CLIENT_URL` | URL del servidor, por ejemplo `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Nombre del contexto que se usa en lugar del actual. |
| — | `SEMAPHORE_CLIENT_TOKEN` | Token de API. No existe una opción `--token` a propósito: los argumentos de los procesos son visibles en `ps` y en el historial de la shell. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | Archivo que contiene el token (se ignora un salto de línea final). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | Id o nombre del proyecto para los comandos de ámbito de proyecto. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (predeterminado), `json` o `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Tiempo de espera de una petición HTTP, predeterminado `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | Archivo PEM con la CA que firmó el certificado del servidor. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | Omite la verificación TLS. Cada llamada muestra una advertencia; es preferible `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | No preguntar nunca; un comando que necesitaría una respuesta falla en su lugar. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | Traza las peticiones HTTP en stderr. Las cabeceras de autorización y de cookies se enmascaran. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Ruta del archivo de configuración, predeterminada `~/.semaphore/client.yml`. |

Un token procedente del entorno solo se usa cuando la URL también procede del entorno
o de una opción. Así se evita que un token de CI se envíe a otro servidor cuando
alguien ejecuta el mismo job con `--context other`.

### El archivo de configuración {#the-configuration-file}

`~/.semaphore/client.yml` contiene contextos con nombre. `auth login` y `context set`
lo escriben; también puede editarlo a mano.

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # o token_file
    project: 3                # proyecto predeterminado, id o nombre
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

El cliente crea el directorio con el modo `0700` y el archivo con `0600`. Un archivo
en el que pueden escribir el grupo u otros usuarios se rechaza con la sugerencia de
ejecutar `chmod 600`; un archivo legible por otros produce una advertencia.

## Salida {#output}

Los datos van a stdout; los mensajes, advertencias y el progreso van a stderr, de modo
que un script puede capturar unos sin los otros.

| Opción | Efecto |
|--------|--------|
| `-o json` | JSON válido sin adornos. Una lista es siempre un array; una lista vacía es `[]`. Los nombres de los campos son los de la API. |
| `-o yaml` | Los mismos datos en YAML. |
| `--fields id,name,status` | Solo estas columnas o campos. Los campos anidados usan un punto: `--fields id,params.limit`. |
| `-q`, `--quiet` | Solo los ids, uno por línea — para `xargs` y bucles. |
| `--no-headers` | Tabla sin la línea de encabezado. |
| `--no-color` | Sin colores. Los colores también se desactivan cuando stdout no es una terminal o cuando `NO_COLOR` está definida. |

Cuando stdout no es una terminal, las columnas de la tabla se separan con un tabulador
y nunca se truncan.

Los objetos se identifican por su id numérico o por su nombre. El nombre se busca en el
proyecto sin distinguir mayúsculas y minúsculas; cuando varios objetos lo comparten, el
comando termina con el código 5 y lista los candidatos en stderr.

## Códigos de salida {#exit-codes}

| Código | Significado |
|--------|-------------|
| `0` | Éxito. Para un comando que espera: la tarea terminó con `success`. |
| `1` | Error del cliente o de la API — fallo de red, error del servidor, respuesta inesperada. |
| `2` | Error de uso: opción desconocida, argumento ausente, ningún proyecto indicado o una confirmación necesaria sin terminal (pase `--yes`). |
| `3` | La tarea esperada terminó con el estado `error`. |
| `4` | Falló la autenticación (HTTP 401 o 403). |
| `5` | Objeto no encontrado, o un nombre que coincide con varios objetos. |
| `6` | La tarea esperada terminó con el estado `stopped`. |
| `124` | Se agotó `--wait-timeout`. La tarea sigue ejecutándose en el servidor. |
| `130` | Interrumpido con Ctrl+C. El cliente se desconecta; la tarea sigue ejecutándose salvo que se haya indicado `--stop-on-interrupt`. |

## Ejecutar tareas desde scripts {#running-tasks-from-scripts}

Configure un job de CI íntegramente mediante el entorno y deje que el código de salida
decida el resultado:

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Inicia una tarea, transmite su registro y sale con 0/3/6 según su estado final
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Iniciar ahora, esperar después
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` y `--extra-vars-file` rellenan las variables extra de la tarea;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` y `--diff` sobrescriben
lo que la plantilla permite sobrescribir.

Una tarea puede detenerse a mitad de camino y esperar aprobación: un plan de
Terraform antes de aplicarlo, o cualquier plantilla cuya aplicación pregunte
primero. En una terminal el cliente imprime `Apply task <id>? [yes/no]` y envía
la respuesta al servidor. Sin terminal informa de la parada por stderr y sigue
esperando, así que un trabajo de CI necesita `task confirm <id>` o
`task reject <id>` desde otro sitio, `--auto-approve` cuando la plantilla lo
permite, o `--wait-timeout` para rendirse. Una tarea rechazada termina como
`error`, es decir, con código de salida 3.

Combine `-o json` con `jq` para todo lo que la tabla no muestra:

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Secretos y tokens {#secrets-and-tokens}

- El token nunca se muestra, salvo con `auth token`, que existe para pasarlo a otra
  herramienta y avisa cuando stdout es una terminal.
- Las contraseñas y el material de claves solo se leen de archivos o de stdin:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. Los secretos de entorno pasan por
  `environment create --secrets-file`.
- `environment get` y `key get` muestran los nombres de los secretos, nunca sus valores,
  en todos los formatos de salida.
- `auth logout --revoke` elimina el token en el servidor además de localmente.
- Los comandos destructivos piden confirmación en una terminal y requieren `--yes`
  sin ella; `project delete` requiere el nombre del proyecto con `--confirm`.
