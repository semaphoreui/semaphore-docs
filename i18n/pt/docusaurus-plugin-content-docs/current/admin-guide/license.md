---
title: "Ativação da licença"
---

# Ativação da licença <Pro />

Os recursos do Semaphore Pro e Enterprise são habilitados com uma chave de licença. Você pode ativar a licença pela interface web ou fornecer a chave na configuração do servidor para implantações automatizadas.

## Antes de começar {#before-you-start}

- Você não precisa reinstalar o Semaphore UI nem mudar para uma build diferente para ativar o Pro ou o Enterprise. A sua versão atual do Semaphore UI pode ser ativada com uma chave de licença. Atualize para a versão mais recente se quiser acesso aos recursos mais novos do Pro ou do Enterprise.
- Faça login com uma conta de administrador.
- Tenha a sua chave de licença em mãos. Você pode encontrá-la no e-mail de compra ou no [Portal do Semaphore UI](https://portal.semaphoreui.com/auth/login).

## Ativar pela interface web {#activate-from-the-web-ui}

1. Faça login no Semaphore UI como administrador.

![Tela de login do Semaphore UI](/assets/subscription-login-screen.png)

2. Abra o menu Admin a partir da área do usuário, no canto inferior esquerdo.

![Acionador do menu Admin no canto inferior esquerdo](/assets/subscription-admin-menu-trigger.png)

3. Selecione **Upgrade para PRO ou EE**.

![Menu Admin com o item Upgrade para PRO ou EE](/assets/subscription-upgrade-menu-item.png)

4. Cole a sua chave de licença na caixa de diálogo de ativação e clique em **ATIVAR NOVA CHAVE**.

![Caixa de diálogo de ativação do Semaphore Pro](/assets/subscription-activation-dialog.png)

Após uma ativação bem-sucedida, o Semaphore UI exibe os detalhes da sua licença atual na caixa de diálogo **Assinatura e Cobrança**.

![Caixa de diálogo Assinatura e Cobrança após a ativação bem-sucedida](/assets/subscription-activation-success.png)

## Ativar pela configuração {#activate-from-configuration}

Para implantações com Docker, Kubernetes, systemd ou outras implantações automatizadas, forneça a chave de licença na configuração do servidor em vez de inseri-la na interface. Os nomes das opções de configuração usam `subscription.*`.

No `config.json`:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

Ou como variável de ambiente:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

Você também pode armazenar a chave em um arquivo:

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

ou:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

Quando a chave de licença é gerenciada pela configuração, o Semaphore UI desabilita os controles de edição e ativação na caixa de diálogo **Assinatura e Cobrança**. Isso se aplica tanto a `subscription.key` quanto a `subscription.key_file`, porque o servidor lê o arquivo da chave para a chave de licença em tempo de execução durante a inicialização.

## Como funciona a validação da licença {#how-license-validation-works}

O Semaphore UI valida a licença no Portal do Semaphore UI. O endereço está em `subscription.server_url`, por padrão `https://portal.semaphoreui.com/billing`.

### A que o Semaphore UI se conecta {#what-semaphore-ui-connects-to}

| Quando | Requisição |
| --- | --- |
| Ativação de uma chave | `POST {server_url}/subscriptions/{key}/activate` |
| Validação e renovação da licença | `POST {server_url}/subscriptions/{key}/validate` |

Ambas são requisições JSON simples, e uma requisição é abandonada após 20 segundos. A requisição de ativação envia a chave de licença; a requisição de validação envia o token de licença que o servidor possui naquele momento. Nada mais sai da instalação: contas de usuário, nomes de projeto, inventários, nomes de host e saída das tarefas não fazem parte dessas requisições.

A resposta nos dois casos é um **token de licença** — um JWT assinado pelo portal com uma chave RSA. O Semaphore UI verifica a assinatura com a chave pública correspondente embutida no binário do servidor, portanto um token não pode ser falsificado nem alterado. Suas claims trazem o que a licença permite: o plano, o estado da assinatura, o nome da empresa, a data de expiração e a quantidade de usuários Pro, nós e UIs. O servidor guarda a chave e o token no banco de dados, nas opções `subscription_key` e `subscription_token`.

### Quando a verificação acontece {#when-the-check-runs}

| Gatilho | O que acontece |
| --- | --- |
| Inicialização do servidor | O token de licença é renovado uma vez. |
| Todos os dias às 01:00, hora do servidor | O token de licença é renovado. |
| Ativação de uma chave na interface web ou por `subscription.key` | A chave é ativada e devolve o primeiro token. |
| **Recarregar** no diálogo **Assinatura e Cobrança** | O token de licença é renovado sob demanda. |

Entre essas chamadas o Semaphore UI não entra em contato com o portal. Toda verificação de licença — se os recursos Pro estão habilitados e se mais um usuário Pro, runner ou estado de backend HTTP do Terraform/OpenTofu cabe na licença — lê o token armazenado localmente.

### Quando o portal não pode ser alcançado {#when-the-portal-cannot-be-reached}

Uma renovação que falha é registrada no log do servidor com o contexto `subscription` e deixa o token armazenado intacto, de modo que uma queda de rede ou um portal indisponível não desliga os recursos Pro. A instalação continua funcionando até que a data de expiração contida no próprio token seja ultrapassada: um token expirado ainda é carregado, mas seu estado passa a `expired` e os recursos Pro param.

### Chaves online e offline {#online-and-offline-keys}

- Uma **chave online** é um UUID no formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. Ativá-la chama o portal, e a renovação diária a mantém atualizada. Um valor que não seja um UUID é recusado antes de qualquer requisição.
- Uma **chave offline** é ela mesma um token de licença — uma longa cadeia assinada emitida para uma instalação sem acesso à internet. O Semaphore UI a verifica localmente e nunca chama o portal por causa dela, portanto a renovação diária não faz requisição alguma. Para renovar uma licença offline, substitua a chave por uma recém-emitida.

### Alta disponibilidade {#high-availability}

Cada nó do servidor renova a licença na sua própria inicialização e no seu próprio agendamento diário, e grava o resultado no banco de dados compartilhado, de modo que todos os nós do cluster leem o mesmo token de licença. Nenhuma configuração adicional é necessária.

## Acessar o servidor de licenças por um proxy {#reach-the-license-server-through-a-proxy}

:::info Desde a v2.20
O proxy está disponível desde o **Semaphore 2.20**.
:::

A ativação de uma chave, a renovação do token de licença e a renovação diária do token chamam o Portal do Semaphore UI em `subscription.server_url`. Em uma rede em que o servidor não tem acesso direto à internet, encaminhe essas chamadas por um proxy HTTP:

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

Ou como variáveis de ambiente:

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

Observações:

- Os esquemas `http`, `https`, `socks5` e `socks5h` são suportados. Um endereço de proxy inválido interrompe o servidor na inicialização.
- `username` e `password` são opcionais e substituem as credenciais informadas dentro de `url`. Mantê-las separadas evita que a senha apareça no endereço de proxy registrado nos logs do Semaphore UI.
- O proxy vale apenas para as requisições ao servidor de licenças. Tarefas, clones do Git e outras conexões de saída não são afetadas.
- Sem `subscription.proxy`, o servidor de licenças é alcançado pelas variáveis de proxy do processo do servidor (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`), como antes.
- Uma instalação sem acesso à internet precisa de uma chave de licença offline em vez de um proxy — para ela o servidor nunca chama o portal.

## Gerenciar ou substituir uma chave de licença {#manage-or-replace-a-license-key}

Para renovar, substituir ou revisar a sua licença, abra o menu Admin e selecione **Assinatura e Cobrança**.

![Menu Admin com o item Assinatura e Cobrança](/assets/subscription-billing-menu-item.png)

Para uma chave de licença gerenciada pela interface web, abra o menu de ações na caixa de diálogo **Assinatura e Cobrança** para recarregar, enviar ou redefinir a chave.

![Caixa de diálogo Assinatura e Cobrança com as ações da chave](/assets/subscription-key-actions-menu.png)

Se a chave estiver configurada no servidor:

1. Substitua o valor de `subscription.key` ou atualize o conteúdo do arquivo referenciado por `subscription.key_file`.
2. Reinicie o Semaphore UI para que o servidor recarregue a chave de licença.
3. Verifique se as opções esperadas do Pro ou do Enterprise estão disponíveis no Semaphore UI.
