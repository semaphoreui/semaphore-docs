---
title: Ejecutores
description: Cómo un runner ejecuta tareas con el ejecutor local, Docker o Kubernetes, qué se ejecuta dentro de los contenedores y qué no admiten los ejecutores de contenedores.
---

# Ejecutores

Un ejecutor decide **dónde inicia el runner el proceso de la tarea**. El runner sigue
consultando al servidor, recibe la tarea y devuelve el log; solo cambia el lugar donde
se ejecuta el proceso de Ansible, Terraform o shell.

| Ejecutor | `runner.executor.type` | Dónde se ejecuta una tarea | Edición |
|---|---|---|---|
| Local | `local` (predeterminado) | Un proceso hijo en el host del runner, con los archivos, las herramientas y el `PATH` del runner. | Community |
| Docker | `docker` | Un contenedor nuevo en un daemon de Docker, que se elimina tras la tarea. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Un Pod nuevo en un namespace de Kubernetes, que se elimina tras la tarea. | <FeatureState feature="k8s-executor" /> |

El ejecutor es un ajuste del **runner**, no del servidor ni de la plantilla. El propio
servidor de Semaphore siempre ejecuta las tareas localmente; para ejecutarlas en
contenedores, inicie un [runner](/admin-guide/runners) y dirija las plantillas hacia él
con una etiqueta de runner.

## Elegir un ejecutor {#choose-an-executor}

| Necesita | Use |
|---|---|
| Herramientas instaladas en una máquina, acceso a sus archivos, salidas de workflows | Local |
| Un entorno limpio para cada tarea, distintas herramientas por plantilla, en uno o pocos hosts | [Docker](./docker) |
| Tareas planificadas en un clúster, RBAC y Secrets de Kubernetes, sin socket de Docker | [Kubernetes](./kubernetes) |

## Configurar el ejecutor {#set-the-executor}

Añada el bloque `executor` a la sección `runner` del archivo de configuración del runner:

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

O defina la variable de entorno:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

