---
title: Almacenamiento de secretos de CyberArk
description: Opción Enterprise para leer y almacenar secretos de Key Store en CyberArk Privileged Access Manager a través de la API REST de PVWA.
sidebar_custom_props:
  edition: pro
---

# Almacenamiento de secretos de CyberArk <Enterprise />

Semaphore UI Enterprise puede usar **CyberArk Privileged Access Manager** (PAM Self-Hosted o Privilege Cloud) como almacenamiento externo para los secretos de Key Store en lugar de la base de datos. Semaphore se comunica con la API REST de Password Vault Web Access (PVWA): cada clave de Semaphore se asigna a una **cuenta** de CyberArk dentro de una **Safe**.

## Opciones de configuración {#configuration-options}

Cuando cree un almacenamiento **CyberArk** en **Key Store → Storages**, configure:

| Campo | Descripción |
|-------|-------------|
| **URL del servidor** | Dirección base de PVWA, por ejemplo `https://pvwa.example.com`. Se acepta una barra final `/PasswordVault`. Requerido. |
| **Omitir verificación del certificado TLS** | Deshabilita la validación del certificado. Solo para entornos de prueba. |
| **Método de autenticación** | Método de inicio de sesión de PVWA para el usuario de Semaphore: `CyberArk` (predeterminado), `LDAP`, `RADIUS` o `Windows`. |
| **Nombre de usuario** | El usuario de PVWA con el que inicia sesión Semaphore. Requerido. |
| **Contraseña** | Contraseña de ese usuario. Se puede almacenar en la base de datos, leer de una variable de entorno o cargar desde un archivo. |
| **Safe predeterminada** | Safe utilizada cuando una clave hace referencia a una cuenta sin prefijo de Safe y ruta de sincronización predeterminada. |
| **ID de plataforma para nuevas cuentas** | Plataforma asignada a las cuentas que Semaphore crea (por ejemplo `UnixSSH`). Requerido solo cuando el almacenamiento no es de solo lectura y crea claves desde Semaphore. |
| **Dirección para nuevas cuentas** | Propiedad de dirección opcional para las cuentas que crea Semaphore. Algunas plataformas lo requieren. |

El almacenamiento puede funcionar en modo de solo lectura. En ese modo, Semaphore solo lee y sincroniza cuentas y nunca crea, actualiza ni elimina nada en el Vault.

### Permisos de PVWA requeridos {#required-pvwa-permissions}

Otorgue al usuario de Semaphore los siguientes permisos en cada Safe que utilice:

| Operación | Permisos de Safe |
|-----------|------------------|
| Leer una clave, sincronización | **Listar cuentas**, **Recuperar cuentas** |
| Crear una clave desde Semaphore | **Agregar cuentas** |
| Actualizar una clave desde Semaphore | **Actualizar valor de contraseña**, **Actualizar propiedades de cuenta** |
| Eliminar una clave desde Semaphore | **Eliminar cuentas** |

Semaphore siempre solicita una sesión concurrente de PVWA (`concurrentSession`), por lo que varios nodos de Semaphore o una tarea en ejecución y una sincronización programada pueden compartir el mismo usuario sin desconectarse entre sí. Esto requiere PVWA 11.3 o posterior.

:::warning
No habilite "solicitar motivo" ni integración con sistemas de tickets para las Safes utilizadas por Semaphore. Semaphore envía un motivo fijo pero no puede proporcionar números de ticket.
:::

## Cómo usar {#how-to-use}

1. En su proyecto, abra **Key Store → Storages** y cree un almacenamiento **CyberArk**.
2. Al crear o editar una clave, seleccione ese almacenamiento e ingrese la cuenta como `Safe/AccountName`. El nombre de cuenta es el nombre de objeto que se muestra en PVWA. Si el almacenamiento tiene una Safe predeterminada, basta con `AccountName`.
3. Opcionalmente configure [rutas de sincronización](/user-guide/key-store/secret-sync) para importar Safes completas automáticamente de forma programada.

### Mapeo de tipos de claves {#key-type-mapping}

| Tipo de clave de Semaphore | Cuenta de CyberArk |
|----------------------------|--------------------|
| **Inicio de sesión con contraseña** | Cuenta de contraseña: `userName` se convierte en el login, el secreto de la cuenta en la contraseña. |
| **SSH** | Cuenta de clave (`secretType: key`): `userName` se convierte en el login, el secreto de la cuenta es la clave privada. Las claves SSH con frase de contraseña no se pueden almacenar en CyberArk. |
| **Secreto / cadena** | Cuenta de contraseña sin nombre de usuario. El secreto de la cuenta se utiliza tal cual. |

Cuando Semaphore crea una cuenta, la administración automática por parte de Central Policy Manager (CPM) se desactiva para que CyberArk no rote un secreto recién escrito por Semaphore. Si desea que CyberArk rote la credencial, administre la cuenta desde PVWA y marque el almacenamiento como de solo lectura en Semaphore.

## Sincronización de secretos {#syncing-secrets}

Una ruta de sincronización es el nombre de una Safe. Semaphore importa cada cuenta de la Safe como una clave nombrada según la cuenta (con el prefijo opcional). El tipo de clave se detecta a partir de la cuenta: las cuentas de clave se convierten en claves SSH, las cuentas de contraseña con nombre de usuario en claves de inicio de sesión con contraseña y las cuentas sin nombre de usuario en secretos simples. Consulte [Sincronización de secretos desde almacenamientos remotos](/user-guide/key-store/secret-sync).
