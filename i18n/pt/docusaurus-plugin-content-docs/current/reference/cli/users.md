# Usuários

O comando `semaphore users` adiciona, altera, remove e inspeciona usuários, além de
gerenciar seus tokens de API e a verificação TOTP (2FA).

```bash
semaphore users --help
```

> `user` é um alias para `users`.

| Comando | Finalidade |
|---------|---------|
| [`users add`](#add-a-user) | Cria um usuário. |
| [`users change-by-login`](#change-a-user) | Atualiza um usuário localizado pelo login. |
| [`users change-by-email`](#change-a-user) | Atualiza um usuário localizado pelo e-mail. |
| [`users get`](#show-a-user) | Exibe os detalhes de um usuário. |
| [`users list`](#list-users) | Exibe os logins de todos os usuários. |
| [`users delete`](#delete-a-user) | Remove um usuário. |
| [`users token create`](#create-a-token) | Cria um token de API para um usuário. |
| [`users token list`](#list-tokens) | Lista os tokens de API de um usuário. |
| [`users totp enable`](#totp-management) | Habilita o TOTP para um usuário. |
| [`users totp show`](#totp-management) | Mostra os detalhes do TOTP de um usuário. |
| [`users totp disable`](#totp-management) | Desabilita o TOTP para um usuário. |

## Adicionar um usuário {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Flag | Descrição |
|------|-------------|
| `--login` | Login do usuário. **Obrigatório.** |
| `--name` | Nome de exibição do usuário. **Obrigatório.** |
| `--email` | E-mail do usuário. **Obrigatório.** |
| `--password` | Senha do usuário. Obrigatória para usuários comuns; não permitida para usuários externos. |
| `--admin` | Marca o novo usuário como administrador. |
| `--external` | Marca o novo usuário como externo (LDAP ou OIDC). Usuários externos não devem receber `--password`. |

Em caso de sucesso, o comando exibe `User <login> <email> added!`.

## Alterar um usuário {#change-a-user}

Você pode localizar o usuário a ser alterado pelo login ou pelo e-mail.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| Flag | Descrição |
|------|-------------|
| `--login` | Para `change-by-login`, o login do usuário a ser localizado (**obrigatório**). Para `change-by-email`, o novo login do usuário. |
| `--email` | Para `change-by-email`, o e-mail do usuário a ser localizado (**obrigatório**). Para `change-by-login`, o novo e-mail do usuário. |
| `--name` | Novo nome do usuário. |
| `--password` | Nova senha do usuário. |
| `--admin` | Concede direitos de administrador. |

Somente as flags informadas são aplicadas; os campos omitidos permanecem inalterados.
`--admin` só pode conceder direitos de administrador. Não é possível revogá-los; use a interface web
para isso.

## Mostrar um usuário {#show-a-user}

Exibe os detalhes de um único usuário, localizado pelo login ou pelo e-mail.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

É necessário informar pelo menos um entre `--login` e `--email`. A saída inclui o
ID do usuário, a data de criação, o login, o nome, o e-mail e o status de administrador. Se nenhum usuário
corresponder, o comando exibe uma mensagem e encerra com status diferente de zero.

## Listar usuários {#list-users}

Exibe os logins de todos os usuários, um por linha.

```bash
semaphore user list
```

## Excluir um usuário {#delete-a-user}

Remove um usuário, localizado pelo login ou pelo e-mail.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

É necessário informar pelo menos um entre `--login` e `--email`.

## Gerenciamento de tokens de API {#api-token-management}

Gerencie os tokens de API de um usuário pela CLI:

```bash
semaphore user token --help
```

### Criar um token {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Flag | Descrição |
|------|-------------|
| `--login` | Login do proprietário do token. **Obrigatório.** |
| `--name` | Nome do token. |
| `--ttl` | Tempo de vida do token como uma duração do Go (ex.: `1h`, `30m`, `24h`). Se omitido, o token nunca expira. |

O comando exibe o novo token em uma linha própria e nada mais, portanto é seguro
capturá-lo em um script:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

Um valor inválido de `--ttl` ou um login desconhecido é reportado e o comando encerra
com status diferente de zero.

### Listar tokens {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` é obrigatório. Cada linha lista o nome do token, seu status (`active` ou
`expired`) e sua data de expiração no formato RFC 3339 (`never` se não tiver
expiração), separados por tabulações. Os valores dos tokens nunca são exibidos.

## Gerenciamento de TOTP {#totp-management}

Gerencie a verificação por senha de uso único baseada em tempo (2FA) pela CLI:

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

Todos os subcomandos de TOTP exigem `--login`.

- `enable` exibe um código de recuperação de uso único, a URL `otpauth://` e um
  QR code que pode ser escaneado. Guarde o código de recuperação em um local seguro. O comando falha se o TOTP
  já estiver habilitado para o usuário.
- `show` exibe novamente a URL `otpauth://` e o QR code, ou `TOTP disabled` se
  o usuário não tiver TOTP configurado.
- `disable` remove a verificação TOTP do usuário. O comando falha se o TOTP não
  estiver habilitado.

O emissor mostrado nos aplicativos autenticadores é obtido da opção de configuração `mfa.totp.app_name`
(`SEMAPHORE_TOTP_ISSUER`). O padrão é `Semaphore`.
