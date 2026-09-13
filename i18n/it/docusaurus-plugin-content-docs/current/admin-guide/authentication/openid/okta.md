
# Configurazione Okta

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

## Accesso avviato dall'IdP {#idp-initiated-login}

Per consentire agli utenti di avviare l'accesso dal riquadro nella dashboard di Okta, abilitare
l'[accesso avviato dall'IdP](/admin-guide/authentication/openid#idp-initiated-login) per il provider:

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

Quindi, nella Admin Console di Okta, aprire le impostazioni **General** della propria applicazione e configurare la sezione *Login*:

1. Impostare **Login initiated by** su *Either Okta or App* (oppure *App Only*).
2. Impostare **Initiate login URI** a:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Facoltativo) In **Application visibility**, abilitare *Display application icon to users* affinché il riquadro compaia nella
   dashboard di Okta.

Okta invia i parametri `iss` e `target_link_uri`; Semaphore convalida `iss` rispetto al proprio `provider_url` e avvia
un normale flusso Authorization Code.


## Issue GitHub correlate {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Aiuto con la configurazione/debug di OIDC Azure AD
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — La v2.9.56 interrompe l'autenticazione oidc con keycloak
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — Test di oidc_providers

[Esplora tutte le issue relative a Okta →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Discussioni GitHub correlate {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — Nella configurazione di GitHub OpenID, non è possibile il parsing se non per l'email
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Supporto SAML?

[Esplora tutte le discussioni relative a Okta →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
