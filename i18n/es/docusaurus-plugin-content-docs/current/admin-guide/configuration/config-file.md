
# Archivo de configuración

## Crear el archivo de configuración {#creating-configuration-file}

Semaphore usa un archivo `config.json` para su configuración principal. Puede generar este archivo de forma interactiva con las herramientas integradas o mediante un configurador web.

### Generar mediante la CLI {#generate-via-cli}

Use los siguientes comandos para generar el archivo de configuración de forma interactiva:

* Para el servidor de Semaphore:
  ```
  semaphore setup
  ```
* Para el runner de Semaphore:
  ```
  semaphore runner setup
  ```
  
  :::tip
    Para más detalles sobre la configuración del runner, consulte la sección <a href="./../runners">Runners</a>.
  :::

### Generar en el sitio web {#generate-on-the-website}

Como alternativa, puede usar el configurador interactivo web:
* [Configurador del servidor](https://semaphoreui.com/install/binary/2_13/config)
* [Configurador del runner](https://semaphoreui.com/install/binary/2_13/runner)

## Ejemplo de archivo de configuración {#configuration-file-example}

Semaphore usa un archivo de configuración `config.json` con el siguiente contenido:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Uso del archivo de configuración {#configuration-file-usage}

* Para el servidor de Semaphore:

```bash
semaphore server --config ./config.json
```

* Para el runner de Semaphore:

```bash
semaphore runner start --config ./config.json
```

## Directorio de secretos {#secrets-directory}

Semaphore lee los archivos de secretos (por ejemplo, [entradas del Almacén de claves basadas en archivos](/user-guide/key-store/env-and-file-sources) o tokens de HashiCorp Vault y OpenBao leídos desde disco) únicamente desde un directorio configurable.

| Opción | Variable de entorno | Descripción |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Directorio para los archivos de secretos. Predeterminado: `/tmp/semaphore`. |
| `secrets_path` (heredado) | `SEMAPHORE_SECRETS_PATH` | Ajuste de nivel superior conservado por compatibilidad con versiones anteriores. Se usa solo cuando `dirs.secrets` no está definido o sigue en la ruta predeterminada. |

**Precedencia**: un valor de `dirs.secrets` distinto del predeterminado prevalece sobre el `secrets_path` heredado. Cuando define `SEMAPHORE_SECRETS_PATH`, Semaphore lo aplica a ambos campos.

Ejemplo con la estructura actual:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Las instalaciones heredadas pueden seguir usando:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

Los archivos de clave seleccionados en la pestaña **File** del formulario del Almacén de claves, así como los archivos de token referenciados por almacenamientos externos de secretos, deben encontrarse dentro de este directorio. Las rutas fuera de él se rechazan con `file path must be inside secrets path`. Consulte [Claves desde variables de entorno y archivos](/user-guide/key-store/env-and-file-sources).

## Operaciones de Git {#git-operations}

Semaphore clona y actualiza los repositorios de las tareas antes de cada ejecución. Dos opciones controlan este comportamiento:

| Opción | Variable de entorno | Descripción |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Implementación del cliente Git: `cmd_git` (predeterminado, usa el binario `git` del sistema) o `go_git` (cliente puro en Go). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Número de intentos de las operaciones de clone y pull antes de que la tarea falle. Predeterminado: `4`. Establézcalo en `1` para intentarlo una sola vez sin reintentos. |

Cuando un clone o pull falla y quedan reintentos, Semaphore espera con retroceso exponencial (empezando en 1 segundo, duplicándose en cada intento, con un máximo de 60 segundos) y registra un mensaje como `Git pull failed (...), retrying in 2s`. Los reintentos se aplican solo a las operaciones de red; un checkout fallido o un error de autenticación siguen haciendo fallar la tarea una vez agotados todos los intentos.

Si su servidor Git no está disponible de forma intermitente, aumente `git_attempts`. Si los fallos son inmediatos y persistentes (credenciales incorrectas, repositorio inexistente), corrija el problema de fondo; los reintentos no servirán de ayuda.

