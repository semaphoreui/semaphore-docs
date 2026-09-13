
# Configurazione Keycloak

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

## Accesso avviato dall'IdP {#idp-initiated-login}

Per consentire agli utenti di avviare Semaphore dal launcher di applicazioni dell'**Account Console** di Keycloak, abilitare
l'[accesso avviato dall'IdP](/admin-guide/authentication/openid#idp-initiated-login) per il provider:

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

Quindi, nella Admin Console di Keycloak, aprire il proprio client e impostare la **Home URL** (Keycloak ≥ 19; nelle versioni precedenti si chiama
*Base URL*) a:

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

Quando un utente fa clic sull'applicazione nel launcher, Keycloak reindirizza a questo URL con il parametro `iss`. Semaphore
convalida `iss` rispetto al proprio `provider_url` (l'issuer del realm) e avvia un normale flusso Authorization Code.


## Issue GitHub correlate {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Come disabilitare la convalida del certificato per il server Keycloak  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Opzione per disabilitare la verifica TLS  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Disconnessione dalla sessione Keycloak alla disconnessione da Semaphore  

[Esplora tutte le issue relative a Keycloak →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Discussioni GitHub correlate {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Il nome utente differisce da `preferred_username` in OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Supporto SAML?

[Esplora tutte le discussioni relative a Keycloak →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
