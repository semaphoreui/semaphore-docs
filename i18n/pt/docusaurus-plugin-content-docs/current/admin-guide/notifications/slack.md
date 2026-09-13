# Slack

As notificações do Slack permitem receber atualizações em tempo real sobre seus fluxos de trabalho do Semaphore diretamente nos seus canais do Slack. Essa integração ajuda as equipes a se manterem informadas sobre status de builds, resultados de implantações e outros eventos importantes sem precisar verificar constantemente o painel do Semaphore.

Para configurar as notificações do Slack, você precisa criar uma URL de webhook que conecte o Semaphore ao canal do Slack desejado. Esse webhook atua como uma ponte de comunicação segura entre as duas plataformas.

## Criando o webhook do Slack {#creating-slack-webhook}

### Passo 1. Abra as configurações da API do Slack {#step-1-open-slack-api-settings}

1. Acesse [https://api.slack.com/apps](https://api.slack.com/apps).
2. Clique em **Criar Novo App** → escolha **Do Zero**.
3. Dê um nome ao seu app (por exemplo, `Semaphore Bot`) e selecione seu **workspace do Slack**.

---

### Passo 2. Habilite os webhooks de entrada {#step-2-enable-incoming-webhooks}

1. Nas configurações do app, vá em **Recursos → Webhooks de Entrada**.
2. Alterne **Ativar Webhooks de Entrada** → **Ativado**.

---

### Passo 3. Crie uma URL de webhook {#step-3-create-a-webhook-url}

1. Clique em **Adicionar Novo Webhook ao Workspace**.
2. Selecione o xxchannelxx para o qual as mensagens devem ser enviadas.
3. Clique em **Permitir**.
4. Você verá uma **URL de Webhook** como:

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Passo 4. Teste seu webhook {#step-4-test-your-webhook}

Use o `curl` para testar:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

Se tudo estiver configurado, você verá a mensagem no canal do Slack selecionado.


## Configuração do Semaphore {#semaphore-configuration}

Depois de obter a URL do webhook do Slack, você pode configurar o Semaphore para enviar notificações de várias maneiras:

Você pode habilitar as notificações do Slack usando arquivos de configuração ou variáveis de ambiente.

### Método 1: Arquivo de configuração {#method-1-configuration-file}

Adicione as seguintes configurações ao arquivo de configuração do Semaphore:

- `slack_alert`: defina como `true` para habilitar as notificações do Slack
- `slack_url`: sua URL de webhook obtida no passo anterior

Exemplo de `config.json`:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### Método 2: Variáveis de ambiente {#method-2-environment-variables}

Como alternativa, você pode usar variáveis de ambiente para configurar as notificações do Slack. Esse método é particularmente útil para implantações em contêineres ou quando você deseja manter informações sensíveis separadas dos arquivos de configuração.

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
