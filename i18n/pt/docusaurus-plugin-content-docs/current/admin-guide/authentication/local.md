---
title: Contas locais
description: Login por senha contra o banco de dados do Semaphore - como as senhas são armazenadas, autenticação de dois fatores TOTP, duração da sessão e como desativar as senhas.
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

O Semaphore oferece suporte a TOTP: os códigos de seis dígitos gerados pelo Google
Authenticator, Aegis, 1Password e aplicativos semelhantes. Vem desabilitado e vale para as
contas que o habilitarem — não é imposto a todo mundo.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| Opção | Efeito |
|---|---|
| `mfa.totp.enabled` | Permite que os usuários adicionem TOTP à sua conta. Sem isso, ninguém consegue se cadastrar. |
| `mfa.totp.allow_recovery` | Emite um código de recuperação no cadastro, para que um telefone perdido não signifique uma conta perdida. Informá-lo **remove o cadastro TOTP** e conecta o usuário; depois ele se cadastra novamente. O código é armazenado como um hash bcrypt. |
| `mfa.totp.app_name` | O rótulo de emissor exibido pelo aplicativo autenticador. Defina-o quando você executa mais de um Semaphore. |

Os usuários se cadastram na própria página de conta. Um administrador pode inspecionar ou
remover o segundo fator de quem perdeu o dispositivo:

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

Desligar `mfa.totp.enabled` de novo não apaga o cadastro de ninguém; apenas deixa de pedir o
segundo fator. Ligue novamente e os cadastros antigos voltam a valer.

## Duração da sessão {#session-lifetime}

Uma sessão expira depois de **sete dias sem atividade**. Esse tempo limite de inatividade é
embutido e não configurável.

Já um limite absoluto é configurável, e é medido a partir do momento do login, e não da
última requisição, de modo que uma sessão em uso ativo também termina:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

O padrão, `0`, significa nenhum limite absoluto. Defina-o quando uma estação de trabalho
compartilhada ou uma regra de conformidade exigir que as pessoas se autentiquem novamente em
intervalos regulares.

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
- [Segurança](/admin-guide/security) — parâmetros de hashing, criptografia e hardening.
