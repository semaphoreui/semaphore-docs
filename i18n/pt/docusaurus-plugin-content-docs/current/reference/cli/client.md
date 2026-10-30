---
title: Cliente
description: Gerenciar um servidor Semaphore pelo terminal e por scripts com semaphore client - login e contextos, precedência da configuração, formatos de saída, códigos de saída e execução de tarefas a partir de CI.
---

# Cliente

`semaphore client` controla um servidor Semaphore em execução por meio da sua API REST. Ele
precisa apenas da URL do servidor e de um token de API — sem acesso ao banco de dados e sem o
arquivo de configuração do servidor —, por isso funciona a partir de um notebook, de um job de CI
ou de um host que nunca viu o `config.json` do servidor.

```bash
semaphore client --help
```

Os comandos seguem o formato `semaphore client <resource> <action> [id|name]`.
Os recursos são nomeados no singular, com o plural como alias
(`template list` e `templates list` são a mesma coisa). Todo recurso tem `list`,
`get`, `create`, `update` e `delete`; as tarefas acrescentam `run`, `logs`, `wait`, `stop`
e outros. A lista completa, gerada automaticamente, de todos os comandos e flags está na
[Referência de comandos](/reference/cli/commands#semaphore-client).

| Grupo | Finalidade |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Fazer login, verificar o token, exibi-lo, fazer logout. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Manter vários servidores em um único arquivo de configuração e alternar entre eles. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Projetos, seus membros, backups e restaurações. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Templates de tarefa e `template run` para iniciar uma tarefa. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Logs, espera, parada, confirmação e reexecução de tarefas. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | Os demais recursos de um projeto. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Recursos de todo o servidor (somente administradores). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Versão e configurações do servidor. |

## Primeiro login {#first-login}

Modo interativo: o cliente pede o login, a senha e, quando o TOTP está
habilitado, o código; em seguida cria um token de API e o salva. A senha é usada
uma única vez e nunca é armazenada.

```bash
semaphore client auth login --url https://semaphore.example.com
```

Com um token existente (também é a forma de fazer login em um servidor que oferece apenas
single sign-on — crie o token na página **Tokens** do seu perfil):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Ambas as formas salvam um *contexto* com o nome do host do servidor em
`~/.semaphore/client.yml` e o tornam o contexto atual. Verifique o que está em uso com
`semaphore client auth status`.

## Configuração {#configuration}

Cada configuração pode vir de uma flag, de uma variável de ambiente ou do
contexto atual, nesta ordem de precedência: **flag > ambiente > contexto > padrão**.

| Flag | Variável de ambiente | Significado |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | URL do servidor, por exemplo `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Nome do contexto a usar no lugar do atual. |
| — | `SEMAPHORE_CLIENT_TOKEN` | Token de API. Não existe uma flag `--token` de propósito: os argumentos do processo ficam visíveis no `ps` e no histórico do shell. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | Arquivo que contém o token (uma quebra de linha final é ignorada). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | ID ou nome do projeto para comandos no escopo de um projeto. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (padrão), `json` ou `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Tempo limite de uma requisição HTTP, padrão `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | Arquivo PEM com a CA que assinou o certificado do servidor. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | Ignora a verificação TLS. Cada chamada exibe um aviso; prefira `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | Nunca faz perguntas; um comando que precisaria de uma resposta falha. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | Registra as requisições HTTP no stderr. Os cabeçalhos de autorização e de cookie são mascarados. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Caminho do arquivo de configuração, padrão `~/.semaphore/client.yml`. |

Um token vindo do ambiente só é usado quando a URL também vem do
ambiente ou de uma flag. Isso impede que um token de CI seja enviado a outro
servidor quando alguém executa o mesmo job com `--context other`.

### O arquivo de configuração {#the-configuration-file}

`~/.semaphore/client.yml` contém contextos nomeados. `auth login` e `context set`
gravam nele; você também pode editá-lo manualmente.

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # ou token_file
    project: 3                # projeto padrão, ID ou nome
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

O cliente cria o diretório com o modo `0700` e o arquivo com `0600`. Um
arquivo com permissão de escrita para o grupo ou para outros é recusado, com a sugestão de executar
`chmod 600`; um arquivo legível por outros gera um aviso.

## Saída {#output}

Os dados vão para o stdout; mensagens, avisos e progresso vão para o stderr, de modo que um script
pode capturar um sem o outro.

| Flag | Efeito |
|------|--------|
| `-o json` | JSON válido sem decoração. Uma lista é sempre um array; uma lista vazia é `[]`. Os nomes dos campos são os da API. |
| `-o yaml` | Os mesmos dados em YAML. |
| `--fields id,name,status` | Somente estas colunas ou campos. Campos aninhados usam ponto: `--fields id,params.limit`. |
| `-q`, `--quiet` | Somente IDs, um por linha — para `xargs` e loops. |
| `--no-headers` | Tabela sem a linha de cabeçalho. |
| `--no-color` | Sem cores. As cores também ficam desativadas quando o stdout não é um terminal ou quando `NO_COLOR` está definido. |

Quando o stdout não é um terminal, as colunas da tabela são separadas por tabulação e nunca
truncadas.

Os objetos são referenciados por ID numérico ou por nome. Um nome é procurado no
projeto, sem diferenciar maiúsculas de minúsculas; quando vários objetos têm o mesmo nome, o comando encerra
com o código 5 e lista os candidatos no stderr.

## Códigos de saída {#exit-codes}

| Código | Significado |
|------|---------|
| `0` | Sucesso. Para um comando que aguarda: a tarefa terminou com `success`. |
| `1` | Erro do cliente ou da API — falha de rede, erro do servidor, resposta inesperada. |
| `2` | Erro de uso: flag desconhecida, argumento ausente, projeto não informado ou confirmação necessária sem um terminal (passe `--yes`). |
| `3` | A tarefa aguardada terminou com o status `error`. |
| `4` | Falha na autenticação (HTTP 401 ou 403). |
| `5` | Objeto não encontrado ou nome que corresponde a vários objetos. |
| `6` | A tarefa aguardada terminou com o status `stopped`. |
| `124` | O `--wait-timeout` expirou. A tarefa continua em execução no servidor. |
| `130` | Interrompido com Ctrl+C. O cliente se desconecta; a tarefa continua em execução, a menos que `--stop-on-interrupt` tenha sido informado. |

## Executar tarefas a partir de scripts {#running-tasks-from-scripts}

Configure um job de CI inteiramente pelo ambiente e deixe o código de saída
decidir o resultado:

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Inicia uma tarefa, transmite o log e encerra com 0/3/6 conforme o status final
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Inicia agora, aguarda depois
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` e `--extra-vars-file` preenchem as variáveis extras da tarefa;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` e `--diff` sobrescrevem
o que o template permite sobrescrever.

Uma tarefa pode parar no meio e esperar aprovação: um plano do Terraform antes
de ser aplicado, ou qualquer template cuja aplicação pergunte primeiro. Em um
terminal, o cliente imprime `Apply task <id>? [yes/no]` e envia a resposta ao
servidor. Sem terminal, ele relata a parada no stderr e continua esperando,
então um job de CI precisa de `task confirm <id>` ou `task reject <id>` de outro
lugar, de `--auto-approve` quando o template permite, ou de `--wait-timeout`
para desistir. Uma tarefa rejeitada termina como `error`, ou seja, com código de
saída 3.

Combine `-o json` com `jq` para tudo o que a tabela não mostra:

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Segredos e tokens {#secrets-and-tokens}

- O token nunca é exibido, exceto por `auth token`, que existe para repassá-lo a
  outra ferramenta e emite um aviso quando o stdout é um terminal.
- Senhas e material de chaves são lidos somente de arquivos ou do stdin:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. Os segredos de ambiente passam por
  `environment create --secrets-file`.
- `environment get` e `key get` mostram os nomes dos segredos, nunca os valores,
  em todos os formatos de saída.
- `auth logout --revoke` exclui o token no servidor, além de localmente.
- Comandos destrutivos pedem confirmação em um terminal e exigem `--yes`
  sem um; `project delete` exige o nome do projeto com `--confirm`.
