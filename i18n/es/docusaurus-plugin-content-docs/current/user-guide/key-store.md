---
title: Key Store
description: Guía completa de credenciales en Semaphore Key Store, generación de pares de claves SSH, contraseñas de inicio de sesión, secretos de token y almacenamientos externos.
---

# Key Store

El **Key Store** sirve como el repositorio centralizado de credenciales de Semaphore. Administra los materiales de autenticación necesarios para clonar repositorios Git remotos, conectarse a hosts de infraestructura de destino, elevar privilegios (`sudo`/`become`) y descifrar secretos de Ansible Vault.

![Key Store](/assets/key-store-keys.webp)

El Key Store se divide en dos vistas principales:
* **Pestaña Keys**: Muestra todas las credenciales aprovisionadas para el proyecto actual con su nombre, backend de almacenamiento, tipo y estado de sincronización.
* **Pestaña Storages (Pro)**: Configura backends de secretos externos (como HashiCorp Vault, OpenBao, AWS Secrets Manager o CyberArk) para resolución dinámica y sincronización automatizada.

---

## Tipos de credenciales {#types}

Semaphore clasifica las credenciales almacenadas en tres tipos fundamentales:

### 1. Claves SSH {#1-ssh}
Las claves SSH proporcionan autenticación criptográfica asimétrica para conectarse a nodos Linux/UNIX y clonar repositorios Git mediante SSH (`git@github.com:...`).

Al configurar una credencial de clave SSH, puede especificar:
* **Nombre de clave**: Una etiqueta descriptiva para la credencial en sus inventarios y plantillas de proyecto.
* **Nombre de usuario (Opcional)**: La cuenta de usuario remota predeterminada utilizada para la conexión SSH (por ejemplo, `ansible` o `ubuntu`).
* **Frase de contraseña (Opcional)**: La frase de contraseña necesaria para descifrar claves privadas protegidas. Las entradas de frase de contraseña incluyen un icono de visibilidad (`ojo`) y están ocultas por defecto.
* **Clave privada**: El texto sin formato de la clave privada PEM/OpenSSH.

#### Generador de claves SSH integrado {#built-in-ssh-key-generator}

En lugar de ejecutar manualmente `ssh-keygen` en máquinas externas, Semaphore incluye un **generador de pares de claves SSH integrado de un solo clic** directamente en el modal:

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. Seleccione **Clave SSH** en el menú desplegable **Tipo**.
2. Marque la casilla **Generar clave SSH**.
3. El área de texto para la **clave privada** manual se deshabilitará y bloqueará automáticamente.
4. Haga clic en **Crear**. Semaphore generará automáticamente un par de claves criptográficamente seguro (ED25519/RSA), cifrará la clave privada en la base de datos y mostrará la clave pública en un cuadro de diálogo:

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

Use el botón **Copiar al portapapeles** para copiar la clave pública y péguela en las claves de despliegue de su proveedor Git o en el archivo `~/.ssh/authorized_keys` de sus nodos de destino.

#### Extraer claves públicas más adelante (Cajón de clave pública) {#extracting-public-keys-later}

Si cierra el cuadro de diálogo o necesita recuperar la clave pública más adelante, no necesita regenerar el par de claves. Al editar cualquier clave creada con el generador, Semaphore ofrece un cajón desplegable **Clave pública**:

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* Haga clic en **Mostrar** / **Ocultar** para ver la cadena de texto de la clave pública.
* Haga clic en el icono de portapapeles para copiar la clave pública al instante.

#### Vinculación de claves de despliegue en alojamientos Git habituales

