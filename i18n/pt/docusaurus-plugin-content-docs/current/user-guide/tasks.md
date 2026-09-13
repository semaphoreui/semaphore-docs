# Tarefas

Uma tarefa é uma única execução de um [modelo de tarefa](./task-templates): uma execução de um playbook do Ansible, de uma configuração Terraform/OpenTofu/Terragrunt ou de um script Bash, PowerShell ou Python. Cada tarefa mantém o seu próprio log, status e detalhes, de modo que você sempre pode ver o que foi executado, quando, por quem e com qual revisão do repositório.

## Iniciando uma tarefa {#starting-a-task}

Você precisa do papel **Task Runner** ou superior no projeto (consulte [Equipes](./team)). Inicie uma tarefa em um de dois lugares:

- Em **Modelos de Tarefa**, clique no botão **play** na linha do modelo.
- Na página do modelo, clique no botão no canto superior direito. O seu rótulo depende do tipo de modelo: **Run**, **Build** ou **Deploy**.

Ambos abrem a janela **New Task**. O seu conteúdo depende da aplicação e das opções ativadas no modelo.

![Janela New Task de um modelo Ansible](/assets/task-new-ansible.webp)

| Campo | Exibido para | Descrição |
|---|---|---|
| **Message** | todos os modelos | Observação opcional armazenada com a tarefa e exibida no histórico e nos alertas. |
| **Build Version** | modelos de deploy | Qual build implantar. O build bem-sucedido mais recente é selecionado por padrão. Consulte [Modelos de build e deploy](./task-templates/build-deploy). |
| Variáveis de formulário | modelos com [variáveis de formulário](./task-templates/survey-vars) | Uma entrada por variável; as variáveis obrigatórias devem ser preenchidas. |
| **Dry Run** `--check`, **Diff** `--diff` | Ansible | Executa o playbook em modo de verificação ou mostra as alterações nos arquivos. Outros prompts do Ansible (Limit, Tags, Skip tags, Debug) aparecem quando ativados no modelo, consulte [Prompts](./task-templates/prompts). |
| **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure** | Terraform, OpenTofu, Terragrunt | Executa apenas o `plan`, adiciona `-destroy`, `-auto-approve`, `-upgrade` ou `-reconfigure`. Consulte [Terraform/OpenTofu](./apps/terraform). |
| **Branch**, **Inventory**, **CLI args** | qualquer aplicação | Substitui os valores do modelo nesta execução. Cada substituição deve ser permitida nas configurações do modelo. |

![Janela New Task de um modelo Terraform](/assets/task-new-terraform.webp)

Clique em **Run** (ou **Build** / **Deploy**) para colocar a tarefa na fila.

### Fila e execução paralela {#queue-and-parallel-execution}

As tarefas do mesmo modelo são executadas uma após a outra, a menos que **Allow parallel tasks** esteja ativado no modelo. O projeto também pode limitar o número total de tarefas em execução com **Max number of parallel tasks** nas [configurações do projeto](./projects/settings). Uma tarefa que precisa esperar permanece no status `waiting` e inicia automaticamente quando há uma vaga livre.

## Janela da tarefa {#task-window}

Clicar em uma tarefa em qualquer lugar da interface abre a janela da tarefa. O cabeçalho mostra o modelo, o número da tarefa, a mensagem de commit da revisão do repositório, o selo de status, quem iniciou a tarefa e quando, e a duração. O ícone de setas expande a janela para tela cheia.

![Log da tarefa](/assets/task-log.webp)

| Aba | Conteúdo |
|---|---|
| **Log** | Saída ao vivo da tarefa com marcações de tempo. O log é transmitido enquanto a tarefa é executada. **Raw log** abre a saída não processada em uma nova aba do navegador. |
| **Details** | Informações do modelo (aplicação, modelo), informações do commit (mensagem e hash) e informações da execução: mensagem, horários de criação, início e fim, duração e, quando definidos, o runner, o branch, o limit e as variáveis usadas na execução. |
| **Summary** (Pro) | Para tarefas do Ansible: quantos hosts terminaram com OK e quantos falharam, com uma tabela das tarefas que falharam por servidor. |

![Detalhes da tarefa](/assets/task-details.webp)

![Resumo da tarefa](/assets/task-summary.webp)

## Status das tarefas {#task-statuses}

| Status | Significado |
|---|---|
| `waiting` | A tarefa está na fila: outra tarefa do mesmo modelo está em execução, o limite do projeto foi atingido ou nenhum runner está disponível ainda. |
| `starting` | Um runner assumiu a tarefa e está preparando o repositório e o ambiente. |
| `waiting_confirmation` | A ferramenta fez uma pergunta e aguarda um usuário, por exemplo `terraform apply` sem **Auto Approve** ou um script que lê uma entrada. Use **Confirm** ou **Reject** na janela da tarefa. |
| `confirmed` | Um usuário confirmou a pergunta; a tarefa continua. |
| `rejected` | Um usuário rejeitou a pergunta; a tarefa termina. |
| `running` | O playbook ou o script está sendo executado. |
| `stopping` | Uma parada foi solicitada e o processo está sendo encerrado. |
| `stopped` | A tarefa foi interrompida por um usuário. |
| `success` | Terminou com código de saída 0. |
| `error` | Terminou com um código de saída diferente de zero ou não conseguiu iniciar. Exibido como **Failed** na interface. |

## Interrompendo tarefas {#stopping-tasks}

Abra a janela de uma tarefa em execução e clique em **Stop**. O Semaphore envia um sinal de encerramento e a tarefa passa para o status `stopping` enquanto o processo termina. Se o processo não reagir, o botão muda para **Force Stop**; clique nele para encerrar o processo imediatamente.

Para interromper todas as tarefas em execução e na fila de um modelo, abra a página do modelo e use **Stop all**. O menu suspenso oferece tanto **Stop** como **Force stop**.

<div style={{maxWidth: 200}}>

![Menu Stop all](/assets/task-stop-all-menu.webp)

</div>

## Executando uma tarefa novamente {#running-a-task-again}

Na aba **Tasks** de um modelo, cada linha tem um botão de **reexecução**. Ele abre a janela New Task com a mensagem e os parâmetros daquela tarefa já preenchidos.

![Tarefas do modelo com os botões de reexecução](/assets/template-tasks.webp)

## Onde as tarefas são listadas {#where-tasks-are-listed}

- **Dashboard → History**: todas as tarefas do projeto, consulte [Histórico](./projects/history).
- **Página do modelo → Tasks**: tarefas de um único modelo.
- **Modelos de Tarefa**: expanda uma linha com a seta à esquerda para ver as tarefas mais recentes do modelo sem sair da lista.

## Retenção de logs {#log-retention}

Por padrão, as tarefas e os logs são mantidos para sempre. Use `max_tasks_per_template` para manter apenas as tarefas mais recentes de cada modelo, consulte [Histórico](./projects/history#task-retention).
