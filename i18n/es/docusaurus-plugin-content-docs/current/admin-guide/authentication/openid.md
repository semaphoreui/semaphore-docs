# OpenID Connect

Semaphore admite la autenticación mediante OpenID Connect (OIDC).

Enlaces:

* [Configuración de GitHub](/admin-guide/authentication/openid/github)
* [Configuración de Google](/admin-guide/authentication/openid/google)
* [Configuración de GitLab](/admin-guide/authentication/openid/gitlab)
* [Configuración de Authelia](/admin-guide/authentication/openid/authelia)
* [Configuración de Authentik](/admin-guide/authentication/openid/authentik)
* [Configuración de Keycloak](/admin-guide/authentication/openid/keycloak)
* [Configuración de Okta](/admin-guide/authentication/openid/okta)
* [Configuración de PingFederate](/admin-guide/authentication/openid/pingfederate)
* [Configuración de Azure](/admin-guide/authentication/openid/azure)
* [Configuración de Zitadel](/admin-guide/authentication/openid/zitadel)
* [Configuración de Pocket-ID](/admin-guide/authentication/openid/pocket-id)

Ejemplo de configuración de un proveedor SSO:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "color": "orange",
      "icon": "login",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect"
    }
  }
}
```

### Configuración mediante variable de entorno {#configure-via-environment-variable}

Al ejecutar en contenedores puede resultar cómodo configurar los proveedores mediante una única variable de entorno:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

Este valor debe ser una cadena JSON válida que coincida con la estructura de `oidc_providers` mostrada arriba.

Todas las opciones de un proveedor SSO:

| Parámetro             | Descripción                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Nombre del proveedor que se muestra en la pantalla de inicio de sesión.                                     |
| `icon`                | [Icono MDI](https://pictogrammers.com/library/mdi/) que se muestra delante del nombre del proveedor en la pantalla de inicio de sesión. |
| `color`               | Color del botón del proveedor que se muestra en la pantalla de inicio de sesión.                            |
| `client_id`           | ID de cliente del proveedor.                                                                                |
| `client_id_file`      | Ruta al archivo donde se almacena el ID de cliente del proveedor. Tiene menos prioridad que `client_id`.    |
| `client_secret`       | Secreto de cliente del proveedor.                                                                           |
| `client_secret_file`  | Ruta al archivo donde se almacena el secreto de cliente del proveedor. Tiene menos prioridad que `client_secret`. |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Expresión de claim para el nombre de usuario[\*](#claim-expression).                               |
| `email_claim`         | Expresión de claim para el correo electrónico[\*](#claim-expression).                                  |
| `name_claim`          | Expresión de claim para el nombre del perfil[\*](#claim-expression).                           |
| `order`               | Posición del botón del proveedor en la pantalla de inicio de sesión.                                        |
| `allow_idp_initiated` | Habilita el [inicio de sesión iniciado por el IdP](#idp-initiated-login) para este proveedor. Predeterminado: `false`. |
| `return_via_state`    | Pasa la ruta de retorno posterior al inicio de sesión mediante el parámetro `state` de OAuth en lugar de la URL de redirección. Predeterminado: `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Expresión de claim {#claim-expression}

Ejemplo de expresión de claim:

```
email | {{ .username }}@your-domain.com
```

Semaphore intenta obtener primero el campo email. Si está vacío, se ejecuta la expresión que le sigue.

<div class="warning">
  La expresión <code>"username_claim": "|"</code> genera un <code>username</code> aleatorio para cada usuario que inicia sesión a través del proveedor.
</div>

## Inicio de sesión iniciado por el IdP {#idp-initiated-login}

De forma predeterminada, Semaphore solo admite el inicio de sesión **iniciado por el SP**: el usuario abre Semaphore, hace clic en el botón del proveedor y
es redirigido al proveedor de identidad (IdP).

Con el inicio de sesión **iniciado por el IdP**, el recorrido puede comenzar en el proveedor de identidad; por ejemplo, haciendo clic en el
mosaico de Semaphore en el panel de Okta, en *My Apps* de Azure o en un lanzador de aplicaciones de Keycloak / Authentik.

Semaphore lo implementa mediante el mecanismo estándar **Third-Party Initiated Login**
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). El IdP
redirige el navegador a una **Initiate Login URI** dedicada, y Semaphore inicia entonces un flujo Authorization Code normal.
La autenticación real sigue siendo un intercambio de código completo y seguro: Semaphore nunca acepta un token no solicitado.

### Habilitarlo {#enabling-it}

Establezca `allow_idp_initiated` en `true` para el proveedor:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect",
      "allow_idp_initiated": true
    }
  }
}
```

### Configurar el proveedor de identidad {#configuring-the-identity-provider}

En su IdP, establezca la **Initiate Login URI** de la aplicación en:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

donde `<provider-id>` es la clave bajo `oidc_providers` (por ejemplo, `mysso`).

El IdP debe enviar el parámetro `iss` (issuer) a este endpoint; Semaphore rechaza las peticiones cuyo `iss` no coincida con
el proveedor configurado. El parámetro opcional `login_hint` se reenvía al IdP, y un `target_link_uri` opcional
establece la página que se abrirá tras el inicio de sesión (debe apuntar de vuelta a Semaphore; de lo contrario se ignora).

Notas específicas por proveedor:

- **Okta**: establezca *Login initiated by* en *Either Okta or App* (o *App Only*) y rellene la *Initiate login URI*. Okta
  envía tanto `iss` como `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin**: establezca la URL de lanzamiento / de inicio de la aplicación en la Initiate Login URI.
- **Azure AD / Entra**: *My Apps* utiliza una URL de inicio iniciada por el SP y no siempre envía `iss`; apunte la URL de inicio a
  `https://your-domain.com/api/auth/oidc/<provider-id>/login` en su lugar.

### Seguridad {#security}

- El inicio de sesión iniciado por el IdP está **desactivado de forma predeterminada** y debe habilitarse por proveedor.
- El parámetro `iss` se valida contra el issuer configurado para evitar confusiones entre proveedores.
- `target_link_uri` solo se acepta cuando apunta de vuelta a Semaphore (sin redirecciones abiertas).
- El flujo pasa por el intercambio Authorization Code completo con `state` CSRF y un `nonce`, por lo que un token capturado o
  reproducido no puede usarse para iniciar sesión.

## Pantalla de inicio de sesión {#sign-in-screen}

Por cada proveedor configurado se añade un botón de inicio de sesión adicional a la página de inicio de sesión:

![Captura de pantalla de la página de inicio de sesión de Semaphore, con dos botones de inicio de sesión. Uno dice "Sign In", el otro dice "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
