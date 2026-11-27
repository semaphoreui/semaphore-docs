---
title: Cuentas locales
description: Inicio de sesión con contraseña contra la base de datos de Semaphore - cómo se almacenan las contraseñas, la gestión de cuentas, la duración de la sesión y cómo desactivar las contraseñas.
---

# Cuentas locales

Una cuenta local guarda su contraseña en la base de datos de Semaphore. Toda instalación
empieza con una, creada por `semaphore setup` o por las variables `SEMAPHORE_ADMIN_*`, y esa
cuenta es la forma de acceder al servidor antes de que exista ningún proveedor de identidad.

Conserve al menos un administrador local incluso después de que funcione el inicio de sesión
único. Es la única manera de volver a entrar cuando el proveedor de identidad no está
disponible.

## Cómo se almacenan las contraseñas {#how-passwords-are-stored}

Las contraseñas se cifran con **Argon2id** usando los parámetros de robustez mínima de OWASP, y
los parámetros se registran junto a cada hash en
[formato de cadena PHC](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).
Las versiones anteriores a la 2.20 usaban bcrypt; esos hashes siguen funcionando y cada uno se
sustituye por un hash Argon2id en el siguiente inicio de sesión correcto de su propietario. Las
cuentas que no vuelvan a iniciar sesión mantienen su hash bcrypt, así que restablezca esas
contraseñas para actualizarlas.

La tabla completa de parámetros está en [Seguridad](/admin-guide/security#password-hashing).

Semaphore no impone una política de contraseñas: ni longitud mínima, ni complejidad, ni
caducidad. Si necesita una, utilice un directorio o un proveedor de identidad, que es donde
corresponden esas políticas.

## Gestionar cuentas {#manage-accounts}

Los administradores gestionan los usuarios en la interfaz web, y las mismas operaciones existen
en la línea de comandos para automatizar con scripts y para recuperar el acceso cuando nadie
puede iniciar sesión:

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

Consulte [`semaphore users`](/reference/cli/users) para conocer todas las opciones, y
[Equipos](/user-guide/team) para saber qué permite hacer cada rol una vez dentro.

:::warning
Una contraseña escrita en la línea de comandos queda en el historial del intérprete de comandos
y en la lista de procesos de la máquina. Úsela para el primer administrador y para la
recuperación, y cambie después la contraseña desde la interfaz web.
:::

## Autenticación en dos pasos {#two-factor-authentication}

Una cuenta local puede pedir un segundo factor después de la contraseña: un código TOTP de
seis dígitos de una aplicación de autenticación. Está desactivado de forma predeterminada, se
activa para el servidor con `mfa.totp.enabled` y cada usuario lo configura para su propia
cuenta. Cómo funciona, cómo activarlo, cómo iniciar sesión con un código y cómo recuperar el
acceso tras perder el teléfono se describe en
[Autenticación en dos pasos](/admin-guide/authentication/two-factor).

## Duración de la sesión {#session-lifetime}

Dos límites independientes terminan una sesión; el primero que se alcance cierra la sesión del
usuario.

El **tiempo de espera por inactividad** se cuenta desde la última petición. Cada petición
autenticada, incluido el sondeo en segundo plano de una pestaña abierta del navegador, lo
reinicia. El valor predeterminado es de 168 horas (siete días):

```json
{
  "auth": {
    "session_inactivity_hours": 8
  }
}
```

El **límite absoluto** se mide desde el momento del inicio de sesión y no desde la última
petición, de modo que también termina una sesión en uso activo:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

El valor predeterminado, `0`, significa que no hay límite absoluto. Establézcalo cuando un
puesto de trabajo compartido o una norma de cumplimiento exijan que las personas se vuelvan a
autenticar de forma periódica. Un navegador que se deja abierto en una página que sondea la API
mantiene la sesión activa, por lo que solo el límite absoluto termina de forma fiable una sesión
así.

## Desactivar el inicio de sesión con contraseña {#turn-password-sign-in-off}

Una vez configurado un proveedor de identidad y verificado que un usuario real puede iniciar
sesión a través de él, `password_login_disable` rechaza por completo el método de contraseña:

```json
{
  "password_login_disable": true
}
```

LDAP y OpenID Connect no se ven afectados. Las cuentas locales existentes conservan sus roles y
su historial; simplemente no tienen forma de autenticarse.

:::danger
Esta opción se aplica de inmediato y afecta a todas las cuentas locales, incluida la suya.
Confirme que el inicio de sesión único funciona —iniciando sesión con él, no leyendo el
registro— antes de establecerla. Recuperarse de un error implica editar el archivo de
configuración en el servidor y reiniciar.
:::

## Qué sigue {#whats-next}

- [LDAP y Active Directory](/admin-guide/authentication/ldap): autenticar contra un directorio.
- [OpenID Connect](/admin-guide/authentication/openid): inicio de sesión único con un proveedor de identidad.
- [Autenticación en dos pasos](/admin-guide/authentication/two-factor): pedir un código TOTP después de la contraseña.
- [Seguridad](/admin-guide/security): parámetros de hash, cifrado y fortalecimiento.
