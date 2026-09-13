# OpenID Connect

O Semaphore oferece suporte à autenticação via OpenID Connect (OIDC).

Links:

* [Configuração do GitHub](/admin-guide/authentication/openid/github)
* [Configuração do Google](/admin-guide/authentication/openid/google)
* [Configuração do GitLab](/admin-guide/authentication/openid/gitlab)
* [Configuração do Authelia](/admin-guide/authentication/openid/authelia)
* [Configuração do Authentik](/admin-guide/authentication/openid/authentik)
* [Configuração do Keycloak](/admin-guide/authentication/openid/keycloak)
* [Configuração do Okta](/admin-guide/authentication/openid/okta)
* [Configuração do PingFederate](/admin-guide/authentication/openid/pingfederate)
* [Configuração do Azure](/admin-guide/authentication/openid/azure)
* [Configuração do Zitadel](/admin-guide/authentication/openid/zitadel)
* [Configuração do Pocket-ID](/admin-guide/authentication/openid/pocket-id)

Exemplo de configuração de provedor SSO:

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

### Configurar via variável de ambiente {#configure-via-environment-variable}

Ao executar em contêineres, pode ser conveniente configurar os provedores usando uma única variável de ambiente:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

Esse valor deve ser uma string JSON válida que corresponda à estrutura de `oidc_providers` mostrada acima.

Todas as opções de provedor SSO:

| Parâmetro             | Descrição                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Nome do provedor exibido na tela de login.                                                                  |
| `icon`                | [Ícone MDI](https://pictogrammers.com/library/mdi/) exibido antes do nome do provedor na tela de login.     |
| `color`               | Cor do provedor exibida na tela de login.                                                                   |
| `client_id`           | ID de cliente do provedor.                                                                                  |
| `client_id_file`      | Caminho do arquivo onde o ID de cliente do provedor está armazenado. Tem prioridade menor que `client_id`.  |
| `client_secret`       | Segredo de cliente do provedor.                                                                             |
| `client_secret_file`  | Caminho do arquivo onde o segredo de cliente do provedor está armazenado. Tem prioridade menor que `client_secret`. |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Expressão de claim do nome de usuário[\*](#claim-expression).                   |
| `email_claim`         | Expressão de claim do e-mail[\*](#claim-expression).                            |
| `name_claim`          | Expressão de claim do nome do perfil[\*](#claim-expression).                    |
| `order`               | Posição do botão do provedor na tela de login.                                                              |
| `allow_idp_initiated` | Habilita o [login iniciado pelo IdP](#idp-initiated-login) para este provedor. Padrão: `false`.             |
| `return_via_state`    | Passa o caminho de retorno pós-login pelo parâmetro OAuth `state` em vez da URL de redirecionamento. Padrão: `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Expressão de claim {#claim-expression}

Exemplo de expressão de claim:

```
email | {{ .username }}@your-domain.com
```

O Semaphore tenta primeiro obter o campo email. Se ele estiver vazio, a expressão seguinte é executada.

<div class="warning">
  A expressão <code>"username_claim": "|"</code> gera um <code>username</code> aleatório para cada usuário que faz login por meio do provedor.
</div>

## Login iniciado pelo IdP {#idp-initiated-login}

Por padrão, o Semaphore oferece suporte apenas ao login **iniciado pelo SP**: o usuário abre o Semaphore, clica no botão do provedor e
é redirecionado para o provedor de identidade (IdP).

Com o login **iniciado pelo IdP**, a jornada pode começar no provedor de identidade — por exemplo, clicando no
bloco do Semaphore no painel do Okta, no *My Apps* do Azure ou em um lançador de aplicações do Keycloak / Authentik.

O Semaphore implementa isso usando o mecanismo padrão **Third-Party Initiated Login**
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). O IdP
redireciona o navegador para uma **Initiate Login URI** dedicada, e o Semaphore então inicia um fluxo Authorization Code normal.
A autenticação em si continua sendo uma troca de código completa e segura — o Semaphore nunca aceita um token não solicitado.

### Habilitando {#enabling-it}

Defina `allow_idp_initiated` como `true` para o provedor:

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

### Configurando o provedor de identidade {#configuring-the-identity-provider}

No seu IdP, defina a **Initiate Login URI** da aplicação como:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

onde `<provider-id>` é a chave em `oidc_providers` (por exemplo, `mysso`).

O IdP deve enviar o parâmetro `iss` (issuer) para esse endpoint; o Semaphore rejeita requisições cujo `iss` não corresponda
ao provedor configurado. O parâmetro opcional `login_hint` é encaminhado ao IdP, e um `target_link_uri` opcional
define a página a ser aberta após o login (ele deve apontar de volta para o Semaphore; caso contrário, é ignorado).

Observações específicas por provedor:

- **Okta** — defina *Login initiated by* como *Either Okta or App* (ou *App Only*) e preencha a *Initiate login URI*. O Okta
  envia tanto `iss` quanto `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin** — defina a URL de lançamento / página inicial da aplicação como a Initiate Login URI.
- **Azure AD / Entra** — o *My Apps* usa uma URL inicial iniciada pelo SP e nem sempre envia `iss`; aponte a URL inicial para
  `https://your-domain.com/api/auth/oidc/<provider-id>/login` em vez disso.

### Segurança {#security}

- O login iniciado pelo IdP fica **desativado por padrão** e deve ser habilitado por provedor.
- O parâmetro `iss` é validado em relação ao issuer configurado para evitar confusão de provedores.
- `target_link_uri` é aceito somente quando aponta de volta para o Semaphore (sem redirecionamentos abertos).
- O fluxo passa pela troca completa de Authorization Code com `state` CSRF e um `nonce`, portanto um token capturado ou
  reproduzido não pode ser usado para fazer login.

## Tela de login {#sign-in-screen}

Para cada um dos provedores configurados, um botão de login adicional é adicionado à página de login:

![Captura de tela da página de login do Semaphore, com dois botões de login. Um diz "Sign In", o outro diz "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
