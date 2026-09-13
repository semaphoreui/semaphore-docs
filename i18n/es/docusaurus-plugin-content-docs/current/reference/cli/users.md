# Usuarios

El comando `semaphore users` añade, modifica, elimina e inspecciona usuarios, y
gestiona sus tokens de API y la verificación TOTP (2FA).

```bash
semaphore users --help
```

> `user` es un alias de `users`.

| Comando | Propósito |
|---------|---------|
| [`users add`](#add-a-user) | Crea un usuario. |
| [`users change-by-login`](#change-a-user) | Actualiza un usuario localizado por su login. |
| [`users change-by-email`](#change-a-user) | Actualiza un usuario localizado por su correo electrónico. |
| [`users get`](#show-a-user) | Muestra los detalles de un usuario. |
| [`users list`](#list-users) | Muestra los logins de todos los usuarios. |
| [`users delete`](#delete-a-user) | Elimina un usuario. |
| [`users token create`](#create-a-token) | Crea un token de API para un usuario. |
| [`users token list`](#list-tokens) | Lista los tokens de API de un usuario. |
| [`users totp enable`](#totp-management) | Habilita TOTP para un usuario. |
| [`users totp show`](#totp-management) | Muestra los detalles TOTP de un usuario. |
| [`users totp disable`](#totp-management) | Deshabilita TOTP para un usuario. |

## Añadir un usuario {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Opción | Descripción |
|------|-------------|
| `--login` | Login del usuario. **Obligatorio.** |
| `--name` | Nombre visible del usuario. **Obligatorio.** |
| `--email` | Correo electrónico del usuario. **Obligatorio.** |
| `--password` | Contraseña del usuario. Obligatoria para usuarios normales; no permitida para usuarios externos. |
| `--admin` | Marca el nuevo usuario como administrador. |
| `--external` | Marca el nuevo usuario como externo (LDAP u OIDC). A los usuarios externos no se les debe indicar `--password`. |

Si tiene éxito, el comando muestra `User <login> <email> added!`.

## Modificar un usuario {#change-a-user}

Puede localizar el usuario que desea modificar por su login o por su correo electrónico.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| Opción | Descripción |
|------|-------------|
| `--login` | Para `change-by-login`, el login del usuario que se va a localizar (**obligatorio**). Para `change-by-email`, el nuevo login del usuario. |
| `--email` | Para `change-by-email`, el correo electrónico del usuario que se va a localizar (**obligatorio**). Para `change-by-login`, el nuevo correo electrónico del usuario. |
| `--name` | Nuevo nombre del usuario. |
| `--password` | Nueva contraseña del usuario. |
| `--admin` | Concede permisos de administrador. |

Solo se aplican las opciones que proporcione; los campos omitidos se dejan sin cambios.
`--admin` solo puede conceder permisos de administrador. No puede revocarlos; para ello use
la interfaz web.

## Mostrar un usuario {#show-a-user}

Muestra los detalles de un único usuario, localizado por login o correo electrónico.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

Se requiere al menos una de las opciones `--login` o `--email`. La salida incluye el
ID del usuario, la fecha de creación, el login, el nombre, el correo electrónico y si es administrador. Si ningún usuario
coincide, el comando muestra un mensaje y termina con un estado distinto de cero.

## Listar usuarios {#list-users}

Muestra los logins de todos los usuarios, uno por línea.

```bash
semaphore user list
```

## Eliminar un usuario {#delete-a-user}

Elimina un usuario, localizado por login o correo electrónico.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

Se requiere al menos una de las opciones `--login` o `--email`.

## Gestión de tokens de API {#api-token-management}

Gestione los tokens de API de un usuario desde la CLI:

```bash
semaphore user token --help
```

### Crear un token {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Opción | Descripción |
|------|-------------|
| `--login` | Login del propietario del token. **Obligatorio.** |
| `--name` | Nombre del token. |
| `--ttl` | Duración del token como duración de Go (p. ej. `1h`, `30m`, `24h`). Si se omite, el token nunca expira. |

El comando muestra el nuevo token en su propia línea y nada más, por lo que es seguro
capturarlo en un script:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

Un valor de `--ttl` no válido o un login desconocido se notifican y el comando termina
con un estado distinto de cero.

### Listar tokens {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` es obligatorio. Cada línea muestra el nombre del token, su estado (`active` o
`expired`) y su fecha de expiración en formato RFC 3339 (`never` si no
expira), separados por tabuladores. Los valores de los tokens nunca se muestran.

## Gestión de TOTP {#totp-management}

Gestione la verificación mediante contraseñas de un solo uso basadas en tiempo (2FA) desde la CLI:

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

Todos los subcomandos de TOTP requieren `--login`.

- `enable` muestra un código de recuperación de un solo uso, la URL `otpauth://` y un
  código QR escaneable. Guarde el código de recuperación en un lugar seguro. Falla si TOTP
  ya está habilitado para el usuario.
- `show` vuelve a mostrar la URL `otpauth://` y el código QR, o `TOTP disabled` si
  el usuario no tiene TOTP configurado.
- `disable` elimina la verificación TOTP del usuario. Falla si TOTP no está
  habilitado.

El emisor que se muestra en las aplicaciones de autenticación se toma de la opción de configuración
`mfa.totp.app_name` (`SEMAPHORE_TOTP_ISSUER`). Su valor predeterminado es `Semaphore`.
