---
title: Autenticación en dos pasos
description: Cómo funciona en Semaphore la autenticación en dos pasos con TOTP, cómo activarla en el servidor, configurarla para una cuenta, iniciar sesión con un código y recuperar el acceso.
---

# Autenticación en dos pasos

La autenticación en dos pasos (2FA) pide una segunda prueba después del primer paso del inicio
de sesión: un código de seis dígitos de una aplicación de autenticación en el teléfono del
usuario. Así, una contraseña robada no basta por sí sola para entrar.

Semaphore implementa el segundo factor con TOTP —contraseñas de un solo uso basadas en el
tiempo—, el estándar en el que se basan Google Authenticator, Microsoft Authenticator, Aegis,
1Password, Bitwarden y aplicaciones similares. Está disponible en todas las ediciones.

## Cómo funciona {#how-it-works}

Dos interruptores deciden si un inicio de sesión pide un código:

- **El servidor** debe permitir TOTP: la opción `mfa.totp.enabled`. Está desactivada de forma
  predeterminada.
- **La cuenta** debe tener TOTP configurado. Cada usuario lo activa para su propia cuenta; no
  se impone a todo el mundo.

Cuando ambos están activados, el inicio de sesión pasa por dos pasos:

1. El usuario inicia sesión como de costumbre: con una contraseña, mediante LDAP o a través de
   un proveedor de OpenID Connect. El segundo factor se aplica a los tres.
2. Semaphore abre una sesión, pero la marca como no verificada y pide el código. Hasta que se
   acepta el código, cualquier llamada a la API en esa sesión se rechaza con `401` y
   `{"error":"TOTP_REQUIRED"}`.
3. El usuario introduce el código que muestra la aplicación. Semaphore lo comprueba con el
   secreto almacenado para la cuenta; un código correcto verifica la sesión y el usuario entra.

El código cambia cada 30 segundos, y la aplicación lo calcula a partir de un secreto que recibió
una sola vez, al configurar la cuenta. Semaphore y el teléfono nunca se comunican entre sí, de
modo que el teléfono no necesita conexión de red, solo un reloj aproximadamente en hora.

## Activarla en el servidor {#turn-it-on-for-the-server}

Añada la sección `mfa.totp` al archivo de configuración y reinicie Semaphore:

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

