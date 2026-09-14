# Claves desde variables de entorno y archivos

Además de guardar un secreto en la base de datos, una entrada del Almacén de claves puede leer su valor en el momento de ejecutar la tarea desde
un **archivo** del servidor de Semaphore o desde una **variable de entorno** del proceso del servidor de Semaphore.
Esto resulta útil cuando la credencial ya está aprovisionada fuera de Semaphore, por ejemplo:

* una clave SSH montada en el contenedor de Semaphore como secreto de Docker o Kubernetes;
* un token escrito en disco por un agente (HashiCorp Vault Agent, cert-manager, etc.) y rotado periódicamente;
* una contraseña inyectada en el entorno del contenedor por su orquestador.

Semaphore no copia el valor en su base de datos. Cada vez que una tarea necesita la clave, el servidor
vuelve a leer el archivo o la variable, de modo que rotar la credencial en disco surte efecto en la siguiente tarea.

:::info
El archivo o la variable los lee el **servidor de Semaphore**, no un runner. Cuando use runners remotos,
monte el archivo en el host del servidor; el servidor resuelve el secreto y se lo entrega al runner.
:::

## Elegir el origen {#choosing-the-source}

Al crear o editar una clave (**Almacén de claves → Nueva clave**), en la parte superior del formulario hay pestañas de origen:

| Pestaña | De dónde proviene el valor | Qué introducir |
|---------|----------------------------|----------------|
| **Local** | Base de datos de Semaphore (cifrado) | El login, la contraseña o la clave privada en el formulario |
| **Storage** <Pro /> | Un almacenamiento externo de secretos como [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) | El almacenamiento y la ruta del secreto |
| **Env** | Una variable de entorno del proceso del servidor de Semaphore | El nombre de la variable, por ejemplo `PROD_SSH_KEY` |
| **File** | Un archivo del servidor de Semaphore | La ruta **absoluta** al archivo, por ejemplo `/var/lib/semaphore/secrets/prod.json` |

Con **Env** o **File** seleccionado, los campos de login, contraseña y clave privada desaparecen. Toda la
credencial, incluido el login en las claves SSH y de Inicio de sesión con contraseña, debe estar en el archivo o en la variable.

## 1. Permitir el directorio {#allow-the-directory}

Por seguridad, Semaphore solo lee archivos de clave que estén dentro de su **directorio de secretos**. Cualquier otra
ruta se rechaza al iniciarse una tarea:

```
Failed to install inventory: file path must be inside secrets path
```

El directorio de secretos predeterminado es `/tmp/semaphore`. Apúntelo al directorio donde se encuentran sus archivos de clave
mediante `dirs.secrets` en `config.json` o la variable de entorno `SEMAPHORE_SECRETS_PATH`.
Consulte [Directorio de secretos](/admin-guide/configuration/config-file#secrets-directory) para conocer las reglas de precedencia.

Ejemplo de Docker Compose que monta un directorio del host y lo permite:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

Fragmento equivalente de `config.json`:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Reglas para la ruta introducida en la pestaña **File**:

* debe ser absoluta (`/var/lib/semaphore/secrets/prod.json`, no `prod.json`);
* no debe contener segmentos `..`;
* debe resolverse a una ubicación dentro del directorio de secretos (los subdirectorios están permitidos);
* el archivo debe poder ser leído por el usuario con el que se ejecuta Semaphore (en la imagen oficial de Docker es `semaphore`, UID 1001).

Las variables de entorno no tienen esta restricción; el servidor simplemente lee la variable indicada de su propio entorno.

## 2. Dar formato al valor {#format-the-value}

El contenido del archivo (o el valor de la variable) depende del tipo de clave. Un único salto de línea
final al terminar el archivo se ignora; todo lo demás se usa tal cual.

### Clave SSH {#ssh-key}

Semaphore espera un **documento JSON**, no un archivo de clave privada PEM u OpenSSH en bruto:

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — el nombre de usuario SSH, que se pasa a Ansible como `--user`. Déjelo vacío para que lo decida el inventario (`ansible_user`). En los repositorios Git, un login vacío se resuelve como `git` de forma predeterminada.
* `passphrase` — la frase de contraseña de la clave privada, o una cadena vacía.
* `private_key` — la clave privada con los saltos de línea codificados como `\n`.

Genere el envoltorio a partir de una clave existente con `jq`, que se encarga del escapado:

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

A continuación, cree una clave de tipo **SSH**, abra la pestaña **File** e introduzca `/var/lib/semaphore/secrets/prod_ssh.json`
(la ruta tal como se ve **dentro** del contenedor).

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
Apuntar la pestaña **File** a una clave privada en bruto como `~/.ssh/id_ed25519` no funciona.
El archivo se analiza como JSON y la tarea falla al cargar el inventario.
:::

### Inicio de sesión con contraseña {#login-with-password}

También es un documento JSON:

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

Deje `login` vacío para usar la clave como un token o contraseña sin más, por ejemplo como contraseña de un vault de Ansible.

## Ejemplo con variable de entorno {#environment-variable-example}

El mismo formato JSON se aplica a la pestaña **Env**. En Docker Compose:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

Cree una clave **SSH**, seleccione la pestaña **Env** e introduzca `PROD_SSH_KEY` como nombre de la variable.

:::tip
Las variables de entorno son visibles para todos los procesos del contenedor y a menudo acaban en
los metadatos y registros del orquestador. Prefiera la pestaña **File** con un secreto montado siempre que pueda.
:::

## Solución de problemas {#troubleshooting}

| Error | Causa | Solución |
|-------|-------|----------|
| `file path must be absolute` | Se introdujo una ruta relativa | Introduzca la ruta completa empezando por `/` |
| `file path must not contain traversal segments` | La ruta contiene `..` | Introduzca la ruta resuelta |
| `file path must be inside secrets path` | El archivo está fuera de `dirs.secrets` | Establezca `SEMAPHORE_SECRETS_PATH` en el directorio del archivo, o mueva el archivo |
| `no such file or directory` | La ruta es incorrecta o no está montada en el contenedor | Compruebe el montaje del volumen y use la ruta interna del contenedor |
| `permission denied` | El proceso de Semaphore no puede leer el archivo | Corrija el propietario o los permisos del archivo |
| `invalid character '-' looking for beginning of value` | Se proporcionó una clave privada en bruto en lugar del envoltorio JSON | Envuelva la clave como se muestra arriba |
