# Almacén de claves

El Almacén de claves de Semaphore se usa para guardar credenciales de acceso a repositorios remotos, de acceso a hosts remotos, credenciales sudo y contraseñas de vaults de Ansible.

![Almacén de claves](/assets/key-store-keys.webp)

La pestaña **Claves** muestra las credenciales del proyecto con su tipo. La pestaña **Almacenamientos** (Pro) muestra los almacenamientos externos de secretos configurados para el proyecto; consulte [Almacenamientos de secretos](#secret-storages).

## Tipos {#types}

### 1. SSH {#1-ssh}
Las claves SSH se usan para acceder a servidores remotos y también a repositorios remotos.

Si necesita ayuda para generar rápidamente una clave y colocarla en su host, [aquí tiene una guía rápida.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

En los repositorios Git que usan autenticación SSH, el repositorio Git del que intenta clonar debe tener su clave pública asociada a la clave privada.

A continuación encontrará enlaces a la documentación de algunos repositorios Git habituales:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Inicio de sesión con contraseña {#2-login-with-password}
El inicio de sesión con contraseña es una combinación de nombre de usuario y contraseña o token de acceso que puede usarse para lo siguiente:
* Autenticarse en hosts remotos (aunque es menos seguro que usar claves SSH)
* Credenciales sudo en hosts remotos
* Autenticarse en repositorios Git remotos mediante HTTPS (aunque SSH es más seguro)
* Desbloquear vaults de Ansible

:::tip
    Este tipo de secreto puede usarse como token de acceso personal (PAT) o como cadena secreta. Simplemente deje vacío el campo de inicio de sesión.
:::

### 3. Ninguno {#3-none}
Se usa como relleno para los repositorios que no requieren autenticación, como un repositorio de código abierto en GitLab.


## Almacenamientos de secretos {#secret-storages}

Semaphore UI admite distintos almacenamientos para los secretos. Puede elegir el almacenamiento de cada secreto al crearlo o editarlo.

Los almacenamientos externos se crean en la pestaña **Almacenamientos** del Almacén de claves (Pro). Cada almacenamiento tiene un nombre y un tipo; las claves hacen referencia después al almacenamiento y a la ruta del secreto dentro de él.

![Almacenamientos de secretos](/assets/key-store-storages.webp)

### Base de datos {#database}

De forma predeterminada, los secretos se guardan cifrados en la base de datos. La clave de cifrado se configura mediante la opción de configuración
`access_key_encryption` o `SEMAPHORE_ACCESS_KEY_ENCRYPTION` (debe generarse con `head -c32 /dev/urandom | base64`).

### Variable de entorno o archivo {#environment-variable-or-file}

Una clave puede leer su valor de una variable de entorno del servidor de Semaphore o de un archivo del servidor
(por ejemplo, una clave SSH montada en el contenedor). Las pestañas **Env** y **File** del formulario de la clave seleccionan este modo.

Los archivos deben estar dentro del directorio de secretos configurado (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, `/tmp/semaphore` de forma predeterminada),
y las claves SSH y de inicio de sesión con contraseña deben envolverse en un pequeño documento JSON.

[Más información...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

Los secretos pueden guardarse en una instancia externa de HashiCorp Vault en lugar de en la base de datos.

[Más información...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

Los secretos pueden guardarse en una instancia externa de [OpenBao](https://openbao.org) (una bifurcación de código abierto y compatible con la API de HashiCorp Vault).

[Más información...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

<Enterprise />

Los secretos pueden guardarse en AWS Secrets Manager. Autentíquese con un rol de IAM o un perfil de instancia, o con claves de acceso estáticas.

[Más información...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

Los secretos pueden guardarse en una instancia externa de Devolutions Server en lugar de en la base de datos.

[Más información...](/user-guide/key-store/devolutions-server)

## Sincronizar secretos desde almacenamientos remotos {#syncing-secrets-from-remote-storages}

Semaphore puede importar automáticamente secretos de un gestor de secretos externo (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault o Devolutions Server) y mantenerlos sincronizados. Las rutas de sincronización le permiten elegir qué secretos se importan y cómo se nombran.

[Más información...](/user-guide/key-store/secret-sync)
