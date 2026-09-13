
# Configuración de Keycloak

```yaml title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "https://keycloak.example.com/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/keycloak/redirect"
    }
  }
}
```

## Inicio de sesión iniciado por el IdP {#idp-initiated-login}

Para permitir que los usuarios abran Semaphore desde el lanzador de aplicaciones de la **Account Console** de Keycloak, habilite
el [inicio de sesión iniciado por el IdP](/admin-guide/authentication/openid#idp-initiated-login) para el proveedor:

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

A continuación, en la Admin Console de Keycloak, abra su cliente y establezca la **Home URL** (Keycloak ≥ 19; en versiones anteriores se llama
*Base URL*) en:

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

Cuando un usuario hace clic en la aplicación en el lanzador, Keycloak redirige a esta URL con el parámetro `iss`. Semaphore
valida `iss` contra su `provider_url` (el issuer del realm) e inicia un flujo Authorization Code normal.


## Issues relacionados en GitHub {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Cómo deshabilitar la validación de certificados para el servidor Keycloak  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Opción para deshabilitar la verificación TLS  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Cerrar la sesión de Keycloak al cerrar sesión en Semaphore  

[Explorar todos los issues relacionados con Keycloak →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Discusiones relacionadas en GitHub {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — El nombre de usuario difiere de `preferred_username` en OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; ¿Compatibilidad con SAML?

[Explorar todas las discusiones relacionadas con Keycloak →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