Para repositorios Git que requieren autenticación SSH, agregue la clave pública generada como deploy key de solo lectura:
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. Inicio de sesión con contraseña {#2-login-with-password}

El tipo de credencial **Inicio de sesión con contraseña** admite tanto autenticación tradicional por usuario/contraseña como cadenas de secretos independientes:

* **Autenticación de host y sudo**: Proporciona acceso SSH basado en contraseña y elevación de privilegios `sudo` en hosts de destino.
* **Autenticación Git HTTPS**: Autentica en repositorios remotos a través de HTTPS mediante nombre de usuario y tokens de acceso personal (PAT).
* **Contraseñas de Ansible Vault**: Desbloquea archivos y variables cifrados de Ansible Vault en tiempo de ejecución.

:::tip Cadenas secretas y tokens de acceso personal (PAT)
Para almacenar una cadena de secreto puro (como un token Bearer de API, contraseña de Vault o PAT), **deje el campo Usuario en blanco**. Semaphore tratará la entrada como un secreto aislado sin vincular un identificador de usuario.
:::

#### Enmascaramiento y protección contra sobreescritura {#secret-masking-and-override-protection}

Para proteger las credenciales contra accesos no autorizados y modificaciones accidentales:
* Las entradas de contraseña y frase de contraseña están enmascaradas con controles de visibilidad opcionales.
* Al editar una credencial existente, las entradas de secretos sensibles están desactivadas de forma predeterminada.
* Para actualizar o sustituir un secreto existente, debe marcar explícitamente la casilla **Sobrescribir** en la parte inferior del formulario. Esta protección evita sobreescrituras accidentales en ediciones rutinarias.

---

### 3. Ninguno {#3-none}

La credencial **Ninguno** actúa como un marcador de posición de autenticación nula. Se utiliza para repositorios Git públicos de código abierto (como en GitHub o GitLab) y ejecuciones locales de playbooks sin claves SSH ni contraseñas.

---

## Almacenamientos de secretos {#secret-storages}

Semaphore admite arquitecturas desacopladas de almacenamiento de secretos. Al crear o editar credenciales, puede elegir dónde reside el material secreto a través de las pestañas:

| Pestaña de almacenamiento | Disponibilidad | Descripción |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | El secreto se almacena en la base de datos de Semaphore con cifrado envolvente. |
| **Storage** | Pro | El secreto hace referencia a un motor externo (por ejemplo, HashiCorp Vault, AWS Secrets Manager). |
| **Env** | Open Source & Pro | El secreto se resuelve dinámicamente en tiempo de ejecución desde una variable de entorno del servidor. |
| **File** | Open Source & Pro | El secreto se lee desde un archivo protegido ubicado en el directorio de secretos configurado. |

![Almacenamientos de secretos](/assets/key-store-storages.webp)

### Almacenamiento en base de datos (Local) {#database}

Por defecto, los secretos se almacenan en la base de datos de forma cifrada mediante cifrado simétrico AES. La clave maestra se configura mediante el parámetro del servidor:
* Clave de configuración: `access_key_encryption`
* Variable de entorno: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning Generación de clave maestra de cifrado
Genere una clave segura de 32 bytes en base64 antes de iniciar instancias de producción:
```bash
head -c32 /dev/urandom | base64
```
Asegúrese de respaldar esta clave. Si la clave se pierde, los secretos existentes de la base de datos no se podrán recuperar.
:::

### Fuentes de variables de entorno y archivos (Solo lectura) {#environment-variable-or-file}

Al seleccionar la pestaña **Env** o **File**, Semaphore trata el almacenamiento como un origen externo de solo lectura. La interfaz muestra un aviso informativo:

> **Read-only secret storage chosen.**

![Almacenamiento de solo lectura](/assets/key-store-env-readonly-storage.webp)

* **Origen Env**: Indique el nombre exacto de la variable de entorno exportada en el servidor (por ejemplo, `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **Origen File**: Indique la ruta relativa al directorio de secretos configurado (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, por defecto `/tmp/semaphore`).

Para claves estructuradas, los contenidos deben estar formateados como objetos JSON válidos. Consulte [Fuentes de entorno y archivos](/user-guide/key-store/env-and-file-sources).

### Motores de secretos empresariales externos (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro y Enterprise amplían el Key Store con conectores nativos a los principales gestores de secretos empresariales:

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: Conexión mediante autenticación AppRole o Token para leer y escribir secretos KV v1/v2.
* **[OpenBao](/user-guide/key-store/openbao)**: Bifurcación de código abierto y compatible con la API de HashiCorp Vault.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />: Integración con roles IAM de AWS o credenciales estáticas.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: Integración con gestión de accesos privilegiados centralizada.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />: Lectura y escritura de secretos mediante la API REST PVWA de CyberArk.

---

## Sincronización de secretos desde almacenamientos remotos {#syncing-secrets-from-remote-storages}

En lugar de registrar credenciales manualmente una a una, Semaphore admite la sincronización automatizada desde almacenes de secretos externos.

Cuando un secreto se gestiona mediante sincronización:
* Se marca con una etiqueta activa de **synchronized** en la tabla del Key Store.
* La edición manual del contenido del secreto se deshabilita para mantener el almacén externo como única fuente de verdad.
* Cualquier actualización o rotación en el motor externo se propaga automáticamente a Semaphore según el intervalo configurado.

Para consultar los pasos completos de configuración, consulte [Sincronización de secretos](/user-guide/key-store/secret-sync).
