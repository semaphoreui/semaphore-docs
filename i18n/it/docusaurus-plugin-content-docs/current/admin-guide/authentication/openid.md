# OpenID Connect

Semaphore supporta l'autenticazione tramite OpenID Connect (OIDC).

Collegamenti:

* [Configurazione GitHub](/admin-guide/authentication/openid/github)
* [Configurazione Google](/admin-guide/authentication/openid/google)
* [Configurazione GitLab](/admin-guide/authentication/openid/gitlab)
* [Configurazione Authelia](/admin-guide/authentication/openid/authelia)
* [Configurazione Authentik](/admin-guide/authentication/openid/authentik)
* [Configurazione Keycloak](/admin-guide/authentication/openid/keycloak)
* [Configurazione Okta](/admin-guide/authentication/openid/okta)
* [Configurazione PingFederate](/admin-guide/authentication/openid/pingfederate)
* [Configurazione Azure](/admin-guide/authentication/openid/azure)
* [Configurazione Zitadel](/admin-guide/authentication/openid/zitadel)
* [Configurazione Pocket-ID](/admin-guide/authentication/openid/pocket-id)

Esempio di configurazione di un provider SSO:

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

### Configurazione tramite variabile d'ambiente {#configure-via-environment-variable}

Quando si esegue in container, può essere comodo configurare i provider tramite un'unica variabile d'ambiente:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

Questo valore deve essere una stringa JSON valida corrispondente alla struttura `oidc_providers` mostrata sopra.

Tutte le opzioni del provider SSO:

| Parametro             | Descrizione                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Nome del provider visualizzato nella schermata di accesso.                                                  |
| `icon`                | [Icona MDI](https://pictogrammers.com/library/mdi/) visualizzata prima del nome del provider nella schermata di accesso. |
| `color`               | Nome del provider visualizzato nella schermata di accesso.                                                  |
| `client_id`           | Client ID del provider.                                                                                     |
| `client_id_file`      | Percorso del file in cui è memorizzato il client ID del provider. Ha priorità inferiore rispetto a `client_id`. |
| `client_secret`       | Client secret del provider.                                                                                 |
| `client_secret_file`  | Percorso del file in cui è memorizzato il client secret del provider. Ha priorità inferiore rispetto a `client_secret`. |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Espressione del claim per il nome utente[\*](#claim-expression).                |
| `email_claim`         | Espressione del claim per l'email[\*](#claim-expression).                       |
| `name_claim`          | Espressione del claim per il nome del profilo[\*](#claim-expression).           |
| `order`               | Posizione del pulsante del provider nella schermata di accesso.                                             |
| `allow_idp_initiated` | Abilita l'[accesso avviato dall'IdP](#idp-initiated-login) per questo provider. Valore predefinito `false`. |
| `return_via_state`    | Passa il percorso di ritorno post-accesso tramite il parametro OAuth `state` invece che tramite l'URL di redirect. Valore predefinito `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Espressione del claim {#claim-expression}

Esempio di espressione del claim:

```
email | {{ .username }}@your-domain.com
```

Semaphore tenta prima di ottenere il campo email. Se questo è vuoto, viene valutata l'espressione successiva.

<div class="warning">
  L'espressione <code>"username_claim": "|"</code> genera uno <code>username</code> casuale per ogni utente che accede tramite il provider.
</div>

## Accesso avviato dall'IdP {#idp-initiated-login}

Per impostazione predefinita Semaphore supporta solo l'accesso **avviato dall'SP**: l'utente apre Semaphore, fa clic sul pulsante del provider e
viene reindirizzato all'identity provider (IdP).

Con l'accesso **avviato dall'IdP** il percorso può invece iniziare dall'identity provider, ad esempio facendo clic sul
riquadro di Semaphore nella dashboard di Okta, in *My Apps* di Azure o in un launcher di applicazioni di Keycloak / Authentik.

Semaphore implementa questa funzionalità tramite il meccanismo standard **Third-Party Initiated Login**
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). L'IdP
reindirizza il browser a un **Initiate Login URI** dedicato e Semaphore avvia quindi un normale flusso Authorization Code.
L'autenticazione vera e propria rimane uno scambio di codice completo e sicuro: Semaphore non accetta mai un token non richiesto.

### Abilitazione {#enabling-it}

Impostare `allow_idp_initiated` a `true` per il provider:

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

### Configurazione dell'identity provider {#configuring-the-identity-provider}

Nel proprio IdP, impostare l'**Initiate Login URI** dell'applicazione a:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

dove `<provider-id>` è la chiave sotto `oidc_providers` (ad esempio `mysso`).

L'IdP deve inviare a questo endpoint il parametro `iss` (issuer); Semaphore rifiuta le richieste il cui `iss` non corrisponde
al provider configurato. Il parametro opzionale `login_hint` viene inoltrato all'IdP e il parametro opzionale `target_link_uri`
imposta la pagina da aprire dopo l'accesso (deve puntare a Semaphore, altrimenti viene ignorato).

Note specifiche per provider:

- **Okta** — impostare *Login initiated by* su *Either Okta or App* (oppure *App Only*) e compilare *Initiate login URI*. Okta
  invia sia `iss` sia `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin** — impostare l'URL di avvio / home dell'applicazione sull'Initiate Login URI.
- **Azure AD / Entra** — *My Apps* utilizza un URL di avvio SP-initiated e non invia sempre `iss`; puntare invece l'URL di avvio a
  `https://your-domain.com/api/auth/oidc/<provider-id>/login`.

### Sicurezza {#security}

- L'accesso avviato dall'IdP è **disattivato per impostazione predefinita** e deve essere abilitato per ogni provider.
- Il parametro `iss` viene convalidato rispetto all'issuer configurato per prevenire confusioni tra provider.
- `target_link_uri` viene accettato solo se punta a Semaphore (nessun open redirect).
- Il flusso passa attraverso lo scambio Authorization Code completo con `state` CSRF e un `nonce`, quindi un token intercettato o
  riutilizzato non può essere usato per accedere.

## Schermata di accesso {#sign-in-screen}

Per ciascuno dei provider configurati, alla pagina di accesso viene aggiunto un ulteriore pulsante di accesso:

![Screenshot della pagina di accesso di Semaphore, con due pulsanti di accesso. Uno riporta "Sign In", l'altro "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
