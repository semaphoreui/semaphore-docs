---
title: Integrações
description: Iniciar modelos e fluxos de trabalho a partir de webhooks recebidos com endpoints, grupos de integração, métodos de autenticação, matchers e extratores de valor.
---

# Integrações

As integrações permitem que serviços externos, como GitHub, GitLab ou um servidor de CI, iniciem tarefas no Semaphore chamando uma URL de webhook. Três objetos descrevem uma integração: um **endpoint** define onde a requisição chega e como ela é autenticada, um **grupo de integração** define quais integrações são executadas a partir desse endpoint, e uma **integração** define o que iniciar e com quais parâmetros.

![Lista de integrações](/assets/integrations-list.webp)

## Como funciona {#how-it-works}

| Objeto | O que contém | Onde |
|---|---|---|
| **Endpoint** | Um nome e uma descrição, um ou mais **aliases** (URLs públicas no formato `/api/integrations/<random_string>`) e a **autenticação** com a qual toda requisição a essas URLs é verificada. | Projeto → **Endpoints** |
| **Grupo de integração** | Um conjunto de integrações executadas a partir de um endpoint. Normalmente o grupo herda a autenticação do endpoint; ele pode **sobrescrevê-la** com seu próprio método e segredo. | Projeto → **Integrations**, uma seção por grupo |
| **Integração** | O modelo ou fluxo de trabalho (Pro) a iniciar, seus parâmetros de tarefa, os [matchers](#matchers) que filtram as requisições e os [extratores de valor](#value-extractors) que alimentam a tarefa. | Dentro do seu grupo |

Quando uma requisição chega a um alias, o Semaphore localiza o endpoint, verifica a requisição com a autenticação de cada grupo (a do endpoint ou a própria do grupo) e inicia todas as integrações de um grupo autorizado cujos matchers aceitem a requisição. Uma integração sem matchers é executada em toda requisição autorizada. A resposta é sempre `204 No Content`; os cabeçalhos `X-Semaphore-Endpoint-ID`, `X-Semaphore-Integration-Group-ID`, `X-Semaphore-Integration-ID` e `X-Semaphore-Task-ID` indicam o que foi iniciado. Requisições `GET` e `POST` são aceitas.

![Detalhes da integração](/assets/integration-detail.webp)

A string do alias é o único segredo de um endpoint sem autenticação: trate a URL como uma senha e remova o alias para revogá-lo. Um endpoint pode ter vários aliases, então você pode entregar uma URL separada a cada remetente e revogá-las uma a uma.

## Autenticação {#authentication}

Um endpoint, ou um grupo que o sobrescreve, verifica as requisições com um dos seguintes métodos:

* **Webhooks do GitHub** — o cabeçalho `X-Hub-Signature-256`, HMAC-SHA256 do corpo com o segredo
* **Webhooks do Bitbucket** — o cabeçalho `x-hub-signature`, HMAC-SHA256 do corpo
* **Token** — um cabeçalho à sua escolha deve ser igual ao segredo
* **HMAC (SHA-256)** e **HMAC (SHA-512)** — um cabeçalho à sua escolha contém a assinatura do corpo
* **BasicAuth** — login e senha de uma credencial de login e senha
* **Sem autenticação** — qualquer requisição com uma URL de alias válida é aceita

O segredo vem do [Armazenamento de Chaves](./key-store) do projeto: uma chave do tipo **Texto** (o valor dela é o segredo) ou uma credencial de **login e senha** (a senha dela é o segredo). BasicAuth é a exceção: ele também verifica o login, por isso precisa de uma credencial de login e senha. O formulário oferece apenas as chaves cujo tipo é compatível com o método, e a API recusa as demais.

## Autenticação HMAC {#hmac-authentication}

Os métodos de autenticação HMAC (`hmac` / SHA-256 e `hmac-sha512` / SHA-512) verificam se o corpo do webhook foi assinado com um segredo compartilhado.

Configure no endpoint (ou no grupo que o sobrescreve):

1. **Auth header** — o cabeçalho da requisição que contém a assinatura (por exemplo, `X-Signature`).
2. **Auth secret** — uma chave do tipo **Texto** do armazenamento de chaves ou uma credencial de login e senha.

O remetente deve colocar nesse cabeçalho um resumo HMAC **hexadecimal puro** do corpo original da requisição (sem o prefixo `sha256=` / `sha512=`). O Semaphore o compara com o `HMAC-SHA256` ou `HMAC-SHA512` do corpo calculado com o segredo configurado.

Exemplo (SHA-512) com OpenSSL:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Matchers {#matchers}

Os matchers descrevem as requisições às quais uma integração reage: um cabeçalho ou um campo do corpo (caminho JSON ou o corpo inteiro como string) comparado com um valor. Todos os matchers de uma integração devem corresponder; uma integração sem matchers é executada em toda requisição que seu grupo deixa passar. Use matchers para executar integrações diferentes de um mesmo endpoint para eventos diferentes — por exemplo, um modelo para `push` e outro para `release`.

## Extratores de Valor {#value-extractors}

Com um extrator, você pode obter dados do cabeçalho ou do corpo da requisição (campo JSON ou string) e passá-los para a tarefa. Cada valor extraído tem um **Tipo de variável**:

* **Ambiente**: o valor é adicionado às variáveis de ambiente da tarefa, sobrescrevendo uma variável de mesmo nome do grupo de variáveis.
* **Parâmetro da tarefa**: o valor se torna um parâmetro da tarefa, por exemplo uma variável de survey ou um prompt.

## Parâmetros da tarefa {#task-parameters}

As integrações podem acionar tarefas com parâmetros. Use extratores de valor para construir um payload JSON para os parâmetros da tarefa e configure o modelo para aceitar valores solicitados.

## Atualização a partir de versões anteriores {#upgrading-from-older-versions}

Antes da versão 2.20.19, uma integração tinha sua própria autenticação, e os aliases existiam para o projeto inteiro ou para uma única integração. A atualização converte essa configuração sem alterar o que qualquer URL existente faz:

| Antes | Depois da atualização |
|---|---|
| Aliases do projeto (a URL acima da lista de integrações) | Um endpoint chamado **Default**, sem autenticação, que contém todos eles |
| Uma integração acessada pelo alias do projeto ("Use project alias" ativado) | Um grupo próprio no endpoint **Default**. Se a integração tinha autenticação, o grupo **sobrescreve** a do endpoint com ela |
| Uma integração com seus próprios aliases | Um endpoint com o nome da integração, com seus aliases e autenticação, e um grupo próprio nesse endpoint |
| Matchers e extratores de valor | Sem alteração |

Cada integração acaba sozinha em um grupo com o seu nome; depois, mescle grupos ou renomeie endpoints como preferir. Dois detalhes diferem do comportamento antigo: uma integração atrás do alias do projeto que não tinha matchers nunca era executada antes e agora é executada em toda requisição autorizada, e os aliases próprios de uma integração que também usava o alias do projeto (que nunca correspondiam a nada) são descartados. Backups de projeto feitos com uma versão anterior são convertidos da mesma forma ao serem restaurados.
