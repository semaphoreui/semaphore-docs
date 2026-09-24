---
title: Notificações
description: Como o Semaphore entrega alertas de tarefas, os canais suportados e a relação entre canais do servidor e alertas por projeto.
---

# Notificações

O Semaphore reporta resultados de tarefas por chat e e-mail de duas formas:

- **Canais do servidor** são configurados uma vez no servidor, em `config.json` ou por variáveis
  de ambiente, e ficam disponíveis para todos os projetos. Esta página os descreve.
- **Alertas do projeto** são destinos nomeados criados pelos membros do projeto na aba
  [Alertas](/user-guide/alerts) do projeto, com chat, webhook ou destinatários
  próprios, e vinculados a modelos e agendamentos.

## Como funciona a entrega {#how-delivery-works}

Para um canal do servidor, três configurações decidem se uma mensagem é enviada, e as três
precisam permitir:

1. **O canal está configurado no servidor.** Cada provedor tem suas próprias chaves em
   `config.json`. Veja a página desse provedor abaixo.
2. **O projeto usa os canais do servidor.** *Enviar alertas deste projeto aos canais do
   servidor* na aba [Alertas](/user-guide/alerts#server-channels) do projeto é o
   interruptor principal. Desligado, os canais do servidor não enviam nada sobre esse projeto.
   Os alertas do projeto não são afetados por esse interruptor.
3. **O modelo pede.** Um modelo que usa os *padrões do projeto* envia aos canais do servidor;
   um modelo com uma lista de alertas personalizada não envia. Modelos também podem suprimir
   notificações de sucesso ou falha, veja [Modelos de tarefas](/user-guide/task-templates).

Canais de chat reportam sucesso, falha e tarefas aguardando confirmação; o e-mail reporta apenas
falhas. Alertas do projeto podem sobrescrever os eventos por destino.

Use **Testar tudo** na aba Alertas para enviar uma mensagem de teste por todos os canais do
servidor e todos os alertas do projeto ativados sem executar uma tarefa.

## Canais {#channels}

| Canal | Página |
|---|---|
| E-mail (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Vários canais podem ser ativados ao mesmo tempo; cada um recebe todos os alertas que passam nas
três verificações acima. Os mesmos provedores estão disponíveis para os alertas do projeto;
alertas de e-mail e Telegram reutilizam o servidor SMTP e o token do bot da configuração do
servidor, e um alerta Gotify sem URL e token próprios reutiliza o par global.

## Substituições por projeto {#per-project-overrides}

O Telegram suporta um chat por projeto: defina **Telegram Chat ID** na aba
[Alertas](/user-guide/alerts#server-channels) do projeto para direcionar as mensagens
de canal do servidor de um projeto a um chat diferente do global. Para qualquer outro destino por
projeto crie um [alerta do projeto](/user-guide/alerts#project-alerts).

## Por onde começar {#where-to-start}

Configure um canal primeiro, abra a aba Alertas do projeto, ative *Enviar alertas deste projeto
aos canais do servidor* e pressione **Testar tudo**. Quando uma mensagem de teste chegar, ajuste
os modelos que importam.
