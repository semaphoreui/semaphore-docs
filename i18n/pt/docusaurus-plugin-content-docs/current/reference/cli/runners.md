# Runners

O comando `semaphore runner` executa o Semaphore em **modo runner** e gerencia o
registro de um runner no servidor. Um runner executa tarefas em uma máquina separada
do servidor do Semaphore.

```bash
semaphore runner --help
```

:::tip
Para saber como os runners funcionam e como configurar o lado do servidor, consulte o
guia [Runners](/admin-guide/runners).
:::

Executar `semaphore runner` sem subcomando apenas exibe a ajuda. Ele possui os
seguintes subcomandos:

| Comando | Finalidade |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | Cria interativamente um arquivo de configuração do runner (e registra se um token for fornecido). |
| [`runner register`](#registering-a-runner-runner-register) | Registra o runner no servidor usando um token de registro. |
| [`runner start`](#starting-a-runner-runner-start) | Executa em modo runner e começa a aceitar tarefas. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Remove o registro do runner do servidor. |

Todos os subcomandos aceitam a flag global `--config <path>` para apontar para o arquivo de
configuração do runner (e `--no-config` para executar apenas a partir de variáveis de ambiente).

## Configuração interativa (`runner setup`) {#interactive-setup-runner-setup}

Conduz uma configuração interativa, grava um arquivo de configuração do runner e, se
um token de registro estiver disponível (informado durante as perguntas ou definido via
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`), registra o runner no servidor
imediatamente.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Passe `--config <path>` para escolher onde o arquivo de configuração será gravado.
Sem essa flag, a configuração pergunta por um diretório de saída (padrão: o diretório
atual) e grava `config.runner.json` nele.

Ao concluir, ele exibe os comandos para iniciar o runner, por exemplo:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

Depois, você pode editar manualmente o arquivo de configuração gerado em vez de
executar a configuração novamente.

### Opções de configuração do runner {#runner-configuration-options}

Campos do bloco `runner` do arquivo de configuração:

| Campo | Variável de ambiente | Descrição |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Token de autenticação do runner (emitido no registro). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Token de registro. Apenas variável de ambiente; nunca é gravado no arquivo. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Caminho de um arquivo que contém o token de registro. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Nome do runner exibido no servidor. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | Array JSON de tags para o roteamento de runners do projeto. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL que o servidor chama quando uma tarefa é enfileirada para este runner. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Se o runner aceita tarefas. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | ID do projeto para um runner de nível de projeto. Omita para um runner global. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Intervalo de consulta em segundos. Padrão: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Número máximo de tarefas simultâneas. Padrão: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Encerra após processar um job. Útil para runners iniciados sob demanda por um webhook. |

Consulte [Runners](/admin-guide/runners) para detalhes de configuração e
[Configuração](/admin-guide/configuration) para a lista completa de opções.

## Registrando um runner (`runner register`) {#registering-a-runner-runner-register}

Registra o runner no servidor e armazena o token de runner emitido no arquivo de
configuração (sobrescrevendo qualquer token existente). O servidor precisa ter um
`runner_registration_token` configurado; você passa esse mesmo token aqui.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Flag | Descrição |
|------|-------------|
| `--registration-token-file <path>` | Lê o token de registro de um arquivo. |
| `--stdin-registration-token` | Lê o token de registro da entrada padrão. |
| `--name <name>` | Nome com o qual o runner será registrado. |
| `--tags <tags>` | Tags do runner, separadas por vírgula ou repetindo a flag (por exemplo, `--tags a,b` ou `--tags a --tags b`). |
| `--webhook <url>` | URL do webhook do runner. |
| `--enabled` | Habilita ou desabilita o runner no servidor. O padrão é `true`; passe `--enabled=false` para registrar um runner desabilitado. |
| `--project-id <id>` | Registra como um runner de nível de projeto para o projeto informado. Se omitido (ou `0`), o runner é registrado como um runner global. |

Apenas as flags que você realmente passa são aplicadas; `--name`, `--webhook`, `--tags`
e `--enabled` sobrescrevem os valores correspondentes do arquivo de configuração
e do ambiente somente quando definidas na linha de comando.

### De onde vem o token de registro {#where-the-registration-token-comes-from}

Ao registrar, o Semaphore obtém o token de registro da primeira
fonte disponível, nesta ordem:

1. A flag `--registration-token-file`.
2. A configuração `registration_token_file` no arquivo de configuração (ou
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. A entrada padrão, quando `--stdin-registration-token` é passada.
4. A variável de ambiente `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`.

Um arquivo de token que existe, mas está vazio, é um erro. Se nenhuma fonte fornecer um
token, o registro é tentado sem token e o servidor o rejeita.

## Iniciando um runner (`runner start`) {#starting-a-runner-runner-start}

Inicia o runner, conecta-se ao servidor e começa a aceitar tarefas. Este é
o comando que você executa para manter um runner registrado online.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Flag | Descrição |
|------|-------------|
| `--auto-register` | Registra o runner antes de iniciar, caso ainda não esteja registrado (ou seja, a configuração não possui token de runner). |
| `--register` | Alias de `--auto-register`. |

Com `--auto-register`, se a configuração não tiver `token`, o Semaphore lê o
token de registro de `registration_token_file` (ou
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) ou de
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, depois tenta o registro novamente a cada 5
segundos até ter sucesso, recarrega a configuração e inicia. Isso é
conveniente para runners que se registram sozinhos na primeira inicialização, por exemplo em
contêineres.

`runner start` não aceita `--registration-token-file` nem
`--stdin-registration-token`; essas flags pertencem apenas ao `runner register`.

## Cancelando o registro de um runner (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Remove o registro do runner do servidor, usando o token de runner do
arquivo de configuração.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
