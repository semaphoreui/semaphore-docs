
# Configuração do Keycloak

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

## Login iniciado pelo IdP {#idp-initiated-login}

Para permitir que os usuários iniciem o Semaphore a partir do lançador de aplicações do **Account Console** do Keycloak, habilite
o [login iniciado pelo IdP](/admin-guide/authentication/openid#idp-initiated-login) para o provedor:

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

Em seguida, no Admin Console do Keycloak, abra o seu cliente e defina a **Home URL** (Keycloak ≥ 19; versões mais antigas a chamam de
*Base URL*) como:

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

Quando um usuário clica na aplicação no lançador, o Keycloak redireciona para essa URL com o parâmetro `iss`. O Semaphore
valida o `iss` em relação ao seu `provider_url` (o issuer do realm) e inicia um fluxo Authorization Code normal.


## Issues relacionadas no GitHub {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Como desativar a validação de certificado para o servidor Keycloak  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Opção para desativar a verificação TLS  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Encerrar a sessão do Keycloak ao sair do Semaphore  

[Explorar todas as issues relacionadas ao Keycloak →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Discussões relacionadas no GitHub {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — O nome de usuário difere de `preferred_username` no OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Suporte a SAML?

[Explorar todas as discussões relacionadas ao Keycloak →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
