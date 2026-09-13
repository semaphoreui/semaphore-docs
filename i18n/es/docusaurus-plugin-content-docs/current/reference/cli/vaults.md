# Vaults

El comando `semaphore vault` gestiona el cifrado de los secretos que Semaphore
almacena en la base de datos: los **secretos de las claves de acceso** (claves SSH, pares de usuario/contraseña,
cadenas secretas) y la **clave de firma JWT**.

```bash
semaphore vault --help
```

> `vault` es un alias de `vaults`.

Tiene dos subcomandos:

| Comando | Propósito |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | Vuelve a cifrar todos los secretos almacenados con la clave de cifrado activa. |
| [`vault check`](#checking-key-usage-vault-check) | Informa de qué id de clave cifra cada secreto almacenado (solo lectura). |

Para saber cómo se configuran y rotan las claves de cifrado, consulte
[Claves de cifrado](/admin-guide/security/encryption).

## Volver a cifrar los secretos (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

Vuelve a cifrar todos los secretos almacenados localmente (los secretos de las claves de acceso y la clave de firma
JWT) con la clave de cifrado **activa**, estampando el id de esa clave en cada
valor. Los secretos respaldados por un almacenamiento externo de secretos se omiten (no están
cifrados con el conjunto de claves de Semaphore).

```bash
semaphore vault rekey
```

### Rotación de claves sin tiempo de inactividad {#zero-downtime-key-rotation}

La clave activa cifra las nuevas escrituras; el resto de claves del conjunto pueden seguir
descifrando los datos antiguos. Por tanto, la rotación consiste en: añadir una clave, cambiar el puntero activo,
volver a cifrar en segundo plano y, por último, eliminar la clave antigua.

1. Añada una nueva clave al conjunto de claves (un archivo en `keys_folder`, o una entrada en `keys:`) y
   apunte el puntero activo (`active.secret_key`, o `secret_key_file`) hacia ella.
   El cambio se aplica dentro de `keys_poll_interval` (predeterminado `15s`), o
   inmediatamente con `kill -HUP <pid>`; no es necesario reiniciar.
2. Ejecute `semaphore vault rekey` para volver a cifrar los datos existentes con la nueva clave.
3. Ejecute [`semaphore vault check`](#checking-key-usage-vault-check); cuando la clave
   antigua muestre `0 rows`, podrá eliminarla del conjunto de claves de forma segura.

### Opciones {#options}

| Opción | Descripción |
|------|-------------|
| `--old-key <key>` | Clave de cifrado antigua explícita para una migración heredada de clave única. No es necesaria cuando la clave antigua ya está en el conjunto de claves como secundaria. Se usa para descifrar datos heredados sin prefijo que no tienen id de clave estampado. |
| `--backup <file>` | Escribe en `<file>` una copia de seguridad de los textos cifrados actuales de las claves de acceso antes de volver a cifrar. |
| `--rollback <file>` | Restaura los textos cifrados de las claves de acceso desde un archivo de copia de seguridad en lugar de volver a cifrar. |

### Copia de seguridad y restauración {#backup-and-rollback}

Tome una instantánea de los textos cifrados actuales antes de volver a cifrar, y restáurela
si algo sale mal:

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

La copia de seguridad es un archivo JSON Lines, con una entrada por clave de acceso (`project_id`,
`key_id`, `secret`). Una restauración vuelve a escribir esos textos cifrados tal cual.

### Migración heredada de clave única {#legacy-single-key-migration}

Si sus datos fueron cifrados por una versión antigua de Semaphore que usaba la clave única
`access_key_encryption` (sin rotación, sin id de clave estampado), pase esa clave
explícitamente para que puedan descifrarse antes de volver a cifrarse con la clave activa:

```bash
semaphore vault rekey --old-key <base64-old-key>
```

Esto deja de ser necesario una vez que la clave antigua forma parte del conjunto de claves: Semaphore busca cada
valor por su id estampado y lo descifra automáticamente con la clave correspondiente.

## Comprobar el uso de las claves (`vault check`) {#checking-key-usage-vault-check}

Solo lectura. Informa, por id de clave, de cuántos secretos de claves de acceso almacenados localmente (y
la clave de firma JWT) cifra esa clave, además del estado de la clave de firma JWT. Ejecútelo
después de `vault rekey` para confirmar que una clave retirada puede eliminarse de forma segura: una clave con cero
referencias puede borrarse del conjunto de claves.

```bash
semaphore vault check
```

Ejemplo de salida:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

Cada id de clave se muestra con uno de los siguientes estados:

| Estado | Significado |
|--------|---------|
| `active` | La clave cifra actualmente las nuevas escrituras. |
| `retired, rekey pending` | La clave todavía cifra algunas filas; ejecute `vault rekey` para moverlas a la clave activa. |
| `retired, SAFE TO REMOVE` | Ninguna fila hace referencia a la clave (`0 rows`); puede eliminarse del conjunto de claves. |
| `legacy (no id)` | Filas cifradas antes de que existieran los ids de clave; vuelva a cifrar para estampar un id. |
| `MISSING KEY (cannot decrypt)` | Un id de clave referenciado no está presente en el conjunto de claves. |

La última línea indica qué clave cifra la clave de firma JWT, o
`JWT signing key: not set` si todavía no se ha generado ninguna.

Si algún secreto hace referencia a un id de clave que falta en el conjunto de claves, el comando
marca esas filas y **termina con un estado distinto de cero**; vuelva a añadir la clave que falta
al conjunto de claves para que esos datos puedan descifrarse.
