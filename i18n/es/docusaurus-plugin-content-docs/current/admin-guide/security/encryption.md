---
id: encryption
title: Claves de cifrado
sidebar_label: Claves de cifrado
description: Cómo Semaphore cifra los secretos, configura las claves de cifrado y las rota sin tiempo de inactividad.
---

# Claves de cifrado

Semaphore cifra los datos más sensibles que almacena — los **secretos de las claves de acceso**
(claves privadas SSH, pares de usuario/contraseña, cadenas secretas) y la **clave de firma
JWT** — mediante AES‑256‑GCM. Esta página explica cómo configurar esas claves, cómo
funciona la rotación y cómo operarla de forma segura.

:::info Dos claves, dos propósitos

| Clave | Protege | Puntero activo |
|-----|----------|----------------|
| **Clave de secretos** | Secretos de las claves de acceso almacenados en la base de datos | `active.secret_key` |
| **Clave de opciones** | Opciones cifradas de la BD (la clave de firma JWT) | `active.option_key` |

Si no se configura ninguna clave de opciones, las opciones recurren a la clave de secretos.
:::

---

## Inicio rápido {#quick-start}

La configuración más sencilla es una única clave indicada en la configuración principal:

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

Genere una clave con:

```bash
openssl rand -base64 32
```

Eso es todo: Semaphore ahora cifra los secretos con `key1`. La misma clave se usa para
la clave de firma JWT (las opciones recurren a la clave de secretos).

:::tip Producción
Prefiera las **referencias `file:`** o una **`keys_folder`** (ver más abajo) en lugar de
`value:` inline, de modo que el material de la clave resida en un secreto montado y no en la configuración.
:::

---

## Cómo se identifican las claves {#how-keys-are-identified}

Cada clave tiene un **identificador de clave** derivado del propio material de la clave: una huella,
`base64url(sha256(key))[:8]`. El identificador (no la clave) se almacena junto a cada
valor cifrado, de modo que el descifrado es una búsqueda directa de la clave exacta que lo escribió.

Esto significa que:

- **Las etiquetas pueden renombrarse libremente.** `key1`, `secrets_key_primary.txt`: son
  para las personas. La base de datos nunca las almacena, solo la huella.
- **Una clave nunca puede apuntar a datos equivocados.** Cambie los bytes de una clave y se convierte en un *nuevo*
  identificador; los datos antiguos siguen haciendo referencia al identificador antiguo.
- **Eliminar una clave falla de forma explícita**, no silenciosa: un identificador de clave ausente es un
  error explícito, nunca una salida corrupta.

Nunca establece los identificadores a mano; Semaphore los calcula.

---

## El archivo de claves {#the-keys-file}

`encryption.keys_file` apunta a un archivo cuyo contenido es un **registro de claves**
más **punteros** a la clave activa para cada propósito. Se analiza como **YAML o JSON,
independientemente de la extensión del archivo**.

Hay dos formas de proporcionar el registro: un mapa inline, una carpeta de archivos, o
ambas combinadas.

### Mapa inline {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

