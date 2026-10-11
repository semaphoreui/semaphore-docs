---
title: "Workflows"
description: Encadeamento de templates em um DAG com nós de tarefa, aprovação, atraso e nota, condições de arestas, saídas passadas entre nós como entradas, monitoramento de execuções e permissões.
sidebar_custom_props:
  edition: pro
---

# Workflows <Pro />

Os workflows permitem encadear vários modelos de tarefa em um grafo direcionado (DAG) com
ramificações, aprovações e pausas temporizadas. Uma execução de workflow avança automaticamente
à medida que cada etapa termina — você desenha o grafo uma única vez no editor visual e, em seguida,
inicia execuções a partir da página Workflows.

:::info
Os workflows são um recurso do **Semaphore Pro**. O item de menu Workflows aparece somente
quando a sua assinatura os inclui.
:::

## Visão geral {#overview}

Um workflow consiste em:

- **Nós** — etapas do grafo (executar um modelo, aguardar aprovação, pausar por um
  intervalo ou anotar com uma nota).
- **Arestas** — conexões entre os nós, cada uma rotulada com uma **condição** que
  controla quando o nó seguinte é iniciado.

Quando você inicia um workflow, o Semaphore cria uma **execução de workflow**. O servidor
conduz a progressão: conforme as tarefas são concluídas, as aprovações são resolvidas ou os atrasos expiram,
os nós seguintes são iniciados de acordo com as condições das arestas.

## Criando um workflow {#creating-a-workflow}

1. Abra o seu projeto e vá para **Workflows**.
2. Clique em **New Workflow**.
3. No editor gráfico:
   - Arraste nós da paleta para a área de trabalho.
   - Conecte os nós arrastando a partir do conector de saída de um nó até outro.
   - Clique em um nó ou aresta para editar as suas propriedades no painel lateral.
4. Defina um **nome** (e, opcionalmente, uma **versão inicial** para o versionamento das execuções).
5. Corrija quaisquer problemas listados no painel **Problems** e clique em **Save**.

![Editor de workflow](/assets/workflow-editor.webp)

O editor valida o grafo antes de salvar. Um workflow válido deve ter pelo menos
um nó, exatamente um nó inicial (sem arestas de entrada), nenhum ciclo e configuração
completa em todos os nós executáveis.

## Tipos de nó {#node-kinds}

| Tipo | Finalidade |
|------|---------|
| **Task** | Executa um modelo de tarefa. Você pode sobrescrever os parâmetros do modelo (inventário, ambiente, limit do Ansible, argumentos extras de CLI) por nó por meio dos **parâmetros da tarefa**. |
| **Approval** | Pausa a execução até que um usuário com permissão aprove ou rejeite. Opcionalmente, defina um tempo limite (em segundos) e uma mensagem de aprovação. |
| **Delay** | Aguarda um número configurado de segundos antes de continuar para os nós seguintes. Útil para períodos de espera, janelas de manutenção ou para espaçar etapas dependentes. |
| **Note** | Anotação livre na área de trabalho. Nós de nota não são executados nem conectados por arestas — servem apenas para documentação. |

### Convergência {#convergence}

Nós com várias arestas de entrada podem exigir que **todos** os nós anteriores terminem
(padrão) ou **qualquer** um deles. Defina a **Convergência** no painel de propriedades do nó.

### Nós de atraso {#delay-nodes}

Um nó de atraso pausa a execução do workflow pela duração configurada (mínimo de 1
segundo). Durante a espera:

- A execução permanece no status **running**.
- A visualização da execução mostra uma contagem regressiva ao vivo no nó de atraso.
- Os nós seguintes conectados por arestas não são iniciados até que o atraso termine.

Se a execução do workflow for **interrompida** enquanto um atraso estiver ativo, o atraso é
cancelado e a execução termina com o status **stopped**.

### Nós de aprovação {#approval-nodes}

Quando a execução chega a um nó de aprovação, o status muda para **approval** até que
alguém aprove ou rejeite. Os controles Approve/Reject aparecem na visualização da execução.
Aprovações rejeitadas fazem a execução falhar de acordo com as condições das arestas conectadas.

## Condições das arestas {#edge-conditions}

Cada aresta tem uma condição que determina quando o nó seguinte fica pronto:

| Condição | O nó seguinte inicia quando o nó anterior… |
|-----------|-------------------------------------------|
| **On success** | Termina com sucesso (padrão). |
| **On failure** | Termina com erro. |
| **Always** | Termina em qualquer estado final (sucesso ou falha). |

