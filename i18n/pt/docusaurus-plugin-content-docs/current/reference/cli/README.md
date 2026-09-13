# CLI

O binário `semaphore` é ao mesmo tempo o servidor e uma ferramenta completa de administração. Execute-o
sem argumentos (ou `semaphore help`) para listar todos os comandos:

```bash
semaphore help
```

Para a lista exaustiva e gerada de todos os comandos e opções, consulte a
[referência de comandos](/reference/cli/commands). A maioria das tarefas
administrativas tem um grupo de comandos dedicado:

| Grupo de comandos | Finalidade |
|---------------|---------|
| [`semaphore users`](/reference/cli/users) | Adicionar, alterar, remover e inspecionar usuários; gerenciar tokens de API e TOTP (2FA). |
| [`semaphore projects`](/reference/cli/projects) | Exportar e importar projetos (backups). |
| [`semaphore vaults`](/reference/cli/vaults) | Recriptografar segredos armazenados e inspecionar o uso das chaves de criptografia. |
| [`semaphore runner`](/reference/cli/runners) | Executar em modo runner e registrar/cancelar o registro de runners. |
| [`semaphore migrate`](/reference/cli/migrations) | Aplicar ou reverter migrações do banco de dados. |

Vários grupos de comandos têm aliases mais curtos: `users`/`user`, `projects`/`project`,
`vaults`/`vault` e `server`/`service`.

:::info
Todo comando que acessa o banco de dados (`users`, `projects`, `vaults`, `migrate`,
`server`) aplica as migrações de esquema pendentes antes de ser executado. Faça um backup
do banco de dados antes de executar a CLI de uma versão mais recente do Semaphore em um
banco de dados existente.
:::

## Opções globais {#global-options}

Estas flags são aceitas por todos os comandos:

| Opção | Descrição |
|--------|-------------|
| `--config <path>` | Caminho para o arquivo de configuração. |
| `--no-config` | Não lê nenhum arquivo de configuração — usa apenas variáveis de ambiente. |
| `--log-level <level>` | Nível de detalhe do log: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` ou `PANIC`. Se omitido, usa a variável de ambiente `SEMAPHORE_LOG_LEVEL`. |
| `--debug-filter <spec>` | Restringe a saída `DEBUG` a namespaces específicos, por exemplo `'runner,task_*'` ou `'*,-db'`. Só tem efeito quando o nível de log é `DEBUG`. Se omitido, usa `SEMAPHORE_DEBUG_FILTER`. |

### Como o arquivo de configuração é localizado {#how-the-configuration-file-is-found}

Quando `--config` é omitido, o Semaphore procura o arquivo nesta ordem e usa
o primeiro que existir:

1. O caminho na variável de ambiente `SEMAPHORE_CONFIG_PATH`.
2. `config.json`, `config.yaml` ou `config.yml` no diretório atual.
3. `/usr/local/etc/semaphore/config.json` (ou `.yaml` / `.yml`).
4. `/etc/semaphore/config.json` (ou `.yaml` / `.yml`).

As variáveis de ambiente são aplicadas sobre o arquivo, portanto elas sobrescrevem os
valores do arquivo. Com `--no-config`, apenas variáveis de ambiente e valores padrão são usados. Consulte
[Configuração](/admin-guide/configuration) para a lista completa de opções.

## Versão {#version}

Exibe a versão atual.

```bash
semaphore version
```

## Configuração interativa {#interactive-setup}

Use isto para a configuração inicial. Ele gera os segredos, conduz um
questionário interativo, grava o arquivo de configuração, executa as
migrações do banco de dados e cria o primeiro usuário administrador.

```bash
semaphore setup
```

Passe `--config <path>` para escolher onde o arquivo de configuração será gravado.
Sem isso, o setup pergunta um diretório de saída (padrão: o diretório
atual) e grava `config.json` nele.

Se o nome de usuário ou e-mail informado já existir, o setup mantém o usuário
existente em vez de criar um novo.

Ao concluir, ele exibe os comandos para iniciar o servidor, por exemplo:

```bash
./semaphore server --config /path/to/config.json
```

## Modo servidor {#server-mode}

Inicia o servidor do Semaphore (interface web e API). `service` é um alias de `server`.

```bash
semaphore server --config /path/to/config.json
```

O servidor aplica as migrações pendentes do banco de dados na inicialização e exibe o
banco de dados, o caminho temporário, a interface e a porta que está usando.

## Modo runner {#runner-mode}

Executa o Semaphore como um runner de tarefas. Consulte [Runners](/reference/cli/runners) para o
conjunto completo de subcomandos (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/runner-config.json
```

## Migração do banco de dados {#database-migration}

Atualiza o esquema do banco de dados. Consulte
[Migrações do banco de dados](/reference/cli/migrations) para aplicar ou reverter
para uma versão específica.

```bash
semaphore migrate --config /path/to/config.json
```