Cada entrada es un [`KeySource`](#keysource): o bien `value` (base64 inline) **o bien**
`file` (ruta a un archivo que contiene la clave en base64), nunca ambos.

### Carpeta de archivos de claves {#folder-of-key-files}

Apunte `keys_folder` a un directorio; **cada archivo regular es una clave**, etiquetada con
su nombre de archivo. Ideal para secretos montados de Docker/Kubernetes.

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Compatible con Kubernetes
`keys_folder` omite las entradas que empiezan por punto (`..data`, `..2024_*`) y sigue
los enlaces simbólicos, por lo que funciona directamente con la forma en que Kubernetes monta los volúmenes
`Secret`/`ConfigMap`.
:::

### Combinado {#combined}

`keys` y `keys_folder` se fusionan en un único registro; `active` puede apuntar por etiqueta
*o* por nombre de archivo:

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## Rotación (sin tiempo de inactividad) {#rotation-zero-downtime}

La clave activa cifra las escrituras **nuevas**; todas las demás claves del registro aún pueden
**descifrar** los datos antiguos. Por tanto, la rotación consiste en: añadir una clave, cambiar el puntero,
volver a cifrar en segundo plano y, después, retirar la clave antigua.

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

No se necesita reiniciar el proceso en ningún paso.

### Aplicar cambios sin reiniciar {#applying-changes-without-a-restart}

Semaphore vuelve a leer el archivo de claves (y los archivos de claves a los que hace referencia) e intercambia las
claves en memoria de forma atómica. Dos desencadenantes:

| Desencadenante | Comportamiento |
|---------|-----------|
| **Observador de archivos** | Sondea cada `encryption.keys_poll_interval` (por defecto `15s`). Establézcalo en `"0"` para desactivarlo. |
| **`SIGHUP`** | `kill -HUP <pid>` fuerza una recarga inmediata (solo Unix). |

:::caution Windows
Windows no tiene `SIGHUP`. Confíe en el **sondeador** (la opción predeterminada), que funciona en todas las
plataformas, o reinicie el servicio.
:::

Una recarga valida primero las nuevas claves y, ante cualquier error, deja intactas las claves
en ejecución.

---

## Comandos CLI {#cli-commands}

### `vault check` {#vault-check}

Solo lectura. Informa, por identificador de clave, de cuántos secretos almacenados cifra, para que pueda
ver qué hay en la clave activa y qué es seguro eliminar.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

Estados: `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)` y `MISSING KEY` (una clave referenciada está ausente; código de salida 1).

### `vault rekey` {#vault-rekey}

Vuelve a cifrar todos los secretos almacenados (y la clave de firma JWT) con la clave activa.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## Compatibilidad con versiones anteriores {#backward-compatibility}

La actualización es segura y **no requiere migración de datos**:

- Las instalaciones existentes que establecen **`access_key_encryption`** (o la
  variable de entorno `SEMAPHORE_ACCESS_KEY_ENCRYPTION`) siguen funcionando sin cambios: esa clave
  plana se convierte en la clave de secretos activa.
- Los datos escritos por versiones anteriores de Semaphore (sin identificador de clave) siguen descifrándose. En su siguiente escritura,
  o tras `vault rekey`, se vuelven a marcar con un identificador de clave.
- **Sin ningún cifrado** (ninguna clave configurada) se siguen almacenando los secretos como
  base64 plano y se descifran de la misma manera.

Para migrar una instalación antigua de clave única a un archivo de claves, basta con incluir la clave antigua
en el registro:

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

Los datos antiguos se descifran mediante `old`; ejecute `vault rekey` para mover todo a `new`.

---

## Kubernetes y Docker {#kubernetes--docker}

Monte sus claves como un volumen `Secret` y apunte `keys_folder` a él:

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

Cuando actualiza el `Secret`, Kubernetes refresca los archivos montados y el
sondeador aplica el cambio dentro de `keys_poll_interval`, sin reiniciar el pod.

---

## Buenas prácticas de seguridad {#security-best-practices}

:::danger Proteja el archivo de claves
- Restrinja los permisos: `chmod 0400`, propiedad del usuario del servicio de Semaphore.
- **Nunca confirme claves reales** en el control de versiones: añada el archivo a `.gitignore`.
- Haga copias de seguridad de forma segura. **Perder todas las claves significa perder todos los datos cifrados.**
- Prefiera los secretos montados (`file:` / `keys_folder`) en lugar de `value:` inline, y las variables
  de entorno antes que ninguno de ellos: `value:` mantiene la clave en el archivo de configuración.
:::

---

## Referencia {#reference}

### `encryption` (configuración principal) {#encryption-main-config}

| Campo | Variable de entorno | Valor predeterminado | Descripción |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | Ruta al archivo de claves (YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | Frecuencia con la que se sondea el archivo de claves. `"0"` desactiva el sondeo. |

### Claves planas heredadas (configuración principal) {#legacy-flat-keys-main-config}

| Campo | Variable de entorno | Descripción |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | Clave de secretos única, sin rotación. Se usa cuando `keys_file` no está definido. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | Clave de opciones única, sin rotación. Recurre a la clave de secretos. |

### Archivo de claves {#keys-file}

| Campo | Descripción |
|-------|-------------|
| `keys` | Mapa de `label → KeySource` (registro inline). |
| `keys_folder` | Directorio de archivos de claves (un archivo regular por clave, etiquetado con el nombre de archivo). |
| `active.secret_key` | Etiqueta (en `keys`) de la clave de secretos activa. |
| `active.option_key` | Etiqueta de la clave de opciones activa. |
| `active.secret_key_file` | Nombre de archivo en `keys_folder` de la clave de secretos activa (relativo). |
| `active.option_key_file` | Nombre de archivo en `keys_folder` de la clave de opciones activa (relativo). |

### KeySource {#keysource}

| Campo | Descripción |
|-------|-------------|
| `value` | Material de clave en base64 inline. |
| `file` | Ruta a un archivo que contiene la clave en base64. |

`value` y `file` son mutuamente excluyentes. Las claves deben ser base64 de **16, 24 o 32
bytes** (AES‑128/192/256).

---

## Solución de problemas {#troubleshooting}

| Síntoma | Causa / solución |
|---------|-------------|
| Pánico al arrancar: `encryption_keys… not found` / `invalid` | El archivo de claves o un archivo de clave referenciado falta o está mal formado, o una clave no es base64 válido de 16/24/32 bytes. Corrija el archivo; el arranque falla rápidamente a propósito. |
| `vault check` muestra `MISSING KEY <id>` (salida 1) | Los datos se cifraron con una clave que ya no está en el registro. Vuelva a añadir esa clave para poder descifrarlos. |
| `cannot decrypt access key, perhaps encryption key was changed` | Un valor heredado (sin prefijo) no puede descifrarse con ninguna clave configurada. Asegúrese de que la clave original esté presente (en el registro o en `access_key_encryption`). |
| La rotación no se aplica | Compruebe `keys_poll_interval` (que no sea `"0"`) y que el archivo de claves haya cambiado realmente; o envíe `SIGHUP`. |
| `active.secret_key: no key labelled "…"` | El puntero activo nombra una etiqueta/nombre de archivo que no está en `keys`/`keys_folder`. |
