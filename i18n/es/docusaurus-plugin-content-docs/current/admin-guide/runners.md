# Runners

Los runners permiten ejecutar tareas en un servidor distinto del de Semaphore UI.

Los runners de Semaphore funcionan bajo el mismo principio que los runners de GitLab o de GitHub Actions:

- Se lanza un runner en un servidor independiente, indicando la dirección del servidor de Semaphore y un token de autenticación.
- El runner se conecta a Semaphore y señala que está listo para aceptar tareas.
- Cuando aparece una nueva tarea, Semaphore proporciona toda la información necesaria al runner, que, a su vez, clona el repositorio y ejecuta Ansible, Terraform, PowerShell, etc.
- El runner envía los resultados de la ejecución de la tarea de vuelta a Semaphore.

Para los usuarios finales, trabajar con Semaphore con o sin runners se ve exactamente igual.

Cuando no hay runners definidos, el propio servidor de Semaphore UI actúa como runner. Todas las tareas se ejecutan en el contexto del servidor de Semaphore UI, con acceso al sistema de archivos.

Usar runners ofrece las siguientes ventajas:
- Ejecutar tareas de forma más segura. Por ejemplo, un runner puede ubicarse dentro de una subred cerrada o de un contenedor Docker aislado.
- Distribuir la carga de trabajo entre varios servidores. Puede iniciar varios runners y las tareas se distribuirán aleatoriamente entre ellos.

## Configuración {#set-up}

### Configurar el servidor {#set-up-a-server}

Para configurar el servidor para trabajar con runners, debe añadir la siguiente opción a la configuración de su servidor de Semaphore:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

o mediante variables de entorno:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Configurar un runner {#setup-a-runner}

Para configurar el runner, use el siguiente comando:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

Este comando creará un archivo de configuración en `/path/to/your/config/file.json`.

Sin embargo, antes de usar este comando, es necesario entender cómo se registran los runners en el servidor.

### Registrar el runner en el servidor {#registering-the-runner-on-the-server}

Hay dos formas de registrar un runner en el servidor de Semaphore:
1) Añadirlo mediante la interfaz web o la API.
2) Usar la línea de comandos con el comando `semaphore runner register`.

#### Añadir el runner mediante la interfaz web {#adding-the-runner-via-the-web-ui}

![Imagen del runner](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Registro mediante CLI {#registering-via-cli}

Para registrar un runner de esta forma, debe añadir la opción `runner_registration_token` al archivo de configuración de su servidor de Semaphore. Esta opción debe establecerse en una cadena arbitraria. Elija una cadena suficientemente compleja para evitar problemas de seguridad.

Cuando el comando `semaphore runner setup` pregunte si tiene un token de runner, responda No. Después use el siguiente comando para registrar el runner:

`semaphore runner register --config /path/to/your/config/file.json`

o

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Archivo de configuración {#configuration-file}

Como resultado de ejecutar el comando `semaphore runner setup`, se creará un archivo de configuración como el siguiente:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

Puede editar este archivo manualmente sin necesidad de volver a ejecutar `semaphore runner setup`.

Para volver a registrar el runner, puede usar el comando `semaphore runner register`. Esto sobrescribirá el token en el archivo indicado en la configuración.

## Ejecutar el runner {#running-the-runner}

Ahora puede iniciar el runner con el comando:

```
semaphore runner start --config /path/to/your/config/file.json
```

Su runner está listo para ejecutar tareas.

### Ejecutar el runner en Docker {#running-the-runner-in-docker}

La imagen `semaphoreui/runner` inicia el runner automáticamente. Pase la URL del servidor y el token de registro mediante variables de entorno:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Si sus playbooks necesitan paquetes de Python adicionales, monte un `requirements.txt` en `/etc/semaphore/requirements.txt`. El contenedor lo instala con `pip3` en cada inicio, antes de que el runner se conecte al servidor:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

Consulte [Instalar dependencias adicionales de Python](/admin-guide/installation/docker#installing-additional-python-dependencies) para obtener detalles sobre dónde se instalan los paquetes y cómo se gestionan los fallos.

### Intervalo de sondeo (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Cada runner consulta al servidor de Semaphore en un intervalo fijo para obtener nuevos trabajos y para
informar del progreso de las tareas. Configúrelo en el archivo de configuración del runner:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

O mediante una variable de entorno:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Valor | Efecto |
|-------|--------|
| **1** (predeterminado) | Los trabajos se recogen en aproximadamente un segundo; ideal para ejecuciones de baja latencia. |
| **Mayor** (p. ej. 5–30) | Reduce el tráfico HTTP cuando opera muchos runners contra un mismo servidor. Los trabajos pueden empezar algo más tarde. |

La página Runners de Semaphore UI expone esta opción en **Opciones avanzadas** al
generar los fragmentos de configuración (archivo de configuración, Docker y ejemplos con variables de entorno).

Los valores no válidos o cero recurren al valor predeterminado de 1 segundo.

### Etiquetas de runner (Pro) {#runner-tags-pro}

Puede asignar una o varias etiquetas a un runner de proyecto. Las plantillas pueden entonces exigir una etiqueta, de modo que las tareas se ejecuten solo en los runners que coincidan. Configure las etiquetas al añadir un runner en la interfaz del proyecto y establezca la etiqueta requerida en los ajustes de la plantilla.

## Dar de baja un runner {#runner-deregistration}

Puede eliminar un runner mediante la interfaz web.

![Imagen del runner](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

O dar de baja el runner mediante CLI:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Seguridad {#security}

Los runners se autentican ante el servidor con un token bearer opaco
(`X-Runner-Token`), emitido durante el registro. Proteja este token como cualquier otra
credencial: guárdelo en un archivo de configuración con permisos restringidos o en un gestor de secretos.

:::warning
Use HTTPS para la comunicación entre el servidor y el runner, especialmente cuando
no se encuentren en la misma red privada. Para certificados autofirmados o de una CA
interna, configure `runner.connection.server_ca_cert_file` en el runner.
No use `runner.connection.skip_tls_verify` en producción.
:::
