---
title: "Almacenamiento de secretos en OpenBao"
---

# Almacenamiento de secretos en OpenBao <Pro />

Semaphore UI admite [OpenBao](https://openbao.org) como almacenamiento de secretos.

OpenBao es un fork de código abierto de HashiCorp Vault y es compatible con su API, por lo que el almacenamiento funciona exactamente igual que el [almacenamiento de HashiCorp Vault](/user-guide/key-store/hashicorp-vault).

Puede proporcionar las siguientes opciones:
- **URL del servidor** — dirección de su servidor OpenBao.
- **Mount** — ruta de montaje del motor de secretos KV v2 (`secret` de forma predeterminada).
- **Namespace** — namespace de OpenBao (v2.3+), opcional.
- **Token** — token de autenticación. El token puede:
    - Guardarse en la base de datos.
    - Proporcionarse mediante una variable de entorno.
    - Proporcionarse mediante un archivo.
      :::warning
      Cuando el token proviene de un **archivo**, ese archivo debe estar **dentro** del directorio de secretos que usa Semaphore. Configure ese directorio mediante `dirs.secrets` o la variable de entorno `SEMAPHORE_SECRETS_PATH`. La opción heredada de nivel superior `secrets_path` sigue aceptándose para configuraciones antiguas. Si no se establece ninguna, el valor predeterminado es `/tmp/semaphore`. Consulte [Directorio de secretos](/admin-guide/configuration/config-file#secrets-directory) para conocer los detalles de precedencia.
      :::

El almacenamiento puede funcionar en modo de solo lectura.

## Cómo usarlo {#how-to-use}

1. En su proyecto, abra **Almacén de claves** → **Almacenamientos** y cree un nuevo almacenamiento **OpenBao** (URL, ruta de montaje y token).
2. Al crear o editar una clave en el Almacén de claves, seleccione su almacenamiento OpenBao como tipo de almacenamiento.
3. Proporcione la ruta del secreto en OpenBao donde debe guardarse la credencial.

## Sincronización de secretos {#syncing-secrets}

Los secretos guardados en OpenBao pueden importarse automáticamente al Almacén de claves y mantenerse sincronizados, del mismo modo que con otros almacenamientos externos. Consulte [Sincronización de secretos desde almacenamientos remotos](/user-guide/key-store/secret-sync).

## Grupos de variables {#variable-groups}

OpenBao también puede usarse como almacenamiento para los [grupos de variables](/user-guide/environment). Al editar un grupo de variables, seleccione su almacenamiento OpenBao como tipo de almacenamiento y especifique la ruta de la carpeta donde se guardarán los secretos.
