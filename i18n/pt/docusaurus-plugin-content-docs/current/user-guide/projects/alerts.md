---
title: Alertas
description: A aba Alertas de um projeto, onde os canais do servidor são ativados e os alertas nomeados do projeto são criados, testados e vinculados a modelos e agendamentos.
---

# Alertas

A aba **Alertas** de um projeto decide para onde os resultados das tarefas são reportados. Ela tem duas partes:

- **Canais do servidor** são os provedores de notificação que um administrador configurou no servidor em `config.json`, veja [Notificações](/admin-guide/notifications). São compartilhados por todos os projetos e cada projeto decide se os usa.
- **Alertas do projeto** são destinos nomeados que pertencem ao projeto: um chat do Telegram, um webhook do Slack, uma lista de endereços de e-mail e assim por diante. Modelos e agendamentos escolhem quais alertas enviam.

As duas partes podem ser usadas ao mesmo tempo.

## Canais do servidor {#server-channels}

O cartão no topo da página lista os canais configurados no servidor. Ative **Enviar alertas deste projeto aos canais do servidor** para receber por eles todos os resultados de tarefas deste projeto. É o mesmo interruptor que versões anteriores chamavam de **Allow alerts for this project** nas configurações do projeto.

Quando o Telegram está configurado no servidor, **Telegram Chat ID** direciona as mensagens deste projeto para um chat diferente do global.

Os canais do servidor reportam todos os estados relevantes: sucesso, falha e *aguardando confirmação*. O e-mail reporta apenas falhas. Um modelo ainda pode suprimir notificações de sucesso ou falha, veja [Alertas do modelo](#template-alerts).

## Alertas do projeto {#project-alerts}

Pressione **Novo alerta** para criar um destino. Cada alerta tem:

| Campo | Descrição |
|---|---|
| **Nome** | Exibido nos formulários de modelo e agendamento. Único dentro do projeto. |
| **Tipo** | O canal: Telegram, Slack, Email, Microsoft Teams, Rocket.Chat, DingTalk ou Gotify. O formulário mostra os campos de destino que o canal precisa. |
| **Destino** | ID do chat e tópico de fórum opcional para Telegram; URL do webhook para Slack, Teams, Rocket.Chat e DingTalk; URL do servidor para Gotify; destinatários para e-mail (deixe vazio para notificar os membros do projeto que ativaram alertas no perfil). |
| **Segredo** | Telegram, Gotify e e-mail precisam de um segredo: o token do bot, o token da aplicação, as credenciais SMTP. *Usar as configurações do servidor* o obtém da configuração do servidor; *Usar o meu* o obtém de uma chave de acesso do Repositório de chaves (tipo *Token secreto* para tokens, *Login com senha* para SMTP). Um alerta de e-mail com credenciais próprias também pode definir seu próprio host SMTP, porta, remetente e criptografia. |
| **Enviar em** | Os eventos que o alerta escuta: sucesso, falha, aguardando confirmação. Novos alertas começam com os padrões do canal. |
| **Padrão do projeto** | Marca o alerta como um dos padrões do projeto. Todo modelo que usa os padrões do projeto o envia. |
| **Ativado** | Um alerta desativado nunca é enviado e não é um padrão do projeto. |
| **Modelo de mensagem** | Template Go opcional para o corpo da mensagem. Mantenha o texto integrado para acompanhar futuras atualizações do servidor. |

Segredos nunca são armazenados no alerta: ficam criptografados no Repositório de chaves e a chave não pode ser excluída enquanto um alerta a usa. Quando o servidor não tem token do bot, servidor SMTP ou par Gotify configurados, o formulário só oferece *Usar o meu*. URLs de webhook devem usar `http` ou `https` e não podem apontar para o próprio servidor.

Use **Enviar mensagem de teste** na lista para verificar um alerta e **Testar tudo** na barra de ferramentas para enviar um teste a todos os destinos ativados do projeto, incluindo os canais do servidor.

Um alerta vinculado a um modelo ou agendamento não pode ser excluído. A caixa de diálogo lista os objetos que o usam.

### Modelos de mensagem {#message-templates}

O corpo é um `text/template` Go (`html/template` para e-mail). Os campos disponíveis são:

| Campo | Valor |
|---|---|
| `.Name` | Nome do modelo |
| `.Author` | Nome do usuário que iniciou a tarefa, ou `—` |
| `.Project.Name`, `.Project.ID` | O projeto |
| `.Playbook` | Playbook ou script do modelo |
| `.ScheduleName` | Nome do agendamento que iniciou a tarefa, se houver |
| `.Task.ID`, `.Task.URL` | Número da tarefa e link para o log |
| `.Task.Result` | Estado com ícone, por exemplo `✅ SUCCESS` |
| `.Task.Desc` | Mensagem informada ao iniciar a tarefa |
| `.Task.Version` | Versão de build, ou a versão de build de entrada para tarefas de deploy |
| `.Task.Duration` | Tempo de execução, vazio até a tarefa iniciar |
| `.Task.Trigger` | `manual`, `schedule`, `integration` ou `api` |
| `.Color` | Cor do anexo para Slack e Rocket.Chat |

Para canais de chat o texto renderizado deve ser o documento JSON esperado pelo mensageiro; o template integrado é um bom ponto de partida. Corpos do Telegram são texto simples com formatação HTML; o chat e o tópico são adicionados pelo Semaphore.

## Alertas do modelo {#template-alerts}

Na seção **Avançado** de um modelo de tarefa, **Alertas** escolhe entre:

- **Usar padrões do projeto** — canais do servidor, quando ativados para o projeto, mais os alertas marcados como padrão do projeto. Modelos existentes mantêm esse comportamento após uma atualização.
- **Usar um conjunto personalizado de alertas** — apenas os alertas selecionados. Uma seleção vazia significa que o modelo não envia nada.

**Suprimir notificações de sucesso** e **Suprimir notificações de erro** valem para as duas opções. Notificações de uma tarefa aguardando confirmação nunca são suprimidas.

## Alertas do agendamento {#schedule-alerts}

Um agendamento pode **usar os alertas do modelo** ou **usar um conjunto diferente de alertas**. A segunda opção substitui totalmente a seleção do modelo para as tarefas iniciadas por aquele agendamento, então um job noturno pode reportar a um canal de plantão enquanto execuções manuais ficam em silêncio.

## Como uma tarefa é roteada {#how-a-task-is-routed}

Os destinos de uma tarefa são fixados quando ela é criada. Alterar um alerta, um modelo ou um agendamento enquanto uma tarefa executa não muda para onde essa tarefa reporta. Cada entrega é registrada por tarefa, destino e evento, então em uma instalação de alta disponibilidade apenas um nó do servidor envia cada mensagem.

## Backups {#backups}

Os alertas do projeto fazem parte do [backup do projeto](./settings#danger-zone). Modelos e agendamentos os referenciam por nome, então um projeto restaurado mantém seus vínculos. Os alertas referenciam sua chave de acesso pelo nome; como em toda chave, o valor secreto em si não é exportado.
