
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

## Ruoli di Project dai gruppi <Enterprise /> {#project-roles-from-groups}

Per usare le [mappature di gruppo](/admin-guide/authentication/openid#project-roles-from-groups), aggiungere un mapper che inserisca i gruppi dell'utente nell'ID token:

1. Nella Keycloak Admin Console, aprire il proprio client, andare in **Client scopes** e aprire lo scope `<client-id>-dedicated`.
2. Aggiungere un mapper **By configuration** e scegliere **Group Membership**.
3. Impostare **Token Claim Name** su `groups` e attivare **Add to ID token**.
4. Scegliere come inviare i gruppi con **Full group path**. Se è attivo, Keycloak invia il percorso di ogni gruppo, per esempio `/devops` o `/platform/sre`, e la mappatura di gruppo deve usare questo percorso. Se è disattivato, Keycloak invia solo il nome del gruppo, per esempio `sre`.

Poi impostare `groups_claim` per il provider:

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "groups_claim": "groups"
    }
  }
}
```

Non aggiungere `groups` a `scopes`. Keycloak rifiuta uno scope che non conosce, e il mapper non richiede scope aggiuntivi.

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
