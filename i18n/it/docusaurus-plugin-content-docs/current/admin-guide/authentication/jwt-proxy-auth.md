---
title: Autenticazione tramite proxy JWT
description: Far accedere gli utenti tramite un JWT firmato aggiunto da un reverse proxy di autenticazione come Pomerium, con tutte le opzioni auth.jwt e la configurazione del logout.
---

# Autenticazione tramite proxy JWT

Quando Semaphore è in esecuzione dietro un reverse proxy di autenticazione (ad esempio Pomerium, Cloudflare Access o OAuth2 Proxy), il proxy può trasmettere l'identità dell'utente tramite un header contenente un JWT firmato. Semaphore convalida il JWT rispetto a un endpoint JWKS e trova o crea l'utente automaticamente.

In questo modo si evita di duplicare la configurazione OIDC tra il proxy e Semaphore.

## Come funziona {#how-it-works}

1. Il reverse proxy autentica l'utente e aggiunge un JWT firmato in un header HTTP configurato.
2. Semaphore cerca questo header in ogni richiesta. Se è presente, il token viene convalidato rispetto all'endpoint JWKS.
3. Se il token è valido, l'utente viene trovato nello stesso modo che per LDAP e OIDC: prima tramite l'identità esterna memorizzata per il claim `sub` del token, poi tramite e-mail nella misura consentita da `external_auth_email_matching`, altrimenti viene creato un nuovo utente esterno. Vedere [Come nasce il record di un utente](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. Se l'header è presente ma il token non è valido, Semaphore restituisce immediatamente `401 Unauthorized` -- l'autenticazione tramite bearer token e sessione non viene tentata.
5. Se l'header è assente, l'autenticazione normale (bearer token, cookie di sessione) procede come di consueto.

Gli utenti creati tramite l'autenticazione JWT vengono contrassegnati come **esterni** e la loro identità viene memorizzata con l'ID del provider `jwt` e il claim `sub` del token. Un token privo del claim `sub` viene rifiutato. Gli utenti locali (non esterni) non vengono mai confrontati tramite e-mail.

Il proxy è considerato attendibile per l'indirizzo e-mail che inserisce nel token. Con il valore predefinito `auto` di `external_auth_email_matching`, un utente creato da una versione precedente — che confrontava gli utenti JWT solo tramite e-mail — viene collegato al proprio `sub` alla richiesta successiva. Con `never` questi utenti non vengono confrontati e le loro richieste falliscono, perché un nuovo account riutilizzerebbe il loro indirizzo e-mail. Lasciate che accedano una volta in modalità `auto` prima di passare a `never`.

## Considerazioni sulla sicurezza {#security-considerations}

Semaphore fa accedere chiunque invii una richiesta con un token valido nell'header
configurato. La firma impedisce a un client di inventarsi un token, ma non di riutilizzarne
uno che possiede già, quindi il proxy deve essere l'unica via d'accesso:

- Assicurarsi che Semaphore non sia raggiungibile senza passare dal proxy. Associarlo a
  un indirizzo privato o proteggerne la porta con un firewall; vedere [Sicurezza di rete](/admin-guide/security/network).
- Configurare il proxy in modo che rimuova l'header JWT dalle richieste in arrivo dai client e
  lo imposti solo dopo aver autenticato l'utente.
- Impostare `audience` sul valore che il proxy usa per Semaphore. Senza di esso, viene accettato
  anche un token emesso dal proxy per un'altra applicazione e firmato con le stesse chiavi.

## Configurazione {#configuration}

Sia `header` sia `jwks_url` sono obbligatori quando l'autenticazione JWT è abilitata. Semaphore lo verifica all'avvio.

### File di configurazione {#config-file}

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

### Variabili d'ambiente {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Esempio con Docker {#docker-example}

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

## Opzioni {#options}

| Parametro | Variabile d'ambiente | Descrizione |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Abilita l'autenticazione tramite proxy JWT. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | Header HTTP che contiene il JWT. **Obbligatorio.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL dell'endpoint JWKS per la verifica della firma. **Obbligatorio.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Claim `aud` atteso. Se vuoto, l'audience non viene verificata. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Claim `iss` atteso. Se vuoto, l'issuer non viene verificato. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | Claim JWT con l'indirizzo e-mail dell'utente. Predefinito: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | Claim JWT con il nome visualizzato dell'utente. Predefinito: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | Claim JWT con il nome utente. Predefinito: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL a cui il link di logout reindirizza dopo aver eliminato la sessione di Semaphore. Vedere [Logout](#logout). |

## Algoritmi supportati {#supported-algorithms}

Semaphore accetta token firmati con **ES256**, **ES384**, **ES512**, **RS256**, **RS384** o **RS512**. Ogni token deve avere un claim `exp`; i token che ne sono privi vengono rifiutati.

## Logout {#logout}

Facendo clic su logout in Semaphore si elimina il cookie di sessione di Semaphore, ma la sessione del reverse proxy non viene toccata -- quindi la richiesta successiva autentica di nuovo immediatamente lo stesso utente.

Per disconnettere completamente l'utente, impostare `signout_url` sull'endpoint di logout del proxy. Dopo l'eliminazione della sessione di Semaphore, il browser viene reindirizzato lì.

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

Esempi per i proxy più comuni:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## Disponibilità del JWKS {#jwks-availability}

Semaphore scarica il JWKS all'avvio. Se l'endpoint JWKS non è raggiungibile, il server si avvia comunque. Il set di chiavi viene aggiornato in background ogni ora e anche quando un token è firmato con un ID di chiave che Semaphore non ha ancora visto, al massimo una volta ogni cinque minuti. L'autenticazione JWT restituisce un errore finché le chiavi non sono disponibili.