Los mismos ajustes pueden indicarse como variables de entorno:

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| Opción | Variable de entorno | Efecto |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | Permite a los usuarios configurar TOTP y hace que el inicio de sesión pida el código. Sin ella, el ajuste no se muestra a nadie. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | Entrega a cada usuario un [código de recuperación](#recovery-code) de un solo uso al configurar TOTP y le permite iniciar sesión con él si pierde el teléfono. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | El nombre del emisor que una aplicación de autenticación muestra junto a la cuenta. El valor predeterminado es `Semaphore`. Un cambio solo se aplica a las cuentas configuradas después. |

Todas las opciones figuran también en la
[referencia de configuración](/reference/configuration).

## Configurar TOTP para su cuenta {#set-up-totp-for-your-account}

Instale primero una aplicación de autenticación en su teléfono. Después:

1. Abra un proyecto, haga clic en su nombre en la parte inferior de la barra lateral y elija
   **Edit Account**.
2. Abra la pestaña **Security**.
3. En **Two-factor authentication**, active **Time-based one-time password**. Semaphore crea el
   secreto al instante y lo muestra como código QR.
4. En la aplicación de autenticación, añada una cuenta y escanee el código QR. La aplicación
   empieza a mostrar un código de seis dígitos para `Semaphore` o para el nombre definido en
   `mfa.totp.app_name`.
5. Si aparece un **Recovery code** debajo del código QR, cópielo con el botón que tiene al lado
   y guárdelo en un lugar seguro: un gestor de contraseñas o en papel. Solo se muestra ahora.
6. Cierre el diálogo.

<div style={{maxWidth: 450}}>

![La pestaña Security del diálogo Edit User con la autenticación en dos pasos activada: un código QR para escanear y, debajo, un código de recuperación](/assets/two-factor-enrol.webp)

</div>

El interruptor surte efecto de inmediato; no hay que pulsar **Save** ni introducir ningún código
de prueba. Asegúrese de que la aplicación muestra un código para Semaphore antes de cerrar la
sesión: el siguiente inicio de sesión lo pedirá.

Más adelante puede volver a abrir la pestaña **Security** para escanear el código QR en un
segundo dispositivo. El código de recuperación no se vuelve a mostrar.

## Iniciar sesión con un código {#sign-in-with-a-code}

Después del paso de contraseña, LDAP o inicio de sesión único, Semaphore muestra
**Two-step verification**:

![La pantalla Two-step verification, que pide el código de seis dígitos de la aplicación de autenticación](/assets/two-factor-verify.webp)

Escriba los seis dígitos que muestra la aplicación en ese momento. El formulario se envía solo
tras el sexto dígito. Un código incorrecto o caducado muestra un error y le deja en la misma
pantalla; espere al siguiente código y vuelva a intentarlo.

**Return to login** abandona este inicio de sesión y empieza de nuevo.

## Usar el código de recuperación {#recovery-code}

Cuando el teléfono se pierde o se restablece, el código de recuperación permite al usuario
volver a entrar por su cuenta:

1. Inicie sesión con su contraseña como de costumbre.
2. En **Two-step verification**, haga clic en **Use recovery code**.
3. Introduzca el código de recuperación y haga clic en **Send**.

Semaphore inicia su sesión y **elimina TOTP de su cuenta**. Con ello se consume también el
código de recuperación. Vuelva a configurar TOTP de inmediato, como se describe
[más arriba](#set-up-totp-for-your-account), para obtener un secreto nuevo y un código de
recuperación nuevo.

**Use recovery code** solo aparece cuando el servidor tiene activada
`mfa.totp.allow_recovery`. Los códigos de recuperación tienen 16 caracteres y solo se almacenan
como hash bcrypt, por lo que nadie —administradores incluidos— puede volver a leer después el
código de un usuario.

## Eliminar el segundo factor {#remove-the-second-factor}

**Su propia cuenta.** Desactive **Time-based one-time password** en la pestaña **Security** de
**Edit Account**. TOTP se elimina al instante y el siguiente inicio de sesión pide solo el
primer paso. Borre también la entrada de Semaphore de su aplicación de autenticación; ya no
corresponde a nada.

**La cuenta de otra persona.** Un usuario que ha perdido el teléfono y no tiene código de
recuperación no puede eliminar TOTP por sí mismo. Un administrador, o un usuario cuyo rol global
permita gestionar usuarios, abre **Users**, edita a ese usuario y desactiva el interruptor en la
pestaña **Security**. El usuario inicia sesión solo con la contraseña y vuelve a configurar TOTP.

### Gestionar el segundo factor desde la línea de comandos {#manage-the-second-factor-from-the-command-line}

En el servidor, lo mismo puede hacerse sin la interfaz web, algo útil cuando el único
administrador ha perdido su teléfono:

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` configura TOTP para un usuario e imprime en el
terminal la URL `otpauth://`, un código QR y un código de recuperación; `show` imprime la URL y
el código QR de una configuración existente. Ambos imprimen el propio secreto, así que
ejecútelos solo donde nadie más pueda ver el terminal y entregue el código QR directamente a su
propietario. La sintaxis completa está en
[`semaphore users`](/reference/cli/users#totp-management).

## Desactivarla en el servidor {#turn-it-off-for-the-server}

Establezca `mfa.totp.enabled` en `false`, o elimine la sección, y reinicie. El inicio de sesión
deja entonces de pedir códigos y el ajuste **Two-factor authentication** desaparece de
**Security**.

No se elimina la configuración de nadie. Vuelva a activar la opción y cada cuenta que tenía TOTP
volverá a pedir su código, con el mismo secreto: no hace falta escanear nada otra vez.

## Lo que conviene saber {#things-to-know}

- **Los tokens de API omiten el segundo factor.** A una petición con un token
  `Authorization: Bearer` nunca se le pide un código. Un token solo puede crearse desde una
  sesión con el inicio de sesión completo, pero los tokens que ya existían antes de configurar
  TOTP siguen funcionando. Revíselos en la página **API Tokens** después de activar TOTP.
- **Semaphore no limita los intentos de introducir el código.** Seis dígitos son un espacio
  pequeño, así que aplique un límite de peticiones a `POST /api/auth/verify` y
  `POST /api/auth/recovery` en su [proxy inverso](/admin-guide/reverse-proxy).
- **El secreto se almacena tal cual en la base de datos.** Cualquiera que pueda leer la tabla
  `user__totp`, o una copia de seguridad de la base de datos, puede generar códigos válidos para
  todas las cuentas. Proteja las copias de seguridad como protege el archivo de configuración.
- **No se puede exigir TOTP.** Semaphore no tiene ninguna opción que obligue a los usuarios a
  configurarlo. Si su política exige un segundo factor para todos, impóngalo en su proveedor de
  identidad y haga que los usuarios inicien sesión mediante
  [OpenID Connect](/admin-guide/authentication/openid).

La configuración, la eliminación y el uso del segundo factor quedan registrados en el
[registro de auditoría](/admin-guide/audit-log) como eventos `iam.mfa` y `auth.mfa`; consulte
[Eventos de auditoría](/reference/audit-events) para ver la lista.

## Qué sigue {#whats-next}

- [Cuentas locales](/admin-guide/authentication/local): contraseñas, duración de la sesión y
  desactivación del inicio de sesión con contraseña.
- [Seguridad](/admin-guide/security): parámetros de hash, cifrado y fortalecimiento.
- [`semaphore users`](/reference/cli/users#totp-management): los comandos de TOTP.
