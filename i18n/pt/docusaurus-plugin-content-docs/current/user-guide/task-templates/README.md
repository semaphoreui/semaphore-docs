# Modelos de Tarefa

Um modelo de tarefa define o que executar e como: a aplicação, o repositório e o arquivo a ser executado, o inventário, os grupos de variáveis, as credenciais e as opções que um usuário pode alterar ao iniciar uma tarefa. Toda [tarefa](../tasks) é criada a partir de um modelo.

Os modelos suportam as seguintes aplicações:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) e [Terragrunt](/user-guide/apps/terragrunt)
* [Shell](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

Os administradores podem ativar ou desativar aplicações e adicionar as suas próprias, consulte [Aplicações](/user-guide/apps).

## Lista de modelos {#template-list}

A seção **Modelos de Tarefa** lista todos os modelos do projeto.

![Lista de modelos](/assets/templates-list.webp)

| Coluna | Conteúdo |
|---|---|
| **Name** | Nome do modelo com o ícone da aplicação. O botão **play** inicia uma nova tarefa. |
| **Version** | A versão mais recente do build para modelos de build e deploy; caso contrário, o ícone de resultado da última tarefa. |
| **Status** | Selo de status da última tarefa, ou *Not launched*. |
| **Last Task** | Número da última tarefa e quem a iniciou. |
| **Playbook** | O arquivo que o modelo executa. |
| **Inventory**, **Variable Groups**, **Repository** | Recursos vinculados ao modelo. |

As abas acima da lista são [visualizações](./views): grupos nomeados de modelos. O ícone de engrenagem no canto superior direito permite escolher quais colunas são exibidas. Clique na seta à esquerda de uma linha para expandir as tarefas mais recentes desse modelo.

![Linha de modelo expandida](/assets/templates-list-expanded.webp)

## Página do modelo {#template-page}

Clique no nome de um modelo para abrir a sua página. O botão no canto superior direito inicia uma tarefa (**Run**, **Build** ou **Deploy**, dependendo do tipo); **Stop all** interrompe todas as tarefas em execução ou na fila do modelo.

| Aba | Conteúdo |
|---|---|
| **Tasks** | Tarefas deste modelo, com um botão de **reexecução** em cada linha. |
| **Details** | O playbook, o tipo, o inventário, os grupos de variáveis e o repositório, além do gráfico de status das tarefas com os mesmos filtros de [Estatísticas](../projects/stats). |
| **Workspaces** | Apenas para modelos Terraform, OpenTofu e Terragrunt: a lista de workspaces, consulte [Workspaces](../apps/terraform/workspaces). |

![Detalhes do modelo](/assets/template-details.webp)

## Tipos de modelo {#template-types}

| Tipo | Finalidade |
|---|---|
| **Task** | Uma execução simples. O tipo padrão. |
| **Build** | Produz um artefato e atribui a ele uma versão incrementada automaticamente. |
| **Deploy** | Implanta uma versão produzida por um modelo de build. |

Os modelos de build e deploy e as `semaphore_vars` que eles passam para os playbooks estão descritos em [Modelos de build e deploy](./build-deploy).

## Formulário do modelo {#template-form}

Usuários com o papel **Manager** ou superior podem criar e editar modelos com **New Template** e o ícone de lápis. O formulário está organizado nos grupos a seguir. Os campos marcados com o nome de uma aplicação aparecem somente para essa aplicação.

### Campos comuns {#common-fields}

| Campo | Descrição |
|---|---|
| **Name** | Obrigatório. Nome do modelo. |
| **Description** | Texto opcional exibido abaixo do nome. |
| **App** | Aplicação a ser executada. |
| **Repository** | Repositório com o playbook ou o script, consulte [Repositórios](../repositories). |
| **Branch** | Branch do Git a ser obtido. Vazio significa o branch configurado no repositório. |
| **Playbook / Script filename** | Caminho para o arquivo relativo à raiz do repositório. Para aplicações Terraform: o subdiretório com a configuração. |
| **Different working directory** | Executa a ferramenta a partir de outro diretório do repositório. |
| **Inventory** | Inventário do Ansible, ou um workspace para aplicações Terraform. |
| **Variable Groups** | Um ou mais grupos de variáveis cujas variáveis e segredos são injetados na tarefa, consulte [Grupos de Variáveis](../environment). |
| **Vault password** (Ansible) | Chaves usadas para desbloquear o Ansible Vault, consulte [Múltiplas senhas de vault](../apps/ansible#multiple-vault-passwords). |
| **View** | Qual aba de [visualização](./views) exibe o modelo. |
| **CLI args** | Argumentos extras de linha de comando como um array JSON, por exemplo `["-vvv"]`. |

### Campos específicos de cada tipo {#type-specific-fields}

| Campo | Tipo | Descrição |
|---|---|---|
| **Start Version** | Build | A primeira versão a ser atribuída, por exemplo `1.0.0`. |
| **Build Template** | Deploy | O modelo de build cujos artefatos este modelo implanta. |
| **Autorun** | Deploy | Inicia um deploy automaticamente após cada build bem-sucedido. |

### Opções avançadas {#advanced-options}

| Campo | Descrição |
|---|---|
| **Allow parallel tasks** | Permite que várias tarefas deste modelo sejam executadas ao mesmo tempo, consulte [Tarefas paralelas](#parallel-tasks). |
| **Alerts**, **Send on success**, **Send on error** | Define se as notificações são enviadas para as tarefas deste modelo e em quais resultados. As notificações também exigem **Allow alerts for this project** nas [configurações do projeto](../projects/settings). |
| **Runner tag** (Pro) | Executa as tarefas apenas em runners com esta tag, consulte [Runners do projeto](../projects/runners). |
| **Executor image** | Imagem de contêiner para runners Docker e Kubernetes, consulte [Imagem do executor](#executor-image-docker-and-kubernetes-runners). |
| **Issue JWT to task runner**, **JWT audience**, **JWT TTL** | Fornece à tarefa um token assinado, consulte [JWTs de tarefa](./jwt). |
| **Auto-run task if new git commit have been found** | Consulta o repositório no intervalo informado e inicia uma tarefa quando o branch avança. |
| **Survey variables** | Entradas que o usuário preenche ao iniciar uma tarefa, consulte [Variáveis de formulário](./survey-vars). |

### Prompts {#prompts}

Os prompts são caixas de seleção que permitem ao usuário alterar opções integradas na janela New Task: branch, inventário, argumentos de CLI e, para o Ansible, limit, tags, skip tags, nível de depuração e instalação do Galaxy. Consulte [Prompts](./prompts).

### Opções da aplicação {#application-options}

- **Ansible**: opções de limit, tags, skip tags e instalação do Galaxy, consulte [Ansible](../apps/ansible).
- **Terraform/OpenTofu/Terragrunt**: auto approve e substituição de backend, consulte [Terraform/OpenTofu](../apps/terraform) e [Backend HTTP](../apps/terraform/states).

---

## Tarefas paralelas {#parallel-tasks}

Por padrão, as tarefas do mesmo modelo são executadas sequencialmente. Para permitir execuções simultâneas do mesmo modelo, ative a opção "Allow parallel tasks" nas configurações do modelo.

## Imagem do executor (runners Docker e Kubernetes) {#executor-image-docker-and-kubernetes-runners}

Quando um runner de projeto usa o executor **Docker** (Pro) ou **Kubernetes** (Enterprise), cada tarefa normalmente é executada na imagem de job padrão configurada no runner (por exemplo, `semaphoreui/job:latest`). Você pode substituir essa imagem por modelo.

1. Abra as configurações do modelo
2. Defina **Executor image** com a referência da imagem de contêiner (por exemplo, `my-registry/ansible:2.16` ou `semaphoreui/job:latest`)
3. Salve o modelo

**Comportamento**:
- Apenas os executores de runner **Docker** e **Kubernetes** respeitam este campo; o executor local o ignora
- Deixe o campo vazio para usar a imagem padrão do runner definida em `runner.executor.docker.image` ou `runner.executor.k8s.image`
- Limpar o campo na interface remove a substituição

**Casos de uso**:
- Modelos que precisam de um conjunto de ferramentas diferente (Ansible mais antigo, uma versão específica do Terraform, pacotes extras do SO incluídos em uma imagem personalizada)
- Imagens isoladas para modelos sensíveis à segurança sem alterar o padrão global do runner

Consulte [Configuração do runner](/admin-guide/configuration) para as configurações de imagem padrão e [Runners do projeto](/user-guide/projects/runners) para a configuração do executor.
