# Projetos

Um projeto é a principal unidade de separação no Semaphore UI. Cada recurso com o qual você trabalha pertence a exatamente um projeto: templates de tarefa, tarefas, inventários, grupos de variáveis, chaves, repositórios, integrações, agendamentos, runners e membros da equipe.

Os projetos são independentes uns dos outros, então você pode usá-los para organizar sistemas não relacionados dentro de uma única instalação do Semaphore: equipes, infraestruturas, ambientes ou aplicações diferentes.

## Navegação do projeto {#project-navigation}

Depois de abrir um projeto, a barra lateral esquerda mostra o seletor de projetos no topo e todas as seções do projeto abaixo dele. Sob o nome do projeto você vê o seu papel neste projeto (por exemplo `task_runner`). O papel define quais seções você pode alterar; consulte [Equipes](./team).

![Painel do projeto com a aba Histórico](/assets/project-dashboard-history.webp)

| Seção | O que contém |
|---|---|
| **Dashboard** | Abas [Histórico](./projects/history), [Estatísticas](./projects/stats), [Atividade](./projects/activity) e, para os owners do projeto, [Configurações](./projects/settings) |
| **Templates de Tarefa** | Definições do que executar e como: [Templates de Tarefa](./task-templates) |
| **Workflows** (Pro) | Grafos de templates com aprovações e ramificações: [Workflows](./workflows) |
| **Agendamento** | Agendamentos no estilo cron para templates: [Agendamentos](./schedules) |
| **Inventário** | Hosts e configurações de conexão para o Ansible, workspaces para o Terraform: [Inventário](./inventory) |
| **Grupos de Variáveis** | Variáveis e segredos reutilizáveis injetados nas tarefas: [Grupos de Variáveis](./environment) |
| **Armazenamento de Chaves** | Credenciais criptografadas e armazenamentos externos de segredos: [Armazenamento de Chaves](./key-store) |
| **Repositórios** | Repositórios Git ou caminhos locais com seus playbooks e scripts: [Repositórios](./repositories) |
| **Integrações** | Webhooks de entrada que iniciam tarefas: [Integrações](./integrations) |
| **Equipe** | Membros e seus papéis: [Equipes](./team) |
| **Runners** (Pro) | Runners vinculados a este projeto: [Runners do projeto](./projects/runners) |

A parte inferior da barra lateral contém o interruptor do modo escuro, o seletor de idioma e o seu [menu de conta](./account).

## Criando um projeto {#creating-a-project}

A criação de projetos está disponível para administradores. Usuários comuns só podem criar projetos quando a opção do servidor `non_admin_can_create_project` (`SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT`) está habilitada; consulte [Configuração](/admin-guide/configuration).

1. Clique no nome do projeto no topo da barra lateral e escolha **Novo Projeto**.
2. Preencha o formulário:

| Campo | Descrição |
|---|---|
| **Nome do Projeto** | Nome de exibição do projeto. Você pode alterá-lo depois em [Configurações](./projects/settings). |
| **Número máximo de tarefas paralelas** | Opcional. Quantas tarefas deste projeto podem ser executadas ao mesmo tempo. Deixe vazio para não haver limite. As tarefas acima do limite aguardam na fila com o status `waiting`. |
| **Demo** | Preenche o novo projeto com dados de exemplo: um repositório público de demonstração, um inventário, uma chave e vários templates de tarefa. Use-o para experimentar o Semaphore sem configurar nada. |

3. Clique em **Criar**.

O usuário que cria um projeto se torna o seu **Owner**.

## Alternando entre projetos {#switching-between-projects}

Clique no nome do projeto no topo da barra lateral para ver todos os projetos dos quais você é membro e alternar entre eles. O último projeto aberto é lembrado no seu navegador.

## Backup e restauração {#backup-and-restore}

Um projeto pode ser exportado para um arquivo JSON e importado na mesma instância do Semaphore ou em outra:

- **Exportar**: abra **Dashboard → Configurações** e clique em **Fazer backup do projeto** (consulte [Configurações](./projects/settings)).
- **Importar**: clique no nome do projeto na barra lateral, escolha **Restaurar projeto** e envie o arquivo de backup.

Ambas as operações também estão disponíveis na linha de comando; consulte [CLI: Projetos](/admin-guide/cli/projects).
