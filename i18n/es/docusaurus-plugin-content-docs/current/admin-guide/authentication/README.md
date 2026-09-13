---
title: Autenticación
description: Las tres formas en que los usuarios inician sesión en Semaphore - cuentas locales, LDAP y OpenID Connect -, cómo se combinan y cómo se vinculan las identidades.
---

# Autenticación

Semaphore dispone de tres formas de establecer quién es una persona. Son independientes y
pueden estar todas activas a la vez, de modo que la pantalla de inicio de sesión puede ofrecer
un formulario de contraseña, un inicio de sesión contra el directorio y un botón por cada
proveedor de identidad.

| Método | Quién verifica la contraseña | Úselo cuando |
|---|---|---|
| [Cuentas locales](/admin-guide/authentication/local) | Semaphore, contra su propia base de datos | No tiene un directorio, o necesita un administrador de emergencia. |
| [LDAP y Active Directory](/admin-guide/authentication/ldap) | Su servidor de directorio | Las personas ya existen en LDAP o AD y quiere un único conjunto de credenciales. |
| [OpenID Connect](/admin-guide/authentication/openid) | Su proveedor de identidad | Dispone de inicio de sesión único: Keycloak, Okta, Entra ID, Google, GitHub y otros. |

La autenticación solo responde a *quién* es el usuario. Lo que tiene permitido hacer se decide
por separado, según su rol de servidor y su rol en cada proyecto: consulte
[Equipos](/user-guide/team).

## Cómo llega a existir el registro de un usuario {#how-a-user-record-comes-to-exist}

Toda persona que inicia sesión tiene una fila en la base de datos de Semaphore, sea cual sea el
método que haya utilizado. Una cuenta local la crea un administrador o el comando
`semaphore user add`. Una cuenta LDAP u OIDC se crea en el primer inicio de sesión correcto, y
Semaphore almacena junto a ella una **identidad externa**: el ID del proveedor más el ID de
usuario que ese proveedor devolvió.

Esa identidad externa es con lo que se comparan los inicios de sesión posteriores, lo que
significa que renombrar a alguien en el directorio no crea una segunda cuenta. Lo que sí
requiere atención es el *primer* inicio de sesión de un usuario existente, cuando todavía no
existe ninguna identidad externa. La opción `external_auth_email_matching` decide qué ocurre
entonces:

| Valor | Comportamiento |
|---|---|
| `auto` (predeterminado) | Vincula por correo electrónico, pero solo para usuarios externos que aún no tienen identidad. Esto adopta una sola vez las cuentas creadas antes de la 2.20, y nada más. |
| `always` | Vincula por correo electrónico a cualquier usuario externo. Úselo cuando una misma persona inicia sesión a través de varios proveedores. |
| `never` | Nunca vincula por correo electrónico; las identidades se comparan estrictamente por el ID del proveedor. |

Las cuentas locales con contraseña nunca se comparan por correo electrónico, en ningún modo.
De lo contrario, un proveedor OIDC que permita al usuario elegir su propia dirección de correo
podría utilizarse para apoderarse de la cuenta de un administrador.

:::warning
El ID del proveedor —la clave en `oidc_providers` o `ldap_providers`— forma parte de cada
identidad almacenada. Renombrarlo deja huérfanas las identidades que lo referencian, y esos
usuarios obtienen cuentas nuevas y vacías en su siguiente inicio de sesión. Elíjalo una sola vez.
:::

## Combinar métodos {#combining-methods}

Una configuración realista habilita el inicio de sesión único para las personas y conserva un
administrador local para el día en que el proveedor de identidad no esté disponible:

1. Configure el proveedor y confirme que un usuario real puede iniciar sesión a través de él.
2. Asigne a ese usuario los roles que necesite.
3. Conserve una cuenta de administrador local con una contraseña robusta y
   [TOTP](/admin-guide/authentication/local#two-factor-authentication) habilitado.
4. Establezca `password_login_disable` para impedir que el resto siga usando contraseñas.

Hágalo en ese orden. Establecer `password_login_disable` antes del paso 1 funciona exactamente
como se anuncia y le deja fuera de su propio servidor.

## En esta sección {#in-this-section}

| Página | Qué cubre |
|---|---|
| [Cuentas locales](/admin-guide/authentication/local) | Contraseñas, TOTP, códigos de un solo uso por correo electrónico, duración de la sesión y desactivación del inicio de sesión con contraseña. |
| [LDAP y Active Directory](/admin-guide/authentication/ldap) | Enlace (bind) con un directorio, filtros de búsqueda, asignaciones de atributos y TLS. |
| [OpenID Connect](/admin-guide/authentication/openid) | Configuración del proveedor, expresiones de claims, inicio de sesión iniciado por el IdP y doce ejemplos completos de proveedores. |

## Por dónde empezar {#where-to-start}

Una instalación nueva ya tiene el administrador local creado durante la configuración inicial,
así que empiece por [Cuentas locales](/admin-guide/authentication/local) para protegerlo y
después añada [OpenID Connect](/admin-guide/authentication/openid) o
[LDAP](/admin-guide/authentication/ldap) para el resto.
