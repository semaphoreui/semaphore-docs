---
title: "Workflows"
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
3. Adicione o primeiro nó: clique em um tipo na **Palette**, arraste-o para a área de trabalho
   ou use o botão **+** no canto superior direito da área de trabalho.
4. Passe o mouse sobre um nó e clique na alça **+** do seu conector de saída para adicionar a
   próxima etapa. O novo nó é colocado à direita e conectado com uma aresta
   **On success**. Você também pode conectar nós arrastando de um conector de saída
   até um conector de entrada.
5. Clique em um nó para editá-lo no **painel de propriedades** à direita: tipo do nó,
   modelo de tarefa e parâmetros da tarefa, tempo limite e mensagem da aprovação, duração do atraso,
   convergência.
6. Clique na **pílula de condição** no meio de uma aresta para alterar a sua
   condição, ou passe o mouse sobre ela e clique em **×** para remover a aresta.
7. Defina um **nome** (e, opcionalmente, uma **versão inicial** para o versionamento das execuções).
8. Corrija os problemas listados no chip **problems** da barra de ferramentas e clique em
   **Save**.

![Editor de workflow](/assets/workflow-editor.webp)

O editor valida o grafo enquanto você trabalha. Nós com problema exibem um selo de aviso,
e o chip da barra de ferramentas lista todos os problemas; clique em um deles para selecionar o nó. Um
workflow válido deve ter pelo menos um nó, exatamente um nó inicial (sem arestas
de entrada), nenhum ciclo e configuração completa em todos os nós executáveis.
**Save** permanece desabilitado até que o grafo seja válido.

![Menu de adição rápida](/assets/workflow-editor-quick-add.webp)

### Controles do editor {#editor-controls}

<div class="BlockSchema">
    <img src="/docs/assets/workflow-hotkeys.svg" alt="Atalhos de teclado do editor de workflow" />
</div>

A área de trabalho pode ser movida e ampliada com o mouse, um trackpad, os botões
no canto inferior esquerdo ou o teclado. Os atalhos de teclado funcionam enquanto a
área de trabalho tem o foco: clique primeiro em um espaço vazio da área de trabalho
ou pressione <kbd>Tab</kbd> até que ela receba o foco. Em seguida, <kbd>Tab</kbd> percorre
os nós; <kbd>Enter</kbd> em um nó o seleciona e abre o seu painel de propriedades (na
visualização da execução, abre o log da tarefa). A mesma navegação funciona na
visualização da execução.

| Ação | Mouse | Trackpad | Botões | Teclado |
|------|-------|----------|--------|---------|
| Mover (deslocar a área de trabalho) | Arraste um espaço vazio da área de trabalho ou role a roda (vertical) e <kbd>Shift</kbd>+roda (horizontal) | Rolagem com dois dedos em qualquer direção | — | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>; mantenha <kbd>Shift</kbd> pressionado para passos maiores |
| Ampliar / reduzir | <kbd>Ctrl</kbd>+roda (<kbd>Cmd</kbd>+roda no macOS); amplia em direção ao ponteiro | Gesto de pinça | **+** / **−** | <kbd>+</kbd> / <kbd>−</kbd> |
| Ajustar o grafo inteiro à tela | — | — | **fit view** | <kbd>0</kbd> |
| Redefinir o zoom para 100 % | — | — | — | <kbd>1</kbd> |
| Organizar os nós automaticamente | — | — | **tidy up** | — |

O editor ajusta o grafo à tela ao abrir. O nível de zoom atual é exibido abaixo
dos botões. Os nós se alinham a uma grade de 20 px quando você os move.

| Ação de edição | Como |
|----------------|------|
| Adicionar um nó | Alça **+** em um nó, clique ou arraste na paleta, o botão **+** no canto superior direito ou clique com o botão direito em um espaço vazio da área de trabalho. |
| Conectar nós | Arraste do conector de saída de um nó (borda direita) até o conector de entrada de outro nó (borda esquerda). |
| Alterar a condição de uma aresta | Clique na pílula de condição na aresta e escolha uma condição. |
| Excluir o nó ou a aresta selecionada | <kbd>Delete</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> no macOS), o botão de exclusão no painel de propriedades ou **×** na pílula de uma aresta sob o cursor. |
| Desfazer / refazer | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd> no macOS) ou as setas na barra de ferramentas. Até 50 etapas. |
| Desmarcar | <kbd>Esc</kbd> fecha o painel de propriedades e limpa a seleção. |

Sair do editor com alterações não salvas pede confirmação. O ponto no botão
**Save** indica que o grafo difere da versão salva.

## Tipos de nó {#node-kinds}

Um workflow é construído a partir de quatro tipos de nós. Todos os tipos são desenhados como
um cartão: um bloco com ícone à esquerda, o título e um subtítulo com as configurações
principais. Os nós de tarefa, aprovação e atraso têm um conector de entrada na borda esquerda
e um conector de saída na borda direita; as notas não têm conectores.

### Nós de tarefa {#task-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Cartão de nó de tarefa](/assets/workflow-node-task.webp)
</div>

