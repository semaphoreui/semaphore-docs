---
title: "Almacenamiento de secretos en HashiCorp Vault"
---

# Almacenamiento de secretos en HashiCorp Vault <Pro />

Semaphore UI admite HashiCorp Vault como almacenamiento de secretos.

![](/assets/vault1.webp)

Puede proporcionar las siguientes opciones:
- **URL de HashiCorp Vault** — dirección de su servidor Vault.
- **Mount** — ruta de montaje del motor de secretos.
- **Token** — token de autenticación. El token puede:
    - Guardarse en la base de datos.
    - Proporcionarse mediante una variable de entorno.
    - Proporcionarse mediante un archivo (útil para Vault Agent).
      :::warning
      Cuando el token proviene de un **archivo**, ese archivo debe estar **dentro** del directorio de secretos que usa Semaphore. Configure ese directorio mediante `dirs.secrets` o la variable de entorno `SEMAPHORE_SECRETS_PATH`. La opción heredada de nivel superior `secrets_path` sigue aceptándose para configuraciones antiguas. Si no se establece ninguna, el valor predeterminado es `/tmp/semaphore`. Consulte [Directorio de secretos](/admin-guide/configuration/config-file#secrets-directory) para conocer los detalles de precedencia.

      Fragmento de `config.json` de ejemplo:

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

El almacenamiento puede funcionar en modo de solo lectura.

## Cómo usarlo {#how-to-use}

1. Configure la conexión con HashiCorp Vault en los ajustes de Semaphore (URL, ruta de montaje y token).
2. Al crear o editar una clave en el Almacén de claves, seleccione **HashiCorp Vault** como tipo de almacenamiento.
3. Proporcione la ruta del secreto en Vault donde debe guardarse la credencial.

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

En lugar de guardar el token de Vault directamente, puede usar [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) para gestionar automáticamente la obtención y renovación del token.

Vault Agent se ejecuta como proceso sidecar junto a Semaphore y escribe un token válido en un archivo en disco. Semaphore lee entonces el token desde ese archivo.

Para configurarlo:

1. Configure y ejecute Vault Agent con un [método de auto-auth](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) adecuado (p. ej., AppRole, Kubernetes, AWS IAM).
2. Configure Vault Agent para que escriba el token en un archivo mediante un bloque `sink`, por ejemplo:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. En Semaphore, al configurar la conexión con HashiCorp Vault, seleccione **Archivo** como origen del token y proporcione la ruta al archivo del token (p. ej., `/etc/vault/token`).

Este enfoque evita los tokens estáticos de larga duración y permite que Vault Agent gestione automáticamente la autenticación y la renovación del token.


## Grupos de variables {#variable-groups}

HashiCorp Vault también puede usarse como almacenamiento para los [grupos de variables](/user-guide/environment). Al editar un grupo de variables, seleccione **HashiCorp Vault** como tipo de almacenamiento y especifique la ruta de la carpeta donde se guardarán los secretos.

![](/assets/vault3.webp)