Cada opción tiene una variable de entorno; las listas completas están en las páginas de
[Docker](./docker#configuration-reference) y [Kubernetes](./kubernetes#configuration-reference).
Reinicie el runner después de cambiar el ejecutor.

:::info
Los ejecutores de contenedores forman parte de la compilación Pro del runner. Use la
imagen `semaphoreui/runner` o el binario oficial `semaphore`. La imagen
`semaphoreui/runner-community` se compila sin ellos y registra
`docker executor is only available in the proprietary build` al iniciarse.
:::

## Cómo se ejecuta una tarea en contenedor {#how-a-container-task-runs}

Ambos ejecutores de contenedores ejecutan una tarea de la misma forma:

1. **Preparar.** El runner crea un espacio de trabajo compartido y coloca los secretos
   de la tarea (claves SSH, contraseñas de vault, variables extra, un inventario
   estático) donde los contenedores puedan leerlos.
2. **Clonar.** Un contenedor *auxiliar* de corta duración clona el repositorio en
   `/workspace/repo` (`git clone --depth 1` de la rama de la tarea).
3. **Ejecutar.** El contenedor *build* arranca en `/workspace/repo` y ejecuta la aplicación:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` o el binario de una aplicación personalizada. Su código de salida es el resultado de la tarea.
4. **Registrar.** La salida de ambos contenedores se transmite al log de la tarea mientras se ejecutan.
5. **Limpiar.** Se eliminan los contenedores, volúmenes, Secrets y ConfigMaps de la tarea,
   tanto si la tarea tuvo éxito como si falló o se detuvo.

| Paso | Docker | Kubernetes |
|---|---|---|
| Espacio de trabajo | Volumen con nombre `semaphore-workspace-<task>-<random>` | Volumen `emptyDir` del Pod |
| Secretos | Volumen con nombre `semaphore-secrets-<task>-<random>`, montado en solo lectura | Un Secret o ConfigMap por tipo, montado en solo lectura |
| Clonado | Contenedor `semaphore-job-<task>-<random>-clone` | Contenedor init `git-clone` |
| Ejecución | Contenedor `semaphore-job-<task>-<random>-build` | Contenedor `build` del Pod `semaphore-job-<task>-<random>` |
| Botón Stop | `docker stop` con `cleanup_grace_seconds` y después eliminación | Pod eliminado con `cleanup_grace_seconds` |

Una tarea detenida desde la interfaz termina con el estado **Stopped**, igual que con el ejecutor local.

## Dentro del contenedor build {#inside-the-build-container}

| Ruta | Contenido |
|---|---|
| `/workspace` | Espacio de trabajo con escritura; también es el `HOME` de la tarea. |
| `/workspace/repo` | El repositorio clonado; el directorio de trabajo. |
| `/secrets/ssh/<key id>/id_rsa` | Clave privada SSH del repositorio o del inventario. Se carga en `ssh-agent` antes de iniciar la aplicación. |
| `/secrets/vault/<name>` | Contraseña de Ansible Vault, pasada como `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Variables extra del Variable Group más `semaphore_vars`, pasadas como `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` o `inventory.yml` | Un inventario estático almacenado en Semaphore. Los inventarios de tipo archivo se leen del repositorio. |

El contenedor recibe un conjunto fijo de variables de entorno, descrito en
[Variables de entorno de la tarea](/reference/task-environment#container-executors). Las
`env_vars`, `forwarded_env_vars`, el `PATH` y las rutas `apps.*` propias del runner
**no** se pasan al contenedor.

## Imágenes {#images}

En cada tarea intervienen dos imágenes:

| Imagen | Predeterminada | Se usa para | Requiere |
|---|---|---|---|
| Imagen build | `semaphoreui/job:latest` | Ejecutar la aplicación. | `sh`, el binario de la aplicación en el `PATH`; para claves SSH, `ssh-agent`, `ssh-add`, `setsid`. |
| Imagen auxiliar | `semaphoreui/helper:latest` | Clonar el repositorio (Docker también la usa para llenar el volumen de secretos). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` es Debian con Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu y Terragrunt. Se ejecuta como usuario `nobody`, grupo `0`.

La imagen build se define por runner (`image`) y puede sobrescribirse por plantilla con
el campo **Imagen del ejecutor**; consulte
[Imagen del ejecutor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
La imagen auxiliar solo se define por runner.

### Crear una imagen personalizada {#build-a-custom-image}

Extienda `semaphoreui/job` cuando sus tareas necesiten colecciones de Ansible, paquetes
de Python o herramientas adicionales. Los ejecutores de contenedores **no** instalan el
`requirements.yml` del repositorio, así que incluya las colecciones y los roles en la imagen:

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

Si crea una imagen desde cero, conserve estas propiedades de `semaphoreui/job`:

- `/workspace` existe y el usuario con el que se ejecuta el contenedor puede escribir en él.
- `/etc/passwd` tiene permiso de escritura para el grupo (`chmod g=u /etc/passwd`). Así, un
  contenedor iniciado con un UID aleatorio (OpenShift) obtiene una entrada en passwd, que
  OpenSSH y Git necesitan.
- La imagen no necesita un entrypoint especial: el ejecutor ejecuta su script con `sh -c`.

## Limitaciones {#limitations}

En comparación con el ejecutor local, los ejecutores de contenedores actualmente:

| No se admite | Qué hacer en su lugar |
|---|---|
| Credenciales de inventario de tipo **Inicio de sesión con contraseña** (contraseña SSH o de become) | Use una clave SSH. Una tarea con una clave así falla con `inventory login_password authentication is not supported`. |
| Tareas de Terraform que esperan una confirmación manual | Active **Auto Approve** en la plantilla o ejecute tareas solo de plan. De lo contrario, la tarea falla con `terraform manual approval is not supported`. |
| Repositorios de tipo **Local** | El espacio de trabajo queda vacío; use un repositorio Git. |
| Instalar `requirements.yml` (roles y colecciones de Galaxy) | [Inclúyalos en la imagen](#build-a-custom-image). |
| Salidas de workflows (`SEMAPHORE_OUTPUTS_FILE`) | Use el ejecutor local para las tareas cuyas salidas lee un workflow. |
| Credenciales por host desde la configuración del host | Use el ejecutor local. |
| Historial de Git más allá del último commit | El clon es superficial (`--depth 1`). |

Las claves de host SSH no se verifican: el clonado acepta una clave de host nueva y
Ansible se ejecuta con `ANSIBLE_HOST_KEY_CHECKING=False`.

## Páginas relacionadas {#related-pages}

- [Ejecutor Docker](./docker): instalación, configuración, seguridad, solución de problemas.
- [Ejecutor Kubernetes](./kubernetes): RBAC, despliegue del runner, configuración, solución de problemas.
- [Runners](/admin-guide/runners): registrar e iniciar un runner.
- [Opciones de configuración](/reference/configuration): todas las opciones `runner.executor.*`.
