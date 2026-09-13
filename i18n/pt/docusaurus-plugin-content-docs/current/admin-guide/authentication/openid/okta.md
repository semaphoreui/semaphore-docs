
# Configuração do Okta

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

## Login iniciado pelo IdP {#idp-initiated-login}

Para permitir que os usuários iniciem o login a partir do bloco no painel do Okta, habilite
o [login iniciado pelo IdP](/admin-guide/authentication/openid#idp-initiated-login) para o provedor:

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

Em seguida, no Admin Console do Okta, abra as configurações **General** da sua aplicação e configure a seção *Login*:

1. Defina **Login initiated by** como *Either Okta or App* (ou *App Only*).
2. Defina **Initiate login URI** como:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Opcional) Em **Application visibility**, habilite *Display application icon to users* para que o bloco apareça no
   painel do Okta.

O Okta envia os parâmetros `iss` e `target_link_uri`; o Semaphore valida o `iss` em relação ao seu `provider_url` e inicia
um fluxo Authorization Code normal.


## Issues relacionadas no GitHub {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Ajuda com a configuração/depuração de OIDC com Azure AD
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 quebra a autenticação oidc com keycloak
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — testando oidc_providers

[Explorar todas as issues relacionadas ao Okta →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Discussões relacionadas no GitHub {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — Ao configurar o OpenID do GitHub, não é possível fazer o parsing, exceto do e-mail
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Suporte a SAML?

[Explorar todas as discussões relacionadas ao Okta →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