Use ramificações **On failure** para ações de compensação ou notificações. Use
**Always** quando a próxima etapa deve ser executada independentemente do resultado.

## Executando e monitorando {#running-and-monitoring}

- **Run workflow** — inicia uma nova execução a partir da lista de Workflows.
- **Visualização da execução** — grafo em tela cheia com o status ao vivo de cada nó (em execução, sucesso,
  falha, aprovação, contagem regressiva do atraso).
- **Stop** — enquanto uma execução está em `running` ou `approval`, usuários com
  `run_project_tasks` podem interrompê-la. Todas as tarefas ativas são interrompidas, as aprovações
  pendentes são rejeitadas e a execução é marcada como **stopped**.

Status das execuções: `running`, `approval`, `success`, `failed`, `stopped`.

## Versionamento das execuções {#run-versioning}

Defina **Start version** no workflow (por exemplo, `1.0.0`) para ativar rótulos de versão
em cada execução. O Semaphore incrementa a versão em execuções sucessivas, de forma semelhante
aos modelos de build.

## Saídas e entradas {#outputs-and-inputs}

Um nó de tarefa pode entregar dados estruturados aos nós seguintes. A tarefa **produz saídas**: um
objeto JSON de valores nomeados, armazenado com a tarefa quando ela é concluída com sucesso. Uma conexão
até o próximo nó de tarefa **entrega entradas**: ela preenche as variáveis de survey do template desse
nó a partir das saídas do nó anterior. Nenhum arquivo é passado, apenas valores.

### Produzindo saídas {#producing-outputs}

Toda tarefa iniciada por uma execução de workflow recebe a variável de ambiente `SEMAPHORE_OUTPUTS_FILE`:
o caminho de um arquivo vazio criado somente para essa tarefa. Tudo o que a tarefa grava nele como um
objeto JSON se torna as suas saídas.

| Aplicação | Como as saídas são produzidas |
|-----|--------------------------|
| **Ansible** | `ansible.builtin.set_stats` com `per_host: false` (o padrão). O plugin de callback `semaphore_outputs`, incluído no Semaphore, grava no arquivo as estatísticas agregadas da execução; as estatísticas por host não são saídas. |
| **Terraform, OpenTofu, Terragrunt** | Capturadas automaticamente de `output -json` após uma execução bem-sucedida. Um valor que a própria tarefa gravou no arquivo prevalece sobre uma saída capturada com o mesmo nome. |
| **Bash, Python, PowerShell, Pulumi** | O script grava o arquivo. |

```bash
# Bash: gravar o arquivo de saídas
cat > "$SEMAPHORE_OUTPUTS_FILE" <<EOF
{"image_tag": "1.4.2", "replicas": 3, "subnet_ids": ["subnet-1", "subnet-2"]}
EOF
```

```yaml
# Ansible: set_stats se torna saídas
- name: Publish the image tag for the next nodes
  ansible.builtin.set_stats:
    data:
      image_tag: "{{ built_tag }}"
```

Regras:

- As saídas são lidas somente quando a tarefa **é concluída com sucesso**. Uma tarefa que falhou ou foi
  interrompida não tem saídas, portanto uma ramificação **On failure** não recebe nada do nó que falhou.
- Os nomes das saídas correspondem a `^[A-Za-z_][A-Za-z0-9_-]*$`. Um valor pode ser qualquer valor JSON:
  string, número, booleano, lista ou objeto.
- Limites: o arquivo tem no máximo 256 KB, com no máximo 100 saídas de no máximo 32 KB cada.
- Um arquivo ausente ou vazio significa "sem saídas". Um arquivo que não é um objeto JSON, usa um nome
  inválido ou excede um limite **faz a tarefa falhar**, com o motivo no seu log.
- As saídas do Terraform que não podem ser armazenadas — marcadas como `sensitive`, grandes demais, com
  um nome inválido ou acima dos limites — são ignoradas e listadas no log da tarefa e no painel
  **Outputs** da tarefa como **Not captured**. Elas nunca fazem a tarefa falhar.

### Entregando entradas {#delivering-inputs}

Clique em uma conexão que termina em um nó de tarefa: o seu painel lateral tem uma seção **Inputs**.

- **Por nome** (padrão). Cada saída do nó de origem cujo nome é igual ao de uma variável de survey
  do template de destino preenche essa variável. As saídas sem variável correspondente são
  ignoradas; uma saída do Terraform com hífen nunca é um nome de variável válido, portanto não é
  entregue.
- **Map inputs explicitly.** Marque a caixa para entregar apenas os pares que você listar: uma variável
  de survey do template de destino e a chave de saída que a alimenta. Uma lista vazia não entrega
  nada. Depois que o workflow tiver uma execução concluída, o painel sugere as chaves que essa execução
  produziu e sinaliza uma chave que não foi capturada.

