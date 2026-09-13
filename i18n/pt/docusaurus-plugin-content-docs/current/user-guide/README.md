---
title: Guia do Usuário
description: "Para engenheiros que trabalham dentro de um projeto Semaphore: recursos, modelos de tarefa, tarefas, agendamentos e acesso da equipe."
---

# Guia do Usuário

Esta seção é destinada a quem já tem acesso a um projeto do Semaphore. Tudo o que
está aqui acontece na interface web ou pela API do projeto. A instalação do
servidor, sua configuração e a conexão de um provedor de identidade são abordadas
no [Guia de Administração](/admin-guide).

O trabalho no Semaphore segue uma única cadeia. Um **projeto** contém todo o
resto. Dentro dele você registra os recursos de que uma execução precisa: um
**repositório** com seus playbooks ou scripts, as **chaves** usadas para acessá-lo
e alcançar seus hosts, um **inventário** de máquinas de destino e **grupos de
variáveis** com valores e segredos. Um **modelo de tarefa** combina tudo isso em
uma definição do que executar, e cada execução desse modelo é uma **tarefa**.
Agendamentos, workflows e webhooks recebidos iniciam modelos para você.

## Configurar um projeto {#set-up-a-project}

Nesta ordem, porque cada etapa depende da anterior.

| Página | O que aborda |
|---|---|
| [Projetos](/user-guide/projects) | Criar um projeto, as seções da barra lateral, backup e restauração. |
| [Equipes](/user-guide/team) | Os quatro papéis integrados e os papéis personalizados no Enterprise. |
| [Armazenamento de Chaves](/user-guide/key-store) | Chaves SSH, logins e armazenamentos externos de segredos. |
| [Repositórios](/user-guide/repositories) | Repositórios Git e caminhos locais que contêm sua automação. |
| [Inventário](/user-guide/inventory) | Hosts e configurações de conexão para o Ansible, workspaces para o Terraform. |
| [Grupos de Variáveis](/user-guide/environment) | Variáveis e segredos reutilizáveis passados para as tarefas. |

## Definir e executar o trabalho {#define-and-run-work}

| Página | O que aborda |
|---|---|
| [Modelos de Tarefa](/user-guide/task-templates) | Todos os campos do formulário de modelo, além dos tipos de modelo. |
| [Aplicações](/user-guide/apps) | O que cada aplicação executa: Ansible, Terraform, OpenTofu, Terragrunt e scripts. |
| [Tarefas](/user-guide/tasks) | Iniciar uma tarefa, status de tarefas, logs, parada e reexecução. |
| [Agendamentos](/user-guide/schedules) | Executar modelos em uma agenda cron. |
| [Workflows](/user-guide/workflows) | Encadear modelos com aprovações e ramificações. |
| [Integrações](/user-guide/integrations) | Iniciar tarefas a partir de webhooks recebidos. |
| [Runners do projeto](/user-guide/projects/runners) | Enviar as tarefas de um projeto para os seus próprios runners. |
| [Sua conta](/user-guide/account) | Configurações pessoais e tokens de API. |

## Por onde começar {#where-to-start}

Se alguém acabou de adicionar você a um projeto, leia
[Projetos](/user-guide/projects) para se orientar e depois
[Tarefas](/user-guide/tasks) para executar uma e ler o seu log. Se você está
montando um projeto do zero, siga a tabela acima na ordem.

É totalmente novo no Semaphore? Comece por
[Primeiros passos](/getting-started).
