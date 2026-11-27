---
title: Contas locais
description: Login por senha contra o banco de dados do Semaphore - como as senhas são armazenadas, gerenciamento de contas, duração da sessão e como desativar as senhas.
---

# Contas locais

Uma conta local guarda sua senha no banco de dados do Semaphore. Toda instalação começa com
uma, criada por `semaphore setup` ou pelas variáveis `SEMAPHORE_ADMIN_*`, e é por essa conta
que você alcança o servidor antes de existir qualquer provedor de identidade.

Mantenha pelo menos um administrador local mesmo depois que o single sign-on funcionar. É a
única forma de voltar a entrar quando o provedor de identidade estiver inacessível.

## Como as senhas são armazenadas {#how-passwords-are-stored}

As senhas são hasheadas com **Argon2id** usando os parâmetros de força mínima da OWASP, e os
parâmetros são registrados junto de cada hash no
[formato de string PHC](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).
As versões anteriores à 2.20 usavam bcrypt; esses hashes continuam funcionando e cada um é
substituído por um hash Argon2id no próximo login bem-sucedido do dono. Contas que nunca mais
fazem login mantêm o hash bcrypt, então redefina essas senhas para atualizá-las.

A tabela completa de parâmetros está em [Segurança](/admin-guide/security#password-hashing).

O Semaphore não aplica nenhuma política de senha — sem comprimento mínimo, sem complexidade,
sem expiração. Se você precisa de uma, use um diretório ou um provedor de identidade, que é
onde esse tipo de política pertence.

## Gerenciar contas {#manage-accounts}

Os administradores gerenciam usuários pela interface web, e as mesmas operações existem na
linha de comando, para scripts e para recuperação quando ninguém consegue entrar:

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

Veja [`semaphore users`](/reference/cli/users) para todas as flags e
[Equipes](/user-guide/team) para o que cada papel permite a um usuário depois que ele entra.

:::warning
Uma senha na linha de comando fica no histórico do seu shell e na lista de processos da
máquina. Use isso para o primeiro administrador e para recuperação, e depois troque a senha
pela interface web.
:::

## Autenticação de dois fatores {#two-factor-authentication}

Uma conta local pode pedir um segundo fator depois da senha: um código TOTP de seis dígitos
de um aplicativo autenticador. Vem desabilitado, é ativado para o servidor com
`mfa.totp.enabled` e cada usuário o configura na própria conta. Como funciona, como ativá-lo,
como entrar com um código e como recuperar o acesso após perder o telefone está descrito em
[Autenticação de dois fatores](/admin-guide/authentication/two-factor).

## Duração da sessão {#session-lifetime}

Dois limites independentes encerram uma sessão; o que for atingido primeiro desconecta o
usuário.

O **tempo limite de inatividade** conta a partir da última requisição. Toda requisição
autenticada, incluindo o polling em segundo plano de uma aba aberta do navegador, o reinicia.
O padrão é 168 horas (sete dias):

```json
{
  "auth": {
    "session_inactivity_hours": 8
  }
}
```

O **limite absoluto** conta a partir do momento do login, e não da última requisição, de modo
que uma sessão em uso ativo também termina:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

O padrão, `0`, significa nenhum limite absoluto. Defina-o quando uma estação de trabalho
compartilhada ou uma regra de conformidade exigir que as pessoas se autentiquem novamente em
intervalos regulares. Um navegador deixado aberto em uma página que consulta a API
periodicamente mantém a sessão ativa, então só o limite absoluto encerra com segurança uma
sessão assim.

## Desativar o login por senha {#turn-password-sign-in-off}

Depois que um provedor de identidade estiver configurado e você tiver verificado que um
usuário real consegue entrar por ele, `password_login_disable` rejeita completamente o método
de senha:

```json
{
  "password_login_disable": true
}
```

LDAP e OpenID Connect não são afetados. As contas locais existentes mantêm seus papéis e seu
histórico; elas simplesmente ficam sem forma de se autenticar.

:::danger
Essa opção vale imediatamente e se aplica a todas as contas locais, inclusive a sua. Confirme
que o single sign-on funciona — entrando com ele, não lendo o log — antes de defini-la.
Recuperar-se de um erro significa editar o arquivo de configuração no servidor e reiniciar.
:::

## Próximos passos {#whats-next}

- [LDAP e Active Directory](/admin-guide/authentication/ldap) — autenticar contra um diretório.
- [OpenID Connect](/admin-guide/authentication/openid) — single sign-on com um provedor de identidade.
- [Autenticação de dois fatores](/admin-guide/authentication/two-factor) — pedir um código TOTP depois da senha.
- [Segurança](/admin-guide/security) — parâmetros de hashing, criptografia e hardening.
