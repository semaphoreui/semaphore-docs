---
title: JWT-Proxy-Authentifizierung
description: Benutzer über ein signiertes JWT anmelden, das ein authentifizierender Reverse Proxy wie Pomerium hinzufügt, mit allen auth.jwt-Optionen und der Einrichtung der Abmeldung.
---

# JWT-Proxy-Authentifizierung

Wenn Semaphore hinter einem authentifizierenden Reverse Proxy läuft (z. B. Pomerium, Cloudflare Access oder OAuth2 Proxy), kann der Proxy die Identität des Benutzers über einen Header mit einem signierten JWT weitergeben. Semaphore prüft das JWT gegen einen JWKS-Endpunkt und legt den Benutzer automatisch an oder sucht ihn heraus.

So muss die OIDC-Konfiguration nicht doppelt im Proxy und in Semaphore gepflegt werden.

## Funktionsweise {#how-it-works}

1. Der Reverse Proxy authentifiziert den Benutzer und fügt einem konfigurierten HTTP-Header ein signiertes JWT hinzu.
2. Semaphore prüft bei jeder Anfrage, ob dieser Header vorhanden ist. Ist er vorhanden, wird das Token gegen den JWKS-Endpunkt validiert.
3. Ist das Token gültig, wird der Benutzer genauso gefunden wie bei LDAP und OIDC: zuerst über die externe Identität, die für den `sub`-Claim des Tokens gespeichert ist, dann über die E-Mail-Adresse, soweit `external_auth_email_matching` das zulässt, und andernfalls wird ein neuer externer Benutzer angelegt. Siehe [Wie ein Benutzerdatensatz entsteht](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. Ist der Header vorhanden, das Token aber ungültig, antwortet Semaphore sofort mit `401 Unauthorized` – Bearer-Token- und Sitzungsauthentifizierung werden dann nicht mehr versucht.
5. Fehlt der Header, läuft die normale Authentifizierung (Bearer-Token, Sitzungscookie) wie gewohnt ab.

Über JWT-Authentifizierung angelegte Benutzer werden als **extern** markiert, und ihre Identität wird mit der Provider-ID `jwt` und dem `sub`-Claim des Tokens gespeichert. Ein Token ohne `sub`-Claim wird abgelehnt. Lokale (nicht externe) Benutzer werden nie über die E-Mail-Adresse abgeglichen.

Dem Proxy wird bei der E-Mail-Adresse vertraut, die er in das Token schreibt. Mit dem Standardwert `auto` für `external_auth_email_matching` wird ein Benutzer, den eine frühere Version angelegt hat – die JWT-Benutzer nur über die E-Mail-Adresse abglich –, bei seiner nächsten Anfrage mit seinem `sub` verknüpft. Mit `never` werden solche Benutzer nicht abgeglichen, und ihre Anfragen schlagen fehl, weil ein neues Konto ihre E-Mail-Adresse erneut verwenden würde. Lassen Sie sie sich einmal unter `auto` anmelden, bevor Sie auf `never` umstellen.

## Sicherheitshinweise {#security-considerations}

Semaphore meldet jeden an, dessen Anfrage ein gültiges Token im konfigurierten
Header enthält. Die Signatur verhindert, dass ein Client ein Token erfindet, aber nicht,
dass er eines wiederverwendet, das er bereits besitzt. Der Proxy muss daher der einzige Zugang sein:

- Stellen Sie sicher, dass Semaphore nicht unter Umgehung des Proxys erreichbar ist. Binden Sie es
  an eine private Adresse oder sperren Sie seinen Port per Firewall; siehe [Netzwerksicherheit](/admin-guide/security/network).
- Konfigurieren Sie den Proxy so, dass er den JWT-Header aus eingehenden Client-Anfragen entfernt und
  ihn erst setzt, nachdem er den Benutzer authentifiziert hat.
- Setzen Sie `audience` auf den Wert, den der Proxy für Semaphore verwendet. Ohne diese Einstellung
  wird auch ein Token akzeptiert, das der Proxy für eine andere Anwendung mit denselben Schlüsseln signiert hat.

## Konfiguration {#configuration}

Bei aktivierter JWT-Authentifizierung sind sowohl `header` als auch `jwks_url` erforderlich. Semaphore prüft das beim Start.

### Konfigurationsdatei {#config-file}

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

### Umgebungsvariablen {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Docker-Beispiel {#docker-example}

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

## Optionen {#options}

| Parameter | Umgebungsvariable | Beschreibung |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Aktiviert die JWT-Proxy-Authentifizierung. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | HTTP-Header, der das JWT enthält. **Erforderlich.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL des JWKS-Endpunkts für die Signaturprüfung. **Erforderlich.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Erwarteter `aud`-Claim. Ist der Wert leer, wird die Audience nicht geprüft. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Erwarteter `iss`-Claim. Ist der Wert leer, wird der Aussteller nicht geprüft. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | JWT-Claim für die E-Mail-Adresse des Benutzers. Standard: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | JWT-Claim für den Anzeigenamen des Benutzers. Standard: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | JWT-Claim für den Benutzernamen. Standard: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL, auf die der Abmeldelink nach dem Löschen der Semaphore-Sitzung weiterleitet. Siehe [Abmeldung](#logout). |

## Unterstützte Algorithmen {#supported-algorithms}

Semaphore akzeptiert Token, die mit **ES256**, **ES384**, **ES512**, **RS256**, **RS384** oder **RS512** signiert sind. Jedes Token muss einen `exp`-Claim haben; Token ohne diesen Claim werden abgelehnt.

## Abmeldung {#logout}

Ein Klick auf „Abmelden“ in Semaphore löscht das Sitzungscookie von Semaphore, die Sitzung des Reverse Proxys bleibt jedoch bestehen – die nächste Anfrage authentifiziert also sofort wieder denselben Benutzer.

Um den Benutzer vollständig abzumelden, setzen Sie `signout_url` auf den Abmelde-Endpunkt des Proxys. Nach dem Löschen der Semaphore-Sitzung wird der Browser dorthin weitergeleitet.

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

Beispiele für gängige Proxys:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## Verfügbarkeit des JWKS {#jwks-availability}

Semaphore ruft das JWKS beim Start ab. Ist der JWKS-Endpunkt nicht erreichbar, startet der Server trotzdem. Der Schlüsselsatz wird stündlich im Hintergrund aktualisiert und außerdem, wenn ein Token mit einer Schlüssel-ID signiert ist, die Semaphore noch nicht kennt – höchstens einmal alle fünf Minuten. Solange keine Schlüssel verfügbar sind, gibt die JWT-Authentifizierung einen Fehler zurück.
