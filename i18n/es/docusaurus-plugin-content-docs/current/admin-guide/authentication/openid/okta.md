
# Configuración de Okta

```yaml title="config.json"
{
  "oidc_providers": {
    "okta": {
      "display_name": "Sign in with Okta",
      "provider_url": "https://trial-776xxxx.okta.com/oauth2/default",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```

## Inicio de sesión iniciado por el IdP {#idp-initiated-login}

Para permitir que los usuarios inicien sesión desde el mosaico del panel de Okta, habilite
el [inicio de sesión iniciado por el IdP](/admin-guide/authentication/openid#idp-initiated-login) para el proveedor:

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

A continuación, en la Admin Console de Okta, abra los ajustes **General** de su aplicación y configure la sección *Login*:

1. Establezca **Login initiated by** en *Either Okta or App* (o *App Only*).
2. Establezca **Initiate login URI** en:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Opcional) En **Application visibility**, active *Display application icon to users* para que el mosaico aparezca en el
   panel de Okta.

Okta envía los parámetros `iss` y `target_link_uri`; Semaphore valida `iss` contra su `provider_url` e inicia
un flujo Authorization Code normal.


## Issues relacionados en GitHub {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Ayuda con la configuración/depuración de OIDC con Azure AD
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 rompe la autenticación oidc con keycloak
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — Pruebas de oidc_providers

[Explorar todos los issues relacionados con Okta →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Discusiones relacionadas en GitHub {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — Al configurar OpenID con GitHub, no es posible analizar nada excepto el correo electrónico
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; ¿Compatibilidad con SAML?

[Explorar todas las discusiones relacionadas con Okta →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
