---
title: Autenticación por proxy JWT
description: Inicie la sesión de los usuarios a partir de un JWT firmado que añade un proxy inverso de autenticación como Pomerium, con todas las opciones de auth.jwt y la configuración del cierre de sesión.
---

# Autenticación por proxy JWT

Cuando Semaphore se ejecuta detrás de un proxy inverso de autenticación (por ejemplo, Pomerium, Cloudflare Access u OAuth2 Proxy), el proxy puede transmitir la identidad del usuario mediante una cabecera con un JWT firmado. Semaphore valida el JWT contra un endpoint JWKS y crea o busca al usuario automáticamente.

Así se evita duplicar la configuración de OIDC entre el proxy y Semaphore.

## Cómo funciona {#how-it-works}

1. El proxy inverso autentica al usuario y añade un JWT firmado a una cabecera HTTP configurada.
2. Semaphore busca esta cabecera en cada petición. Si está presente, el token se valida contra el endpoint JWKS.
3. Si el token es válido, el usuario se localiza igual que con LDAP y OIDC: primero por la identidad externa almacenada para el claim `sub` del token, después por correo electrónico según lo permita `external_auth_email_matching` y, en caso contrario, se crea un nuevo usuario externo. Consulte [Cómo llega a existir el registro de un usuario](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. Si la cabecera está presente pero el token no es válido, Semaphore devuelve `401 Unauthorized` de inmediato; no se intenta la autenticación existente por token bearer ni por sesión.
5. Si la cabecera no está presente, la autenticación normal (token bearer, cookie de sesión) continúa como de costumbre.

Los usuarios creados mediante la autenticación JWT se marcan como **externos**, y su identidad se almacena con el ID de proveedor `jwt` y el claim `sub` del token. Un token sin claim `sub` se rechaza. Los usuarios locales (no externos) nunca se comparan por correo electrónico.

Se confía en el proxy en cuanto a la dirección de correo electrónico que incluye en el token. Con el valor predeterminado `auto` de `external_auth_email_matching`, un usuario creado por una versión anterior —que comparaba a los usuarios JWT solo por correo electrónico— se vincula a su `sub` en su siguiente petición. Con `never`, esos usuarios no se comparan y sus peticiones fallan, porque una cuenta nueva reutilizaría su dirección de correo. Deje que inicien sesión una vez con `auto` antes de cambiar a `never`.

## Consideraciones de seguridad {#security-considerations}

Semaphore inicia la sesión de cualquiera cuya petición lleve un token válido en la
cabecera configurada. La firma impide que un cliente se invente un token, pero no que
reutilice uno que ya tiene, así que el proxy tiene que ser la única vía de acceso:

- Asegúrese de que no se pueda llegar a Semaphore sin pasar por el proxy. Vincúlelo a
  una dirección privada o proteja su puerto con un cortafuegos; consulte [Seguridad de red](/admin-guide/security/network).
- Configure el proxy para que elimine la cabecera JWT de las peticiones entrantes de los clientes
  y la establezca solo después de haber autenticado al usuario.
- Establezca `audience` al valor que el proxy utiliza para Semaphore. Sin él, también se acepta
  un token que el proxy emitió para otra aplicación y que está firmado con las mismas claves.

## Configuración {#configuration}

Cuando la autenticación JWT está habilitada, `header` y `jwks_url` son obligatorios. Semaphore lo valida al arrancar.

### Archivo de configuración {#config-file}

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "header": "X-Pomerium-Jwt-Assertion",
      "jwks_url": "https://auth.example.com/.well-known/pomerium/jwks.json",
      "audience": "https://semaphore.example.com",
      "issuer": "https://auth.example.com"
    }
  }
}
```

### Variables de entorno {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Ejemplo con Docker {#docker-example}

```bash
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_JWT_AUTH_ENABLED=true \
  -e SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion \
  -e SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json \
  -e SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com \
  -e SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com \
  semaphoreui/semaphore:latest
```

## Opciones {#options}

| Parámetro | Variable de entorno | Descripción |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Habilita la autenticación por proxy JWT. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | Cabecera HTTP que contiene el JWT. **Obligatorio.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL del endpoint JWKS para verificar la firma. **Obligatorio.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Claim `aud` esperado. Si está vacío, no se valida la audiencia. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Claim `iss` esperado. Si está vacío, no se valida el emisor. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | Claim del JWT con el correo electrónico del usuario. Predeterminado: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | Claim del JWT con el nombre visible del usuario. Predeterminado: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | Claim del JWT con el nombre de usuario. Predeterminado: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL a la que redirige el enlace de cierre de sesión después de borrar la sesión de Semaphore. Consulte [Cierre de sesión](#logout). |

## Algoritmos admitidos {#supported-algorithms}

Semaphore acepta tokens firmados con **ES256**, **ES384**, **ES512**, **RS256**, **RS384** o **RS512**. Todo token debe tener un claim `exp`; los tokens sin él se rechazan.

## Cierre de sesión {#logout}

Al hacer clic en cerrar sesión en Semaphore se borra la cookie de sesión de Semaphore, pero la sesión del proxy inverso no se ve afectada, de modo que la siguiente petición vuelve a autenticar al mismo usuario de inmediato.

Para cerrar la sesión del usuario por completo, establezca `signout_url` en el endpoint de cierre de sesión del proxy. Después de borrar la sesión de Semaphore, el navegador se redirige allí.

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "signout_url": "https://auth.example.com/.pomerium/sign_out"
    }
  }
}
```

Ejemplos para proxies habituales:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## Disponibilidad del JWKS {#jwks-availability}

Semaphore obtiene el JWKS al arrancar. Si el endpoint JWKS no está accesible, el servidor arranca de todos modos. El conjunto de claves se actualiza en segundo plano cada hora y también cuando un token está firmado con un ID de clave que Semaphore no ha visto, como máximo una vez cada cinco minutos. La autenticación JWT devuelve un error hasta que haya claves disponibles.
