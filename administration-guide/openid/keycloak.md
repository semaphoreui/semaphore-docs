`config.json`:
```yaml
{
  # ...
  "oidc_providers": {
    "mysso": {  # The ID of the provider, is used as a URL path component in the redirect URL
      "display_name": "Sign in with MySSO",  # Text on the additional login button
      "provider_url": "https://keycloak.example.org/realms/mysso",  # Root URL of the OIDC provider, expects /.well-known/openid-configuration below this URL
      "client_id": "***",
      "client_secret": "***",
      # "redirect_url": "${web_host}/api/auth/oidc/${provider}/redirect",  # default value, the OIDC provider redirects back here
      # "scopes": ["openid", "profile", "email"],  # default value, OIDC scopes
      # "username_claim": "preferred_username",  # default value, id_token claim to use as the username
      # "name_claim": "preferred_username",  # default value, id_token claim to use as the display name
      # "email_claim": "email"  # default value, id_token claim to use as the email address

      # If the OIDC provider does not offer a /.well-known/openid-configuration, the endpoints can be
      # configured manually.  In this case, the "provider_url" must be omitted.
      # "endpoint": {
      #   "issuer": "https://keycloak.example.org/realms/mysso",
      #   "auth": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/auth",
      #   "token": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/token",
      #   "userinfo": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/userinfo",
      #   "jwks": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/certs",
      #   "algorithms": ["HS256", ...]
      # }
    }
  }
}
```