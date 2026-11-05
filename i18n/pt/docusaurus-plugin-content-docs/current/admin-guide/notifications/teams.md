# Microsoft Teams

As notificações do Microsoft Teams entregam os resultados das tarefas do Semaphore diretamente em um canal do Teams. Cada mensagem é um cartão com o nome do template, o status da tarefa, o usuário que iniciou a tarefa e um botão que abre a tarefa no Semaphore.

Para configurar as notificações do Teams, você precisa de uma URL de webhook que conecte o Semaphore ao canal. No Teams, essa URL é criada com o app **Workflows**, que usa o Microsoft Power Automate e não tem relação com os Workflows do Semaphore.

:::warning
Em maio de 2026, a Microsoft desativou os conectores do Office 365 no Teams, incluindo o antigo conector **Incoming Webhook**. Uma URL de webhook em `webhook.office.com` não entrega mais mensagens. Crie uma nova URL com o app Workflows, conforme descrito abaixo.
:::

## Criando o webhook do Teams {#creating-teams-webhook}

### Passo 1. Abra o Workflows para o canal {#step-1-open-workflows-for-the-channel}

1. No Microsoft Teams, acesse a equipe e o canal que devem receber as notificações.
2. Clique em **More options (…)** ao lado do nome do canal.
3. Selecione **Workflows**.

---

### Passo 2. Crie um fluxo a partir do template {#step-2-create-a-workflow-from-the-template}

1. Pesquise o template **Send webhook alerts to a channel** e selecione-o.
2. Confira os parâmetros do fluxo: o **Team** e o **Channel** em que as mensagens são publicadas.
3. Clique em **Save**.

O Semaphore envia a requisição sem cabeçalhos de autenticação, então use este template e não as variantes *from specific people* ou *from people in an org*.

---

### Passo 3. Copie a URL do webhook {#step-3-copy-the-webhook-url}

1. Quando o fluxo for criado, o Teams exibe o link do webhook. Copie-o.
2. A URL é longa e se parece com:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

O parâmetro `sig` é a única proteção do webhook: qualquer pessoa que tenha a URL pode publicar no canal. Trate a URL inteira como um segredo.

---

### Passo 4. Teste seu webhook {#step-4-test-your-webhook}

Use o `curl` para testar:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

O corpo da requisição tem a mesma estrutura das mensagens que o Semaphore envia: uma mensagem com um anexo Adaptive Card. Se tudo estiver configurado, a resposta será `202 Accepted` e o cartão aparecerá no canal do Teams selecionado em poucos segundos.


## Configuração do Semaphore {#semaphore-configuration}

Depois de obter a URL do webhook do Teams, você pode habilitar as notificações do Teams usando o arquivo de configuração ou variáveis de ambiente. Reinicie o Semaphore para aplicar a alteração.

### Método 1: Arquivo de configuração {#method-1-configuration-file}

Adicione as seguintes configurações ao arquivo de configuração do Semaphore:

- `microsoft_teams_alert`: defina como `true` para habilitar as notificações do Teams
- `microsoft_teams_url`: sua URL de webhook obtida no passo anterior

Exemplo de `config.json`:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Método 2: Variáveis de ambiente {#method-2-environment-variables}

Como alternativa, você pode usar variáveis de ambiente. Esse método é particularmente útil para implantações em contêineres ou quando você deseja manter a URL do webhook fora do arquivo de configuração.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
A URL contém os caracteres `&` e `%`. Coloque-a entre aspas simples ao definir a variável em um shell. Em uma unit do systemd, coloque-a em um `EnvironmentFile` em vez de uma linha `Environment=`, onde `%` inicia um especificador.
:::

## Habilitando notificações para um projeto {#enabling-notifications-for-a-project}

As configurações acima ativam o canal para o servidor inteiro, e todas as mensagens vão para o único canal ao qual o webhook pertence. Um projeto só as recebe quando usa os canais do servidor, e um template de tarefa pode suprimir as mensagens de sucesso ou de falha. Veja [Como funciona a entrega](/admin-guide/notifications#how-delivery-works), que também explica como enviar uma mensagem de teste sem executar uma tarefa.

O Teams é notificado quando uma tarefa é concluída com sucesso, falha ou fica aguardando confirmação.

Para enviar as notificações de um projeto para outro canal do Teams, crie um [alerta do projeto](/user-guide/alerts#project-alerts) do tipo Microsoft Teams com a sua própria URL de webhook.

## Conteúdo da mensagem {#message-content}

| Elemento do cartão | Valor |
|---|---|
| Cabeçalho | `Ansible Task Template Execution by:` e o nome do usuário que iniciou a tarefa, ou `—` quando a tarefa não foi iniciada por um usuário. |
| **Task** | Nome do template de tarefa. |
| **Status** | Status da tarefa com um ícone, por exemplo `✅ SUCCESS`, `❌ ERROR` ou `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Número da tarefa. |
| Botão **Task URL** | Abre a tarefa no Semaphore. O link é montado a partir de `web_host`, então defina essa opção com o endereço pelo qual os usuários acessam o Semaphore. |

## Solução de problemas {#troubleshooting}

A requisição é enviada pelo servidor do Semaphore, não por um runner, e o resultado é gravado no log da tarefa. O Semaphore envia cada mensagem uma única vez e não faz novas tentativas.

| Log da tarefa | O que verificar |
|---|---|
| Nenhuma linha sobre o Microsoft Teams | O envio da mensagem não foi tentado. Verifique se `microsoft_teams_alert` está como `true`, se o projeto usa os canais do servidor e se o template não suprime a notificação. |
| `Can't send microsoft teams alert! Error: …` | O servidor não conseguiu acessar o host do webhook. Libere o tráfego HTTPS de saída do servidor para o host da URL. Atrás de um proxy, defina `HTTPS_PROXY` para o servidor do Semaphore; veja [Executando atrás de um proxy corporativo](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | O webhook rejeitou a requisição. Verifique se a URL foi copiada por completo, incluindo o parâmetro `sig`, e se o fluxo está ativado e não foi excluído. A Microsoft limita cada webhook a quatro requisições por segundo. |
| `Sent successfully microsoft teams alert`, mas nenhum cartão no canal | O fluxo aceitou a requisição e falhou depois. Abra o fluxo no app **Workflows** e verifique o histórico de execuções. Um fluxo pertence ao usuário que o criou e para de funcionar quando esse usuário sai da organização ou perde o acesso ao canal, então adicione coproprietários ao fluxo. |
