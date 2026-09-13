---
title: Notificações
description: Como o Semaphore entrega alertas de tarefas, os canais que ele suporta e as duas chaves que precisam estar ligadas para que algo seja enviado.
---

# Notificações

O Semaphore informa os resultados das tarefas em chats e por e-mail. Um canal é
configurado uma única vez no servidor, no `config.json` ou por variáveis de
ambiente, e então vale para todos os projetos. Quais tarefas geram um alerta é
decidido por projeto e por modelo na interface web.

## Como funciona a entrega {#how-delivery-works}

Três configurações decidem se uma mensagem é enviada, e todas as três precisam
permitir isso:

1. **O canal está configurado no servidor.** Cada provedor tem suas próprias
   chaves no `config.json`. Consulte a página desse provedor abaixo.
2. **O projeto permite alertas.** *Allow alerts for this project*, nas
   [configurações do projeto](/user-guide/projects/settings), é a chave mestra.
   Com ela desligada, nenhum canal envia nada sobre esse projeto.
3. **O modelo solicita o alerta.** Um modelo de tarefa escolhe se alerta em caso
   de sucesso, em caso de erro ou nunca; veja
   [Modelos de Tarefa](/user-guide/task-templates).

Use **Test alerts** nas configurações do projeto para enviar uma mensagem de teste
por todos os canais configurados sem executar uma tarefa.

## Canais {#channels}

| Canal | Página |
|---|---|
| E-mail (SMTP) | [E-mail](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Vários canais podem ser habilitados ao mesmo tempo; cada um recebe todos os
alertas que passam pelas três verificações acima.

## Sobrescritas por projeto {#per-project-overrides}

O Telegram suporta um chat por projeto: defina **Telegram Chat ID** nas
[configurações do projeto](/user-guide/projects/settings) para encaminhar os
alertas de um projeto a um chat diferente do configurado para todo o servidor. Os
demais canais usam a configuração do servidor para todos os projetos.

## Por onde começar {#where-to-start}

Configure um canal primeiro, ligue *Allow alerts for this project* e pressione
**Test alerts**. Assim que uma mensagem de teste chegar, habilite os alertas nos
modelos que importam.