Uma variável que nenhuma conexão preenche recorre ao valor definido no nó e, em seguida, ao valor
padrão da variável. Uma variável **obrigatória** que fica sem valor faz a tarefa do nó falhar antes
de iniciar, com uma linha de log que nomeia a variável, de modo que a execução segue as suas arestas **On failure**.

Os valores são convertidos para o tipo da variável: uma variável `int` aceita um número ou uma string
de dígitos, uma variável `enum` ou `select` aceita apenas as suas próprias opções, uma variável `string`
ou `text` aceita qualquer coisa (um objeto ou uma lista chega como JSON compacto). Um valor que não se
encaixa é ignorado, com o motivo no log da tarefa, e o valor alternativo é aplicado.

**Nós de aprovação e de atraso** repassam as saídas: `task → approval → task` ainda entrega
dados, e vale o modo da última conexão.

**Várias conexões para um mesmo nó.** Cada conexão cuja origem foi concluída com sucesso contribui.
Quando duas delas preenchem a mesma variável, um mapeamento explícito prevalece sobre uma entrega por nome;
entre duas do mesmo tipo vence a conexão criada primeiro, de modo que uma execução dá sempre o mesmo
resultado. O log da tarefa indica a vencedora.

![The connection panel in by-name mode: matched survey variables are ticked](/assets/workflow-inputs-by-name.webp)

![The connection panel with explicit mapping: one output key per survey variable](/assets/workflow-inputs-explicit.webp)

### Onde vê-las {#where-to-see-outputs}

- A **visualização da execução** mostra um selo *N outputs* em cada nó que produziu saídas.
- A **caixa de diálogo da tarefa** tem uma tabela **Outputs** com os valores e a lista *Not captured*.
- O log de uma tarefa alimentada por uma conexão começa com uma linha por variável, como
  `Input "image_tag" <- output "image_tag" of node 3 (task #41)`, de modo que a origem de cada valor
  fica uma linha acima do próprio valor.

![Run view: nodes that produced outputs carry a badge](/assets/workflow-run-outputs.webp)

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Task dialog, Details tab: the Outputs table](/assets/task-outputs.webp)
</div>

### Limitações {#outputs-limitations}

- As saídas são armazenadas e exibidas em texto simples para todos que podem ver a tarefa. **Não passe
  segredos pelas saídas.** Uma variável de survey do tipo `secret` não pode ser preenchida por uma
  conexão.
- As saídas são valores, nunca código: o Ansible as recebe como strings literais, e uma expressão
  Jinja2 dentro de um valor não é avaliada.
- As tarefas em runners remotos produzem e recebem saídas como as tarefas no servidor. As tarefas
  executadas pelo executor **Docker** ou **Kubernetes** de um runner ainda não produzem saídas; o log
  delas informa isso.

## Variáveis de ambiente {#environment-variables}

Uma tarefa iniciada por um workflow recebe, além das
[variáveis recebidas por todas as tarefas](./tasks#environment-variables):

| Variável | Valor |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | ID do workflow |
| `SEMAPHORE_WORKFLOW_RUN_ID` | ID da execução atual |
| `SEMAPHORE_WORKFLOW_URL` | Link para a página da execução, por exemplo `https://semaphore.example.com/project/1/workflows/7/runs/42` (requer `web_host` na configuração do servidor) |
| `SEMAPHORE_OUTPUTS_FILE` | Caminho do arquivo no qual a tarefa grava as suas [saídas](#producing-outputs) |

Essas variáveis são definidas para todas as aplicações, incluindo Ansible e Terraform, e chegam às tarefas executadas em runners remotos.

## Permissões {#permissions}

- Gerenciar workflows (criar, editar, excluir) requer permissões de gerenciamento de recursos
  do projeto.
- Executar workflows requer `run_project_tasks`.
- Resolver aprovações requer o acesso adequado ao projeto (os mesmos usuários que podem executar
  tarefas no projeto).

## API {#api}

Os modelos e as execuções de workflow estão disponíveis em
`/api/project/{project_id}/workflows`. Consulte a
[documentação da API](/reference/api) para os esquemas de requisição e resposta, incluindo
os campos do nó `delay` (`delay_seconds`), `input_mode` e `input_mappings` nas arestas, o
documento `artifacts` de cada tarefa nos detalhes da execução (`GET …/runs/{run_id}`) e o endpoint
de parada (`POST …/runs/{run_id}/stop`).
