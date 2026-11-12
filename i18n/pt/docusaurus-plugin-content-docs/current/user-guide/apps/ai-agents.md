---
title: Agentes de IA
description: Como criar um modelo de agente Claude Code ou Codex, seu prompt e as expressões do prompt, a chave de API, os servidores MCP, os argumentos de CLI e o log da tarefa.
---

# Agentes de IA

Usando o Semaphore UI, você pode executar agentes de IA para programação: [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) e [Codex](https://developers.openai.com/codex/cli). Um modelo de agente inicia a ferramenta de linha de comando do agente em um diretório de um repositório e entrega a ela um prompt. O agente trabalha sozinho, sem ninguém para responder às suas perguntas, e relata o que faz no log da tarefa.

Use um modelo de agente para trabalhos que, de outra forma, você descreveria a um colega: revisar o último commit, encontrar e corrigir um teste que falha, atualizar uma dependência e abrir um pull request. Como qualquer outro modelo, ele pode ser iniciado manualmente, por um [agendamento](/user-guide/schedules), por uma [integração](/user-guide/integrations) ou por um [workflow](/user-guide/workflows).

## Antes de começar {#before-you-begin}

- **A ferramenta de linha de comando do agente está instalada** na máquina que executa as tarefas: o servidor do Semaphore ou o [runner](/admin-guide/runners).

  | Aplicação | ID | Comando | Instalação |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  O Semaphore ativa uma aplicação quando encontra o comando dela no `PATH` durante a inicialização. Um administrador também pode ativá-la e definir o caminho do executável na página [Aplicações](/user-guide/apps#managing-applications).
- **Uma chave de API** do provedor do modelo, consulte [Chave de API](#api-key).
- **Um repositório** no qual o agente trabalha, adicionado em [Repositórios](/user-guide/repositories).

## Criar um modelo {#create-a-template}

1. Vá até a seção **Modelos de Tarefa**, clique em **Novo Modelo** e depois em **Claude Code Agent** ou **Codex Agent**.

![O menu Novo Modelo com os itens Claude Code Agent e Codex Agent](/assets/agent-template-new.webp)

2. Configure o modelo.

![O editor de um modelo Claude Code Agent](/assets/agent-template-editor.webp)

O modelo permite especificar os seguintes parâmetros:

| Campo | Descrição |
|---|---|
| **Repositório** | O repositório no qual o agente trabalha. O Semaphore o clona ou atualiza antes da tarefa, como em qualquer outro modelo. |
| **Subdirectory path** | Opcional. O diretório do repositório no qual o agente é iniciado. Se omitido, o agente é iniciado na raiz do repositório. |
| **MCP servers** | Opcional. Um inventário MCP com os servidores cujas ferramentas o agente pode chamar, consulte [Servidores MCP](#mcp-servers). |
| **Grupos de Variáveis** | Variáveis e segredos para o agente: a chave de API, os valores para as [expressões do prompt](#prompt-expressions), as variáveis de ambiente do processo do agente. |
| **Prompt** | A instrução com a qual o agente é executado, consulte [Prompt](#prompt). |
| **CLI args** | Argumentos extras para o comando do agente, consulte [Argumentos de CLI](#cli-arguments). |
| **Survey Variables** | Perguntas feitas quando a tarefa é iniciada. As respostas podem ser inseridas no prompt. |
| Caixa de seleção **Prompt** | Em **Claude Code prompts** ou **Codex prompts**. Permite que quem inicia uma tarefa substitua o prompt, consulte [Prompt de uma tarefa](#prompt-of-a-task). |

3. Clique em **Salvar** e, em seguida, execute o modelo com o botão **Executar**.

## Chave de API {#api-key}

O agente obtém a chave de API de uma variável de ambiente. Adicione a chave a um [Grupo de Variáveis](/user-guide/environment) do modelo como uma **variável de ambiente secreta**:

| Aplicação | Variável | Também aceita |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

O login do usuário que executa o Semaphore não é usado: cada tarefa recebe o seu próprio diretório de configuração do agente, vazio, de modo que uma chave em um Grupo de Variáveis é a única forma de autenticação.

Se nenhuma das variáveis estiver definida, o log da tarefa informa qual delas adicionar, e o próprio agente falha em seguida com o seu erro:

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## Prompt {#prompt}

O prompt é o que você digitaria para o agente: texto simples, do tamanho que for necessário. Ele é passado ao agente pela entrada padrão, portanto não aparece na lista de processos.

O prompt é obrigatório, a menos que a caixa de seleção **Prompt** permita que a tarefa traga o seu próprio.

### Expressões do prompt {#prompt-expressions}

O prompt de um modelo pode usar valores dos Grupos de Variáveis do modelo. Escreva uma expressão entre chaves duplas, como no GitHub Actions, e o Semaphore a substitui quando a tarefa é iniciada:

| Expressão | Valor |
|---|---|
| `${{ vars.extra.NAME }}` | Uma variável extra de um Grupo de Variáveis. |
| `${{ vars.env.NAME }}` | Uma variável de ambiente de um Grupo de Variáveis. |
| `${{ secrets.extra.NAME }}` | Uma variável extra secreta de um Grupo de Variáveis. |
| `${{ secrets.env.NAME }}` | Uma variável de ambiente secreta de um Grupo de Variáveis. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

As regras:

- **As variáveis de survey** são variáveis extras: a resposta à variável de survey `version` é `${{ vars.extra.version }}`, e a de uma variável secreta é `${{ secrets.extra.NAME }}`. Uma variável de survey entregue como variável de ambiente fica em `env`. Uma variável de survey sem resposta resulta em uma string vazia.
- **Uma variável que não existe faz a tarefa falhar** antes de o agente ser iniciado, com uma mensagem que indica a expressão. O Semaphore não executa um agente com uma lacuna no prompt.
- **Uma expressão escrita incorretamente é recusada ao salvar o modelo**: `${{ secrets.TOKEN }}` não tem `extra` nem `env`.
- **As demais expressões são mantidas como estão.** Apenas `vars.…` e `secrets.…` pertencem ao Semaphore, de modo que um prompt pode pedir ao agente que escreva um workflow contendo `${{ github.sha }}`. Para manter uma expressão `vars` ou `secrets` como texto, coloque mais um cifrão antes dela: `$${{ secrets.env.NAME }}`.
- **Um valor é inserido como está.** Uma string é usada como foi escrita; uma lista ou um objeto, como JSON. O valor inserido não é analisado novamente em busca de expressões.
- **Um segredo inserido no prompt é mascarado** no log da tarefa, onde quer que o agente o repita.

:::warning

Um segredo no prompt é enviado ao provedor do modelo junto com o restante do prompt, e o agente pode usá-lo de qualquer forma que o prompt permita. Prefira entregar o segredo às ferramentas do agente: como uma variável de ambiente secreta de um Grupo de Variáveis ou como o token de um [servidor MCP](#mcp-servers).

:::

### Prompt de uma tarefa {#prompt-of-a-task}

Com a caixa de seleção **Prompt** habilitada, o formulário da tarefa mostra o prompt do modelo e permite alterá-lo para uma única execução. Um agendamento, uma integração ou uma etapa de workflow podem manter um prompt próprio da mesma forma. Pela API, envie-o nos parâmetros da tarefa:

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

Um prompt fornecido por uma tarefa é usado exatamente como foi escrito: **as expressões do prompt são substituídas apenas no prompt armazenado no modelo**. Isso mantém as variáveis e os segredos do projeto fora do alcance de quem só pode executar tarefas. Se o modelo não permitir, uma tarefa que traz um prompt é recusada.

## Servidores MCP {#mcp-servers}

Um agente pode chamar as ferramentas de servidores [MCP](https://modelcontextprotocol.io) remotos: um rastreador de issues, uma busca na documentação, o seu próprio serviço. Os servidores ficam em um inventário do tipo **MCP Inventory**, e um mesmo inventário serve tanto aos modelos do Claude Code quanto aos do Codex.

1. Vá até a seção **Inventário**, clique em **Novo Inventário** e depois em **MCP Inventory**.
2. Adicione os servidores e clique em **Salvar**.
3. Selecione o inventário no campo **MCP servers** do modelo.

![O formulário de um inventário MCP com três servidores](/assets/agent-mcp-inventory.webp)

| Campo | Descrição |
|---|---|
| Interruptor | Um servidor desligado permanece na lista e não é entregue ao agente. |
| **Name** | O nome pelo qual o agente conhece o servidor: até 64 letras, dígitos, `-` e `_`. Ele é exibido no log da tarefa antes do nome de uma ferramenta. |
| **URL** | Um endereço `http` ou `https` de um servidor que fala MCP via HTTP ou SSE. Um nome de usuário ou uma senha na URL não são aceitos. |
| **Token** | Opcional. O agente o envia no cabeçalho `Authorization` como um bearer token. |

Um token salvo é armazenado criptografado e nunca mais é exibido: digite um novo para substituí-lo ou remova-o com o xis. O token chega ao agente como uma variável de ambiente do seu processo; ele não é gravado no arquivo de configuração do agente, na linha de comando nem no log da tarefa.

As ferramentas dos servidores selecionados são aprovadas antecipadamente, já que não há ninguém para confirmar uma chamada. O agente recebe exatamente esses servidores: os servidores MCP configurados para o usuário que executa o Semaphore não são usados.

## Argumentos de CLI {#cli-arguments}

Os **CLI args** são acrescentados ao comando do agente depois dos argumentos que o próprio Semaphore define. Informe cada token como um argumento separado:

```json
["--model", "claude-sonnet-5-5"]
```

Use-os para o que a linha de comando do próprio agente oferece: o modelo de IA, os limites, as permissões. O agente é executado sem supervisão, portanto uma ferramenta que pediria confirmação é recusada; quais ferramentas um agente pode usar sem perguntar é definido pelos seus argumentos. Consulte a [referência da CLI do Claude Code](https://docs.claude.com/en/docs/claude-code/cli-reference) e a [referência da CLI do Codex](https://developers.openai.com/codex/cli/reference) para conhecer as opções da sua versão.

Com **CLI args** habilitado em **Prompts**, uma tarefa pode acrescentar os seus próprios argumentos.

As variáveis e os segredos dos Grupos de Variáveis não são adicionados à linha de comando de um agente, onde a lista de processos os mostraria. As variáveis de ambiente e as variáveis de ambiente secretas são passadas ao processo do agente.

## Como o agente é executado {#how-the-agent-runs}

O Semaphore inicia o agente no diretório do repositório, ou no **Subdirectory path** dele, com o prompt na entrada padrão:

| Aplicação | Comando |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **Cada tarefa tem o seu próprio diretório de configuração** do agente (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`), criado para a tarefa e removido depois dela. As configurações, os logins e os servidores MCP do usuário que executa o Semaphore não chegam ao agente, e uma variável de um Grupo de Variáveis não pode redirecionar esse diretório.
- **Nada é mantido entre as tarefas**: cada execução é uma nova sessão do agente. O que deve sobreviver a uma execução pertence ao repositório: um commit, um pull request, um arquivo.
- **O agente lê os arquivos de instruções do repositório** que a sua ferramenta de linha de comando lê por conta própria no diretório de trabalho, como `CLAUDE.md` ou `AGENTS.md`.
- **Em runners Docker e Kubernetes**, o agente é executado em um contêiner, portanto a [imagem do executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) precisa conter o comando `claude` ou `codex`.

## Log da tarefa {#task-log}

O log da tarefa mostra o trabalho do agente à medida que ele acontece:

![O log de uma tarefa do Claude Code: o modelo, as chamadas de ferramentas, um subagente, o resumo](/assets/agent-task-log.webp)

- **O texto** do agente, linha por linha. O Codex exibe uma mensagem quando ela está completa.
- **As chamadas de ferramentas**, cada uma em uma linha: o estado, o servidor MCP e a ferramenta, os argumentos. Clique em uma linha para ver os argumentos e o resultado. Uma chamada que falhou já aparece aberta.
- **Subagentes**: as linhas de um subagente são marcadas com o nome dele.
- **A primeira linha** de uma execução do Claude Code indica o modelo de IA e os servidores MCP, com os que não se conectaram em vermelho.
- **O resumo** no final: o número de turnos, a duração, os tokens e o custo, na medida em que o agente os informa.

**Raw log** mostra o mesmo log como texto simples.

## Segurança {#security}

- **Um agente executa comandos.** Dentro das permissões que a sua ferramenta de linha de comando lhe concede, o agente pode ler e alterar o diretório do repositório, executar programas como o usuário que executa as tarefas e chamar as ferramentas dos seus servidores MCP. Dê a um modelo de agente o acesso que você daria a um script escrito por outra pessoa: um repositório e tokens com os direitos mais restritos que bastem para o trabalho, e um [runner](/admin-guide/runners) separado para o trabalho que você quer manter isolado do servidor.
- **O prompt e o que o agente lê vão para o provedor do modelo**: os arquivos do repositório, a saída dos comandos, os resultados das ferramentas.
- **Um repositório pode dar instruções ao agente.** O texto nos arquivos que o agente lê, em uma issue ou no resultado de uma ferramenta pode mudar o que o agente faz. Não aponte um agente com tokens poderosos para um conteúdo que você não controla.
- **Tokens e segredos são mascarados no log da tarefa**: os tokens dos servidores MCP e os segredos inseridos no prompt são substituídos por `********`.
- **Somente o prompt armazenado no modelo pode usar variáveis e segredos**, consulte [Prompt de uma tarefa](#prompt-of-a-task).
