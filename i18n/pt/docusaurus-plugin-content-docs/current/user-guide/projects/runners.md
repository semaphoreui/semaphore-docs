---
title: "Runners do projeto"
sidebar_custom_props:
  edition: pro
---

# Runners do projeto <Pro />

Os runners executam tarefas em máquinas diferentes do servidor do Semaphore: mais perto da infraestrutura de destino, em outra zona de rede ou com um conjunto de ferramentas diferente. Os **runners globais** são registrados por um administrador e atendem a todos os projetos. Os **runners do projeto** pertencem a um único projeto e são gerenciados pela sua equipe na seção **Runners**.

![Runners do projeto](/assets/project-runners-list.webp)

| Coluna | Conteúdo |
|---|---|
| Interruptor | Habilita ou desabilita o runner. Um runner desabilitado não recebe tarefas. Apenas os runners do projeto têm o interruptor; os runners globais são gerenciados pelo administrador. |
| **Nome** | Nome do runner. O selo **Global** marca os runners compartilhados por todos os projetos. |
| **Tag** | Tags do runner. Templates com uma **Tag do runner** são executados apenas em runners que possuem essa tag. |
| **Status** | **Online** quando o runner consultou o servidor recentemente, **Offline** caso contrário. |

## Adicionando um runner {#adding-a-runner}

Você precisa do papel **Manager** ou superior. Clique em **Novo Runner** e preencha o formulário.

<div style={{maxWidth: 420}}>

![Diálogo de novo runner](/assets/project-runner-new.webp)

</div>

| Campo | Descrição |
|---|---|
| **Nome** | Nome do runner exibido na lista e nos detalhes da tarefa. |
| **Tags** | Opcional. Uma ou mais tags. Um template com uma **Tag do runner** é executado apenas pelos runners que carregam essa tag. |
| **É padrão** | Runners com esta marcação também assumem tarefas de templates sem tag de runner. Um runner sem a marcação e sem tags nunca recebe tarefas. |
| **Registrar** | Marcado: o runner é criado como registrado e o diálogo mostra o token do runner para colocar na configuração do runner. Desmarcado: o runner é criado sem registro e você recebe um **token de registro** de uso único; o runner se registra com `semaphore runner register` ou `semaphore runner start --auto-register`. |
| **Webhook** | URL opcional que o Semaphore chama quando uma tarefa é atribuída ao runner. Use-a para iniciar runners sob demanda (de uso único), por exemplo com uma função em nuvem. |
| **Número máximo de tarefas paralelas** | Opcional. Quantas tarefas o runner pode executar ao mesmo tempo. |
| **Habilitado** | Se o runner recebe tarefas. |

Após a criação, clique no runner para ver novamente o seu token ou token de registro e para copiar os trechos de configuração.

## Instalando o runner {#installing-the-runner}

O runner é o mesmo binário `semaphore` ou a imagem Docker `semaphoreui/runner` iniciados no modo runner. A instalação, o arquivo de configuração, os comandos de registro, os executores (local, Docker, Kubernetes) e a segurança estão descritos no guia do administrador: [Runners](/admin-guide/runners) e [CLI: Runners](/reference/cli/runners).

## Roteando tarefas para runners {#routing-tasks-to-runners}

1. Dê ao runner uma ou mais **Tags**, por exemplo `windows-qa-server`.
2. No formulário do template, defina **Tag do runner** com o mesmo valor.
3. As tarefas do template aguardam no status `waiting` até que um runner com essa tag esteja online.

Templates sem tag de runner vão para os runners marcados como **É padrão**, incluindo os runners globais padrão. O runner que executou uma tarefa é exibido na aba **Detalhes** da [janela da tarefa](../tasks#task-window).

## Segurança {#security}

- Os runners se conectam ao servidor, nunca o contrário, então um runner pode ficar atrás de NAT ou em uma rede privada.
- Cada requisição de um runner é autenticada com o seu token. Revogue um runner excluindo-o ou desabilitando-o.
- Use HTTPS entre os runners e o servidor; consulte [Segurança de rede](/admin-guide/security/network).