Um nó de tarefa executa um modelo de tarefa. O bloco mostra a aplicação do modelo
(Ansible, Terraform, OpenTofu, Bash, PowerShell, Python), o título é o nome do modelo
e o subtítulo indica a aplicação. Você pode sobrescrever os parâmetros do modelo
(inventário, ambiente, limit do Ansible, argumentos extras de CLI) por nó por meio dos
**task params** no painel de propriedades; o subtítulo passa então a exibir
**custom params**. Um nó de tarefa sem modelo exibe um selo de aviso e impede o
salvamento.

### Nós de aprovação {#approval-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Cartão de nó de aprovação](/assets/workflow-node-approval.webp)
</div>

Um nó de aprovação pausa a execução até que um usuário com permissão aprove ou rejeite.
Opcionalmente, defina um tempo limite (em segundos) e uma mensagem de aprovação; o
subtítulo mostra o tempo limite. Quando a execução chega a um nó de aprovação, o status da
execução muda para **approval** até que alguém aprove ou rejeite. O cartão de aprovação na
visualização da execução mostra a mensagem de aprovação com os botões **Approve** e
**Reject** para os usuários que podem executar tarefas no projeto. Uma aprovação rejeitada
faz o nó falhar, e a execução continua pelas arestas **On failure** ou **Always**.

### Nós de atraso {#delay-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Cartão de nó de atraso](/assets/workflow-node-delay.webp)
</div>

Um nó de atraso aguarda um número configurado de segundos (mínimo de 1) antes de continuar
para os nós seguintes. Útil para períodos de espera, janelas de manutenção ou para espaçar
etapas dependentes. Durante a espera:

- A execução permanece no status **running**.
- A visualização da execução mostra uma contagem regressiva ao vivo no nó de atraso.
- Os nós seguintes conectados por arestas não são iniciados até que o atraso termine.

Se a execução do workflow for **interrompida** enquanto um atraso estiver ativo, o atraso é
cancelado e a execução termina com o status **stopped**.

### Nós de nota {#note-nodes}

<div class="BlockSchema BlockSchema--xsmall">

![Cartão de nó de nota](/assets/workflow-node-note.webp)

</div>

Uma nota é uma anotação livre na área de trabalho, desenhada como um adesivo. As notas não
são executadas, não têm conectores e nunca são conectadas por arestas; servem apenas para
documentação e são ignoradas pela validação.

### Convergência {#convergence}

Nós com várias arestas de entrada podem exigir que **todos** os nós anteriores terminem
(padrão) ou **qualquer** um deles. Defina a **Convergência** no painel de propriedades do nó;
o subtítulo do cartão mostra **Any parent** quando o valor não é o padrão.

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
- **Visualização da execução** — o mesmo grafo do editor, somente leitura, com o status ao vivo
  em cada nó. Um ícone de status no canto do cartão indica sucesso, falha,
  em execução, aguardando aprovação ou a contagem regressiva do atraso; o subtítulo mostra a
  duração. Os nós que ainda não iniciaram aparecem esmaecidos, e a aresta que leva a
  um nó em execução é animada.
- **Log da tarefa** — clique em um nó de tarefa que já iniciou para abrir o seu log de tarefa.
- **Stop** — enquanto uma execução está em `running` ou `approval`, usuários com
  `run_project_tasks` podem interrompê-la. Todas as tarefas ativas são interrompidas, as aprovações
  pendentes são rejeitadas e a execução é marcada como **stopped**.

![Visualização da execução do workflow](/assets/workflow-run.webp)

![Aprovação pendente na visualização da execução](/assets/workflow-run-approval.webp)

Status das execuções: `running`, `approval`, `success`, `failed`, `stopped`.

## Versionamento das execuções {#run-versioning}

Defina **Start version** no workflow (por exemplo, `1.0.0`) para ativar rótulos de versão
em cada execução. O Semaphore incrementa a versão em execuções sucessivas, de forma semelhante
aos modelos de build.

## Revisões {#revisions}

Cada gravação de um workflow cria uma nova **revisão** do seu grafo; o editor
mostra o número da revisão atual ao lado do nome. Uma execução fixa a revisão
com que foi iniciada: editar o workflow enquanto uma execução está em andamento
não altera essa execução, e execuções concluídas continuam mostrando o grafo que
executaram, com o status de cada nó. Revisões às quais nenhuma execução faz
referência são excluídas ao gravar uma mais nova. Os detalhes da execução
(`GET …/runs/{run_id}`) incluem os nós e arestas da revisão da execução, e
`GET …/workflows/{workflow_id}/revisions` lista as revisões preservadas.

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

## Variáveis de ambiente {#environment-variables}

Uma tarefa iniciada por um workflow recebe, além das
[variáveis recebidas por todas as tarefas](./tasks#environment-variables):

| Variável | Valor |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | ID do workflow |
| `SEMAPHORE_WORKFLOW_RUN_ID` | ID da execução atual |
| `SEMAPHORE_WORKFLOW_URL` | Link para a página da execução, por exemplo `https://semaphore.example.com/project/1/workflows/7/runs/42` (requer `web_host` na configuração do servidor) |

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
os campos do nó `delay` (`delay_seconds`) e o endpoint de parada
(`POST …/runs/{run_id}/stop`).
