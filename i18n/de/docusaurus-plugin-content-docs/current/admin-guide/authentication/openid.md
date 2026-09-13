# OpenID Connect

Semaphore unterstützt die Authentifizierung über OpenID Connect (OIDC).

Links:

* [GitHub-Konfiguration](/admin-guide/authentication/openid/github)
* [Google-Konfiguration](/admin-guide/authentication/openid/google)
* [GitLab-Konfiguration](/admin-guide/authentication/openid/gitlab)
* [Authelia-Konfiguration](/admin-guide/authentication/openid/authelia)
* [Authentik-Konfiguration](/admin-guide/authentication/openid/authentik)
* [Keycloak-Konfiguration](/admin-guide/authentication/openid/keycloak)
* [Okta-Konfiguration](/admin-guide/authentication/openid/okta)
* [PingFederate-Konfiguration](/admin-guide/authentication/openid/pingfederate)
* [Azure-Konfiguration](/admin-guide/authentication/openid/azure)
* [Zitadel-Konfiguration](/admin-guide/authentication/openid/zitadel)
* [Pocket-ID-Konfiguration](/admin-guide/authentication/openid/pocket-id)

Beispiel für die Konfiguration eines SSO-Anbieters:

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

### Konfiguration über Umgebungsvariable {#configure-via-environment-variable}

Beim Betrieb in Containern kann es praktisch sein, Anbieter über eine einzige Umgebungsvariable zu konfigurieren:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

Dieser Wert muss ein gültiger JSON-String sein, der der oben gezeigten `oidc_providers`-Struktur entspricht.

Alle Optionen für SSO-Anbieter:

| Parameter             | Beschreibung                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Name des Anbieters, der auf der Anmeldeseite angezeigt wird.                                                |
| `icon`                | [MDI-Icon](https://pictogrammers.com/library/mdi/), das vor dem Anbieternamen auf der Anmeldeseite angezeigt wird. |
| `color`               | Farbe der Anbieterschaltfläche auf der Anmeldeseite.                                                        |
| `client_id`           | Client-ID des Anbieters.                                                                                    |
| `client_id_file`      | Pfad zur Datei, in der die Client-ID des Anbieters gespeichert ist. Hat geringere Priorität als `client_id`. |
| `client_secret`       | Client-Secret des Anbieters.                                                                                |
| `client_secret_file`  | Pfad zur Datei, in der das Client-Secret des Anbieters gespeichert ist. Hat geringere Priorität als `client_secret`. |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Claim-Ausdruck für den Benutzernamen[\*](#claim-expression).                    |
| `email_claim`         | Claim-Ausdruck für die E-Mail-Adresse[\*](#claim-expression).                   |
| `name_claim`          | Claim-Ausdruck für den Profilnamen[\*](#claim-expression).                      |
| `order`               | Position der Anbieterschaltfläche auf der Anmeldeseite.                                                     |
| `allow_idp_initiated` | Aktiviert die [IdP-initiierte Anmeldung](#idp-initiated-login) für diesen Anbieter. Standard `false`.       |
| `return_via_state`    | Übergibt den Rückkehrpfad nach der Anmeldung über den OAuth-Parameter `state` statt über die Redirect-URL. Standard `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Claim-Ausdruck {#claim-expression}

Beispiel für einen Claim-Ausdruck:

```
email | {{ .username }}@your-domain.com
```

Semaphore versucht zunächst, das E-Mail-Feld auszulesen. Ist es leer, wird der darauf folgende Ausdruck ausgeführt.

<div class="warning">
  Der Ausdruck <code>"username_claim": "|"</code> erzeugt für jeden Benutzer, der sich über den Anbieter anmeldet, einen zufälligen <code>username</code>.
</div>

## IdP-initiierte Anmeldung {#idp-initiated-login}

Standardmäßig unterstützt Semaphore nur die **SP-initiierte** Anmeldung: Der Benutzer öffnet Semaphore, klickt auf die Anbieterschaltfläche und
wird zum Identitätsanbieter (IdP) weitergeleitet.

Bei der **IdP-initiierten** Anmeldung kann der Vorgang stattdessen beim Identitätsanbieter beginnen – zum Beispiel durch Klicken auf die
Semaphore-Kachel im Okta-Dashboard, in Azure *My Apps* oder in einem Anwendungs-Launcher von Keycloak / Authentik.

Semaphore implementiert dies über den standardmäßigen Mechanismus **Third-Party Initiated Login**
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). Der IdP
leitet den Browser an eine dedizierte **Initiate Login URI** weiter, und Semaphore startet anschließend einen normalen Authorization-Code-Flow.
Die eigentliche Authentifizierung bleibt ein vollständiger, sicherer Code-Austausch – Semaphore akzeptiert niemals ein unaufgefordert gesendetes Token.

### Aktivierung {#enabling-it}

Setzen Sie `allow_idp_initiated` für den Anbieter auf `true`:

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

### Identitätsanbieter konfigurieren {#configuring-the-identity-provider}

Setzen Sie in Ihrem IdP die **Initiate Login URI** der Anwendung auf:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

wobei `<provider-id>` der Schlüssel unter `oidc_providers` ist (zum Beispiel `mysso`).

Der IdP muss den Parameter `iss` (Issuer) an diesen Endpunkt senden; Semaphore lehnt Anfragen ab, deren `iss` nicht mit dem
konfigurierten Anbieter übereinstimmt. Der optionale Parameter `login_hint` wird an den IdP weitergereicht, und ein optionaler `target_link_uri`
legt die Seite fest, die nach der Anmeldung geöffnet wird (sie muss auf Semaphore zurückverweisen, andernfalls wird sie ignoriert).

Anbieterspezifische Hinweise:

- **Okta** – setzen Sie *Login initiated by* auf *Either Okta or App* (oder *App Only*) und tragen Sie die *Initiate login URI* ein. Okta
  sendet sowohl `iss` als auch `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin** – setzen Sie die Start-/Home-URL der Anwendung auf die Initiate Login URI.
- **Azure AD / Entra** – *My Apps* verwendet eine SP-initiierte Start-URL und sendet nicht immer `iss`; richten Sie die Start-URL stattdessen auf
  `https://your-domain.com/api/auth/oidc/<provider-id>/login`.

### Sicherheit {#security}

- Die IdP-initiierte Anmeldung ist **standardmäßig deaktiviert** und muss pro Anbieter aktiviert werden.
- Der Parameter `iss` wird gegen den konfigurierten Issuer validiert, um Anbieterverwechslungen zu verhindern.
- `target_link_uri` wird nur akzeptiert, wenn er auf Semaphore zurückverweist (keine offenen Weiterleitungen).
- Der Ablauf durchläuft den vollständigen Authorization-Code-Austausch mit CSRF-`state` und einer `nonce`, sodass ein abgefangenes oder erneut eingespieltes
  Token nicht zur Anmeldung verwendet werden kann.

## Anmeldeseite {#sign-in-screen}

Für jeden konfigurierten Anbieter wird der Anmeldeseite eine zusätzliche Anmeldeschaltfläche hinzugefügt:

![Screenshot der Semaphore-Anmeldeseite mit zwei Anmeldeschaltflächen. Eine lautet „Sign In“, die andere „Sign in with MySSO“](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
