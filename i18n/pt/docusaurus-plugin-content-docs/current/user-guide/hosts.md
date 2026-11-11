---
title: Hosts
description: Quais hosts as suas tarefas Ansible alcançam, como terminou cada um deles e onde olhar quando um host falha ou nunca é alcançado.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

A página **Hosts** de um projeto lista todos os hosts que as tarefas Ansible do projeto alcançaram, com
o resultado da última execução em cada um. Abra-a quando quiser saber quais hosts falham, quais não
podem ser alcançados e em quais nenhuma tarefa tocou há algum tempo, sem abrir os logs das tarefas um a um.

## Como funciona {#how-it-works}

Você não adiciona hosts manualmente. Após cada tarefa Ansible, o Semaphore registra cada host do play com
o resultado nesse host: `ok`, `changed`, `failed` ou `unreachable`. Contam as tarefas no servidor, nos
runners e nos executores Docker ou Kubernetes. Tarefas de outras aplicações, como Terraform ou
Bash, não adicionam hosts.

Um host é o seu nome no inventário. `web-01` em dois inventários é um único host, e `Web-01` é o mesmo host
que `web-01`. Um host que tarefas de vários projetos alcançam aparece em cada projeto com os números
próprios daquele projeto. Um host permanece na lista depois de sair do seu inventário, junto com o seu
histórico.

## Encontrar um host {#find-a-host}

- **Search** encontra hosts pelo nome.
- **Failing now** mostra hosts cuja última execução falhou. **Unreachable** mostra hosts aos quais o Ansible não
  conseguiu se conectar. **Not seen 30 days** mostra hosts em que nenhuma tarefa tocou durante um mês.
- **Template** restringe a lista aos hosts de um template.

Clique em um host para abrir o seu cartão: quando foi visto pela primeira vez, quantas execuções teve, quantas das últimas
10 execuções falharam e as tarefas que o alcançaram com o resultado neste host. Clique em uma tarefa para abrir
o seu log.

A aba **Summary** de uma tarefa mostra o mesmo para uma execução: selecione **All servers** para ver todos os hosts
dessa tarefa com os seus contadores.

## Próximos passos {#whats-next}

- [Hosts para administradores](/admin-guide/hosts) — todos os projetos, a contagem da licença e a desativação.
- [Inventário](/user-guide/inventory) — defina os hosts nos quais as suas tarefas são executadas.
