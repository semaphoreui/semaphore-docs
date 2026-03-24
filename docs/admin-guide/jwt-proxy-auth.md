# JWT Proxy Authentication

When Semaphore runs behind an authenticating reverse proxy (e.g. Pomerium, Cloudflare Access, or OAuth2 Proxy), the proxy can pass user identity via a signed JWT header. Semaphore validates the JWT against a JWKS endpoint and creates or looks up the user automatically.

This avoids duplicating OIDC configuration between the proxy and Semaphore.

## How it works

1. The reverse proxy authenticates the user and adds a signed JWT to a configured HTTP header.
2. Semaphore checks for this header on every request. If present, the token is validated against the JWKS endpoint.
3. If the token is valid, the user is loaded by email. If no matching user exists, an external user is created automatically (same as OIDC).
4. If the header is present but the token is invalid, Semaphore returns `401 Unauthorized` immediately -- existing bearer token and session auth are not attempted.
5. If the header is absent, normal authentication (bearer token, session cookie) proceeds as usual.

Users created via JWT auth are marked as **external**. If a JWT email matches a local (non-external) user, authentication is rejected.

## Configuration

Both `header` and `jwks_url` are required when JWT auth is enabled. Semaphore validates this at startup.

### Config file

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

### Environment variables

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Docker example

```bash
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=bolt \
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

## Options

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

## Supported algorithms

Semaphore accepts tokens signed with **ES256**, **ES384**, **ES512**, **RS256**, **RS384**, or **RS512**.

## JWKS availability

Semaphore fetches the JWKS on startup. If the JWKS endpoint is unreachable, the server still starts and retries in the background (5s, 10s, 30s, then every 60s). JWT auth returns an error until the JWKS is loaded.
