---
title: JWT proxy authentication
description: Sign users in from a signed JWT added by an authenticating reverse proxy such as Pomerium, with every auth.jwt option and logout setup.
---

# JWT proxy authentication

When Semaphore runs behind an authenticating reverse proxy (e.g. Pomerium, Cloudflare Access, or OAuth2 Proxy), the proxy can pass user identity via a signed JWT header. Semaphore validates the JWT against a JWKS endpoint and creates or looks up the user automatically.

This avoids duplicating OIDC configuration between the proxy and Semaphore.

## How it works {#how-it-works}

1. The reverse proxy authenticates the user and adds a signed JWT to a configured HTTP header.
2. Semaphore checks for this header on every request. If present, the token is validated against the JWKS endpoint.
3. If the token is valid, the user is found the same way as for LDAP and OIDC: first by the external identity stored for the token's `sub` claim, then by email as `external_auth_email_matching` allows, and otherwise a new external user is created. See [How a user record comes to exist](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. If the header is present but the token is invalid, Semaphore returns `401 Unauthorized` immediately -- existing bearer token and session auth are not attempted.
5. If the header is absent, normal authentication (bearer token, session cookie) proceeds as usual.

Users created via JWT auth are marked as **external**, and their identity is stored with the provider ID `jwt` and the token's `sub` claim. A token without a `sub` claim is rejected. Local (non-external) users are never matched by email.

The proxy is trusted for the email address it puts in the token. With the default `external_auth_email_matching` of `auto`, a user created by an earlier version — which matched JWT users by email only — is linked to their `sub` on their next request. With `never`, such users are not matched, and their requests fail because a new account would reuse their email address. Let them sign in once under `auto` before switching to `never`.

## Security considerations {#security-considerations}

Semaphore signs in anyone whose request carries a valid token in the configured
header. The signature stops a client from making up a token, but not from replaying
one it already has, so the proxy has to be the only way in:

- Make sure Semaphore cannot be reached without going through the proxy. Bind it to
  a private address or firewall its port; see [Network security](/admin-guide/security/network).
- Configure the proxy to drop the JWT header from incoming client requests and set it
  only after it has authenticated the user.
- Set `audience` to the value the proxy uses for Semaphore. Without it, a token the
  proxy issued for another application signed by the same keys is accepted too.

## Configuration {#configuration}

Both `header` and `jwks_url` are required when JWT auth is enabled. Semaphore validates this at startup.

### Config file {#config-file}

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

### Environment variables {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Docker example {#docker-example}

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

## Options {#options}

| Parameter | Environment Variable | Description |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Enable JWT proxy authentication. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | HTTP header containing the JWT. **Required.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL of the JWKS endpoint for signature verification. **Required.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Expected `aud` claim. If empty, audience is not validated. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Expected `iss` claim. If empty, issuer is not validated. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | JWT claim for the user's email. Default: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | JWT claim for the user's display name. Default: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | JWT claim for the username. Default: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL the logout link redirects to after clearing the Semaphore session. See [Logout](#logout). |

## Supported algorithms {#supported-algorithms}

Semaphore accepts tokens signed with **ES256**, **ES384**, **ES512**, **RS256**, **RS384**, or **RS512**. Every token must have an `exp` claim; tokens without one are rejected.

## Logout {#logout}

Clicking logout in Semaphore clears the Semaphore session cookie, but the reverse proxy's session is unaffected -- so the next request re-authenticates the same user immediately.

To fully sign the user out, set `signout_url` to the proxy's signout endpoint. After clearing the Semaphore session, the browser is redirected there.

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

Examples for common proxies:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## JWKS availability {#jwks-availability}

Semaphore fetches the JWKS on startup. If the JWKS endpoint is unreachable, the server still starts. The key set is refreshed in the background every hour, and also when a token is signed with a key ID Semaphore has not seen, at most once every five minutes. JWT auth returns an error until keys are available.
