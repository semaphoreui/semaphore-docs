---
title: Autenticação por proxy JWT
description: Faça o login de usuários a partir de um JWT assinado adicionado por um proxy reverso autenticador como o Pomerium, com todas as opções de auth.jwt e a configuração de logout.
---

# Autenticação por proxy JWT

Quando o Semaphore é executado atrás de um proxy reverso autenticador (por exemplo, Pomerium, Cloudflare Access ou OAuth2 Proxy), o proxy pode repassar a identidade do usuário em um cabeçalho com um JWT assinado. O Semaphore valida o JWT contra um endpoint JWKS e cria ou localiza o usuário automaticamente.

Isso evita duplicar a configuração OIDC entre o proxy e o Semaphore.

## Como funciona {#how-it-works}

1. O proxy reverso autentica o usuário e adiciona um JWT assinado a um cabeçalho HTTP configurado.
2. O Semaphore procura esse cabeçalho em todas as requisições. Se ele estiver presente, o token é validado contra o endpoint JWKS.
3. Se o token for válido, o usuário é localizado da mesma forma que no LDAP e no OIDC: primeiro pela identidade externa armazenada para a claim `sub` do token, depois por e-mail conforme `external_auth_email_matching` permitir, e, caso contrário, um novo usuário externo é criado. Veja [Como um registro de usuário passa a existir](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. Se o cabeçalho estiver presente, mas o token for inválido, o Semaphore retorna `401 Unauthorized` imediatamente -- a autenticação por bearer token e por sessão não é tentada.
5. Se o cabeçalho estiver ausente, a autenticação normal (bearer token, cookie de sessão) segue como de costume.

Os usuários criados pela autenticação JWT são marcados como **externos**, e a identidade deles é armazenada com o ID de provedor `jwt` e a claim `sub` do token. Um token sem a claim `sub` é rejeitado. Usuários locais (não externos) nunca são correspondidos por e-mail.

O proxy é considerado confiável quanto ao endereço de e-mail que coloca no token. Com o valor padrão `auto` de `external_auth_email_matching`, um usuário criado por uma versão anterior — que correspondia usuários JWT apenas por e-mail — é vinculado ao seu `sub` na próxima requisição. Com `never`, esses usuários não são correspondidos, e as requisições deles falham porque uma nova conta reutilizaria o endereço de e-mail. Deixe que eles entrem uma vez com `auto` antes de mudar para `never`.

## Considerações de segurança {#security-considerations}

O Semaphore faz o login de qualquer pessoa cuja requisição traga um token válido no
cabeçalho configurado. A assinatura impede que um cliente invente um token, mas não que
reutilize um que já tem, então o proxy precisa ser o único caminho de entrada:

- Garanta que o Semaphore não possa ser acessado sem passar pelo proxy. Vincule-o a
  um endereço privado ou bloqueie a porta no firewall; veja [Segurança de rede](/admin-guide/security/network).
- Configure o proxy para remover o cabeçalho JWT das requisições dos clientes e defini-lo
  apenas depois de autenticar o usuário.
- Defina `audience` com o valor que o proxy usa para o Semaphore. Sem isso, um token que o
  proxy emitiu para outra aplicação, assinado pelas mesmas chaves, também é aceito.

## Configuração {#configuration}

Tanto `header` quanto `jwks_url` são obrigatórios quando a autenticação JWT está habilitada. O Semaphore valida isso na inicialização.

### Arquivo de configuração {#config-file}

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

### Variáveis de ambiente {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Exemplo com Docker {#docker-example}

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

## Opções {#options}

| Parâmetro | Variável de ambiente | Descrição |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Habilita a autenticação por proxy JWT. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | Cabeçalho HTTP que contém o JWT. **Obrigatório.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL do endpoint JWKS para verificação da assinatura. **Obrigatório.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Claim `aud` esperada. Se vazia, a audience não é validada. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Claim `iss` esperada. Se vazia, o emissor não é validado. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | Claim do JWT com o e-mail do usuário. Padrão: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | Claim do JWT com o nome de exibição do usuário. Padrão: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | Claim do JWT com o nome de usuário. Padrão: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL para a qual o link de logout redireciona depois de limpar a sessão do Semaphore. Veja [Logout](#logout). |

## Algoritmos suportados {#supported-algorithms}

O Semaphore aceita tokens assinados com **ES256**, **ES384**, **ES512**, **RS256**, **RS384** ou **RS512**. Todo token precisa ter uma claim `exp`; tokens sem ela são rejeitados.

## Logout {#logout}

Clicar em logout no Semaphore limpa o cookie de sessão do Semaphore, mas a sessão do proxy reverso não é afetada -- então a requisição seguinte autentica o mesmo usuário de novo imediatamente.

Para encerrar completamente a sessão do usuário, defina `signout_url` com o endpoint de logout do proxy. Depois de limpar a sessão do Semaphore, o navegador é redirecionado para lá.

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

Exemplos para proxies comuns:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## Disponibilidade do JWKS {#jwks-availability}

O Semaphore busca o JWKS na inicialização. Se o endpoint JWKS estiver inacessível, o servidor inicia mesmo assim. O conjunto de chaves é atualizado em segundo plano a cada hora e também quando um token é assinado com um ID de chave que o Semaphore ainda não viu, no máximo uma vez a cada cinco minutos. A autenticação JWT retorna um erro até que as chaves estejam disponíveis.
