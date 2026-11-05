---
title: Ejecutor Docker
description: Ejecute cada tarea de un runner en un contenedor Docker nuevo en un daemon local o remoto, con ejemplos de configuración, notas de seguridad y solución de problemas.
sidebar_custom_props:
  edition: pro
---

# Ejecutor Docker <FeatureState feature="docker-executor" />

Con el ejecutor Docker, un runner inicia cada tarea en un contenedor nuevo y lo elimina
cuando la tarea termina. El runner se comunica con un daemon de Docker a través de su
API: el daemon puede estar en el mismo host o ser remoto, mediante TLS.

Cómo se ejecuta una tarea en contenedor, qué hay dentro del contenedor y qué no se admite
se describe en [Ejecutores](./#how-a-container-task-runs). Esta página cubre la
configuración de Docker.

## Antes de empezar {#before-you-begin}

- Un servidor de Semaphore con licencia Pro o Enterprise.
- Un runner registrado en el servidor; consulte [Runners](/admin-guide/runners). Use la
  imagen `semaphoreui/runner` o el binario oficial `semaphore`.
- Docker Engine accesible desde el runner y permiso para usarlo: pertenencia al grupo
  `docker`, acceso al socket montado o certificados de cliente TLS.
- El daemon puede descargar `semaphoreui/job` y `semaphoreui/helper` (o sus propias imágenes).

## Inicio rápido {#quick-start}

Añada el ejecutor a la configuración del runner y reinícielo:

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

Sin más opciones, el runner usa el socket local (`DOCKER_HOST` si está definido; si no,
`unix:///var/run/docker.sock`), la imagen build `semaphoreui/job:latest` y la red `bridge`.

Ejecute cualquier tarea dirigida a este runner. El log de la tarea empieza así:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

Mientras la tarea se ejecuta, puede ver sus contenedores:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Ejemplos {#examples}

### Binario del runner en un host Docker {#runner-binary-on-a-docker-host}

El runner se ejecuta como servicio de systemd en el mismo host que Docker. Dé acceso al
socket a su usuario:

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

### Runner en un contenedor con el socket del host {#runner-in-a-container-with-the-host-socket}

El contenedor del runner controla el daemon del host a través del socket montado; los
contenedores de las tareas son hermanos del runner, no están anidados en él. La imagen
del runner se ejecuta con el UID `1001`, así que añádalo al grupo propietario del socket:

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

El volumen `semaphore-runner-data` conserva el token del runner emitido en el registro,
de modo que el runner no vuelve a registrarse tras un reinicio.

Lo mismo con Docker Compose:

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

Los secretos llegan a la tarea a través de un volumen con nombre en el daemon, nunca a
través del sistema de archivos del runner, por lo que no hace falta compartir otras
rutas entre el runner y el host.

### Daemon de Docker remoto mediante TLS {#remote-docker-daemon-over-tls}

El runner y el daemon están en máquinas distintas. Proteja el puerto del daemon con TLS
mutuo (consulte [Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
y coloque los archivos de cliente en el runner:

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

Cuando `cert_path` está definido, el runner verifica el certificado del daemon con
`ca.pem` y se autentica con `cert.pem` y `key.pem`. Los nombres de archivo son fijos.

:::warning
Sin `cert_path`, una conexión `tcp://` es HTTP sin cifrar, y cualquiera que alcance el
puerto controla el daemon. `tls_verify` por sí solo no activa TLS (⚠️ 2026-11-05: la
opción se lee pero no se aplica); defina siempre `cert_path` para un daemon remoto.
:::

### Una red para servicios internos {#a-network-for-internal-services}

De forma predeterminada, los contenedores de las tareas se unen a `bridge`. Para que las
tareas alcancen servicios por nombre de contenedor, o para aislarlas en su propia red,
cree una red y configúrela:

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

`network` acepta cualquier modo de red que Docker entienda: un nombre de red, `bridge`,
`host` o `none`. El contenedor de clonado se une a la misma red, así que con `none` no
se puede clonar el repositorio.

### Imágenes de un registro privado {#images-from-a-private-registry}

El ejecutor descarga las imágenes sin credenciales de registro. Para una imagen privada,
inicie sesión y descárguela en el host del daemon, y mantenga una política de descarga
que no vuelva a descargarla:

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

Con `if-not-present`, use una etiqueta de versión en lugar de `latest`: una etiqueta que
ya está en el daemon nunca se actualiza. Con `never`, una imagen ausente hace fallar la
tarea en lugar de intentar descargarla.

### Todo el bloque en una variable {#the-whole-block-as-one-variable}

Para despliegues configurados solo mediante el entorno, pase el bloque del ejecutor como JSON:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Referencia de configuración {#configuration-reference}

Todas las opciones están en `runner.executor.docker` en la configuración del runner.

| Opción | Variable de entorno | Predeterminado | Descripción |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST` y después el socket de la plataforma | Dirección del daemon: `unix:///path`, `tcp://host:port` o `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Directorio con `ca.pem`, `cert.pem` y `key.pem` para TLS mutuo. Definirlo activa TLS. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Todavía no se aplica; use `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Imagen build. La **Imagen del ejecutor** de una plantilla la sobrescribe. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Imagen del contenedor de clonado y para llenar el volumen de secretos. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Red de los contenedores de clonado y build. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` o `never`. Un valor desconocido equivale a `if-not-present`. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | sin límite | CPU por contenedor, como `docker run --cpus`. Se admiten fracciones: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | sin límite | Memoria por contenedor: bytes, o con `k`, `m`, `g` (`512m`, `2g`). Un valor no interpretable significa sin límite. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Ejecuta los contenedores con `--privileged`. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Segundos que `docker stop` espera tras **Stop** antes de matar el contenedor. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | No se usa: el ejecutor espera a que el contenedor termine en lugar de consultarlo. |

Los límites, la red y `privileged` se aplican por igual al contenedor de clonado y al build.

## Detener y limpiar {#stop-and-clean-up}

**Stop** en la interfaz envía `docker stop` al contenedor en ejecución, espera hasta
`cleanup_grace_seconds` y luego elimina los contenedores y ambos volúmenes.

Si el proceso del runner se mata durante una tarea, sus contenedores y volúmenes quedan
en el daemon; el runner no los recoge en el siguiente inicio. Todo lo que crea el
ejecutor lleva la etiqueta `com.semaphoreui.runner=semaphore`, y
`com.semaphoreui.task-id` contiene el ID de la tarea. Elimine los restos cuando no haya
ninguna tarea ejecutándose en este daemon:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Solución de problemas {#troubleshooting}

| Mensaje | Causa y solución |
|---|---|
| `docker executor is only available in the proprietary build` (log del runner) | El runner es una compilación Community. Use `semaphoreui/runner` o el binario oficial. |
| `docker executor: daemon not reachable` | `host` incorrecto, el daemon está caído o el usuario del runner no puede abrir el socket (`permission denied`). Compruébelo con `docker -H <host> info` como usuario del runner; añada el usuario al grupo del socket. |
| `pull image ...: ... unauthorized` o `not found` | La imagen es privada o está mal escrita. Descárguela primero en el host del daemon; consulte [registro privado](#images-from-a-private-registry). |
| `git clone exited with status 128` | La URL del repositorio, la rama o la clave SSH son incorrectas, o la red bloquea el host de Git. La salida del clonado encima de la línea muestra el error de Git. |
| `interpreter python3 not found in image; set a runner image that provides it` | A la imagen build le falta el binario de la aplicación. Defina una imagen que lo tenga, en el runner o en la **Imagen del ejecutor** de la plantilla. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | La imagen no tiene cliente OpenSSH; Ansible no puede usar la clave del inventario. Instale `openssh-client`. |
| `Permission denied` en `/workspace` | Una imagen personalizada se ejecuta con un usuario que no puede escribir en `/workspace`. Consulte [Crear una imagen personalizada](./#build-a-custom-image). |
| `build container exited with status N` | La aplicación falló con el código de salida `N`; el motivo está en el log anterior. |
| `inventory login_password authentication is not supported` | Consulte [Limitaciones](./#limitations). |

## Páginas relacionadas {#related-pages}

- [Ejecutores](/admin-guide/executors): cómo se ejecutan las tareas en contenedor, imágenes, limitaciones.
- [Ejecutor Kubernetes](./kubernetes): el mismo modelo en un clúster.
- [Runners](/admin-guide/runners): registrar e iniciar un runner.
- [Imagen del ejecutor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): otra imagen para una sola plantilla.
