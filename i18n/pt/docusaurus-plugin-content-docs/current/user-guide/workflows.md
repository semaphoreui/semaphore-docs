# Workflows (Pro)

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

## Artefatos do workflow (set_stats) {#workflow-artifacts-set_stats}

Quando uma tarefa do Ansible em um workflow usa `set_stats`, as variáveis são armazenadas como
**artefatos do workflow** para aquela execução. Os nós de tarefa seguintes na mesma execução
os recebem automaticamente como variáveis extras.

:::warning
Se as etapas do workflow forem executadas em **runners remotos**, os artefatos do workflow ainda não
fluem entre etapas em runners remotos — eles são passados apenas entre tarefas executadas
localmente no servidor do Semaphore. Planeje a passagem de artefatos de acordo ou mantenha
as etapas que produzem e consomem artefatos no mesmo caminho de execução.
:::

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
os campos do nó `delay` (`delay_seconds`) e o endpoint de parada
(`POST …/runs/{run_id}/stop`).
