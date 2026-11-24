# Integrações

Uma integração inicia um modelo de tarefa quando um serviço externo chama uma URL do Semaphore. Quem chama pode ser o GitHub, o GitLab, o Bitbucket, um sistema de monitoramento ou qualquer programa capaz de enviar uma requisição HTTP. A requisição não apenas dispara a execução: partes dela — o nome de um branch, um commit, uma tag de versão — podem ser levadas para a tarefa como variáveis.

![Lista de integrações](/assets/integrations-list.webp)

Cada integração tem quatro partes:

| Parte | Responde à pergunta |
|---|---|
| **Alias** | Qual URL o remetente chama? |
| **Método de autenticação** | Esta requisição pode iniciar alguma coisa? |
| **Matchers** | É *esta* a requisição que a integração espera? |
| **Extratores de valores** | Quais campos da requisição chegam à tarefa, e como? |

Para criar uma, abra **Integrations** no menu do projeto e clique em **New Integration**: dê um nome, escolha o modelo de tarefa que ela executa e o método de autenticação. Depois clique na integração na lista para configurar seu alias, seus matchers e seus extratores de valores.

![Detalhes de uma integração](/assets/integration-detail.webp)

## Como uma chamada é tratada {#how-a-call-is-handled}

1. O remetente chama `/api/integrations/<alias>` com `GET` ou `POST`.
2. O Semaphore resolve o alias para as integrações que ele pode iniciar. O endpoint é público — apenas o alias e o método de autenticação o protegem.
3. Cada uma dessas integrações confere a requisição com o seu próprio **método de autenticação**. Uma requisição que não passa na conferência não inicia nada.
4. Se a chamada chegou por um **alias de projeto**, os **matchers** da integração são avaliados. Todos precisam corresponder; caso contrário, a integração é ignorada.
5. Os **extratores de valores** são executados e transformam partes da requisição em variáveis e parâmetros da tarefa.
6. A tarefa é criada e colocada na fila, exatamente como se alguém tivesse iniciado o modelo à mão.

Uma chamada processada recebe `204 No Content` com corpo vazio, tenha ou não iniciado algo. O que foi iniciado é informado nos cabeçalhos da resposta:

| Cabeçalho da resposta | Valor |
|---|---|
| `X-Semaphore-Task-ID` | A tarefa criada |
| `X-Semaphore-Template-ID` | O modelo que ela executa |
| `X-Semaphore-Project-ID` | O projeto a que a tarefa pertence |
| `X-Semaphore-Integration-ID` | A integração que a iniciou |
| `X-Semaphore-Inventory-ID` | O inventário da tarefa, quando ela tem um |

Toda chamada a um alias conhecido também é gravada no [histórico de chamadas](#call-history), o lugar onde olhar quando um webhook não faz o que se espera.

## Aliases {#aliases}

Um alias é a parte aleatória e impossível de adivinhar da URL do webhook: `/api/integrations/<random_string>`. Aceita `GET` e `POST`. Existem dois tipos, e uma integração usa apenas um deles de cada vez.

Um **alias de projeto** é criado com **Add Alias** acima da lista de integrações e é compartilhado por todas as integrações do projeto que têm a chave **Use project alias** ligada. Uma requisição que chega é oferecida a todas elas, e cada uma decide pelos seus matchers se é executada. É o alias para entregar uma única vez ao GitHub ou ao GitLab e depois distribuir os eventos com matchers.

Um **alias de integração** é criado com **Add Alias** na página da própria integração e pertence só a ela. Uma chamada a ele inicia a integração na hora — **os matchers não são avaliados de forma alguma**. Use-o quando o remetente é dedicado a uma única função, ou quando o corpo vem em um formato que os matchers não conseguem inspecionar.

:::warning
A chave **Use project alias** na página da integração decide qual tipo de alias funciona. Enquanto está ligada, a integração responde ao alias de projeto e os seus próprios aliases são ignorados; enquanto está desligada, o alias de projeto nunca chega à integração e os matchers dela nunca são usados.
:::

Um projeto pode ter vários aliases dos dois tipos. Apagar um com o ícone de lixeira ao lado o interrompe na hora, enquanto as chamadas já recebidas permanecem no histórico.

## Autenticação {#authentication}

O endpoint do webhook não fica atrás de um login, então o método de autenticação é o que impede estranhos de iniciar as suas tarefas. Escolha-o no formulário da integração; **Auth secret** é uma chave do [cofre de chaves](/user-guide/key-store).

| Método de autenticação | O que o Semaphore verifica | Auth secret |
|---|---|---|
| **None** | Nada — quem descobrir a URL pode iniciar o modelo | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` é igual a `sha256=` mais o HMAC-SHA256 do corpo | String, ou a senha de uma chave login/senha |
| **Bitbucket Webhooks** | `X-Hub-Signature` do mesmo modo | String, ou a senha de uma chave login/senha |
| **Token** | O cabeçalho indicado em **Auth header** é igual ao segredo | String, ou a senha de uma chave login/senha |
| **HMAC** | O cabeçalho indicado em **Auth header** contém o HMAC-SHA256 do corpo | String, ou a senha de uma chave login/senha |
| **HMAC (SHA-512)** | O mesmo com HMAC-SHA512 | String, ou a senha de uma chave login/senha |
| **BasicAuth** | O cabeçalho `Authorization` traz o login *e* a senha | Somente uma chave login/senha |

Uma chave do tipo **String** usa o seu valor como segredo compartilhado; uma chave login/senha usa a sua senha, e só o BasicAuth também compara o login. Uma chave de um tipo que o método não pode usar faz a requisição ser rejeitada, em vez de ignorar a divergência.

### Autenticação HMAC {#hmac-authentication}

Os métodos de autenticação HMAC (`hmac` / SHA-256 e `hmac-sha512` / SHA-512) verificam que o corpo do webhook foi assinado com um segredo compartilhado.

Configure:

1. **Auth header** — o cabeçalho da requisição que carrega a assinatura (por exemplo `X-Signature` ou `X-Hub-Signature-256`).
2. **Auth secret** — uma chave **String** do cofre de chaves (o segredo é o seu valor) ou uma credencial login/senha (o segredo é a sua **senha**).

O remetente precisa colocar nesse cabeçalho um digest HMAC do corpo bruto da requisição em **hexadecimal puro** (sem o prefixo `sha256=` / `sha512=`; os métodos do GitHub e do Bitbucket, ao contrário, esperam esse prefixo, e os métodos HMAC não). O Semaphore o compara com o `HMAC-SHA256` ou o `HMAC-SHA512` do corpo calculado com o segredo configurado.

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

Um matcher é uma condição sobre a requisição que chega: *este cabeçalho é igual àquilo*, *este campo JSON contém aquilo*. Os matchers são o que permite a um único alias de projeto servir muitas integrações: o GitHub envia todos os eventos para a mesma URL e os matchers decidem qual integração reage a qual evento.

Um matcher apenas decide se a integração é executada. Ele nunca altera a tarefa; isso é trabalho dos extratores.

Os matchers são avaliados **somente nas chamadas que chegam por um alias de projeto** (chave **Use project alias** ligada). Uma chamada ao alias próprio de uma integração a inicia sem olhar para eles.

### Campos de um matcher {#matcher-fields}

| Campo | Significado |
|---|---|
| **Name** | Um rótulo para a lista. Texto livre, não usado na comparação |
| **Match on** | **Body** ou **Header** — de onde vem o valor |
| **Body Data Format** | **JSON** ou **String**, exibido apenas para **Body** |
| **Key** | O nome do cabeçalho, ou o caminho até um campo do corpo JSON |
| **Comparison Method** | `==`, `!=` ou **Contains** |
| **Value** | O texto com o qual o valor da requisição é comparado |

**Match on: Header** — **Key** é um nome de cabeçalho e maiúsculas não importam: `X-GitHub-Event` e `x-github-event` são o mesmo cabeçalho. Um cabeçalho que a requisição não traz se comporta como um valor ausente (veja abaixo). Quando um cabeçalho aparece várias vezes, só o primeiro valor é comparado.

**Match on: Body, JSON** — **Key** é um caminho dentro do corpo já interpretado, descrito na seção seguinte. Um corpo que não é JSON válido devolve um valor ausente para qualquer chave.

**Match on: Body, String** — o valor é o corpo bruto inteiro e **Key** é ignorado. O formulário pede uma chave de qualquer forma, porque o campo é obrigatório; escreva um hífen. É a única maneira de comparar um corpo que não é JSON — combine com **Contains**.

**Key** e **Value** são ambos obrigatórios, então um matcher não consegue testar um valor vazio. Para reagir à ausência de um campo, compare-o com `!=` contra um valor que ele nunca tem.

### Chaves JSON {#json-keys}

Uma chave é um caminho pelo documento JSON. Os níveis são separados por pontos e um elemento de array é indicado pelo seu índice entre colchetes, contando a partir de zero. Maiúsculas e minúsculas importam nos nomes.

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| Chave | Para o que aponta |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | O array inteiro |
| `repository.url` | Para nada — o campo não existe |

A mesma sintaxe é usada pelo campo **Key** de um extrator de valores.

### Como um matcher compara valores {#how-a-matcher-compares-values}

O valor vindo da requisição é transformado em texto e comparado com **Value** como texto, então o campo **Value** nunca precisa de aspas, colchetes ou escapes.

- **Strings** são comparadas literalmente, diferenciando maiúsculas de minúsculas: `Push` não corresponde a `push`.
- **Números** são comparados sem a parte decimal quando não a têm: `42` no corpo corresponde ao valor `42`, não a `42.0`. Um número fracionário é comparado como está escrito, então `1.5` corresponde a `1.5`.
- **Booleanos** correspondem a `true` e `false`.
- **Um valor ausente** — um cabeçalho que falta, um caminho JSON que não existe, um `null` ou um corpo que não é JSON válido — é comparado como o texto literal `<nil>`. Disso vem uma consequência que vale lembrar: `==` nunca corresponde a um campo ausente, e `!=` corresponde sempre a ele.
- **Objetos e arrays** não têm forma textual legível; não os compare. Aponte a chave para um campo escalar lá dentro.
- **Contains** é um teste simples de substring, sensível a maiúsculas, sem curingas e sem expressões regulares.

### Vários matchers {#several-matchers}

Uma integração pode ter quantos matchers quiser, e eles são combinados com **E**: a integração só é executada quando todos correspondem. Não há como expressar um *ou* dentro de uma integração — crie uma segunda integração sobre o mesmo modelo para a condição alternativa.

:::warning
Uma integração que usa o alias de projeto e **não tem matchers** nunca inicia, porque não existe nada que possa corresponder. Dê a ela pelo menos um matcher, ou desligue **Use project alias** e chame o alias próprio da integração.
:::

### Exemplos de matchers {#matcher-examples}

| Objetivo | Match on | Formato | Key | Método | Value |
|---|---|---|---|---|---|
| Só os pushes do GitHub | Header | — | `X-GitHub-Event` | `==` | `push` |
| Só os pushes para `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| Qualquer branch exceto `main` | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| Só tags | Body | JSON | `ref` | Contains | `refs/tags/` |
| Só merge requests do GitLab já integradas | Body | JSON | `object_attributes.state` | `==` | `merged` |
| Ignorar os commits de um bot | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| Só releases publicadas do GitHub | Body | JSON | `action` | `==` | `published` |
| Um alerta em texto puro que menciona um disco | Body | String | `-` | Contains | `disk` |

As duas primeiras linhas juntas são a configuração habitual de uma integração de deploy: o tipo de evento vindo do cabeçalho e o branch vindo do corpo, e ambos precisam corresponder.

## Extratores de valores {#value-extractors}

Um extrator de valores copia um pedaço da requisição que chega para a tarefa que está a ponto de iniciar. É assim que um webhook passa um branch, um hash de commit, um autor ou a versão de uma release para a automação que dispara.

Os extratores sempre são executados, por qualquer tipo de alias que a chamada tenha chegado, e isso acontece depois que a autenticação e os matchers foram vencidos.

### Campos de um extrator {#extractor-fields}

| Campo | Significado |
|---|---|
| **Name** | Um rótulo para a lista. Texto livre |
| **Source of the Value** | **Body** ou **Header** |
| **Data Type of Body** | **JSON** ou **String**, exibido apenas para **Body** |
| **Key** | O nome do cabeçalho, ou uma [chave JSON](#json-keys) — a mesma sintaxe dos matchers |
| **Variable Usage** | **Variables** ou **Task Params** — para onde o valor é entregue |
| **Variable** | O nome que o valor recebe na tarefa |

Com **Body** e **String**, o corpo bruto inteiro se torna o valor e **Key** é ignorado, exatamente como em um matcher.

### O que a variável recebe {#what-the-variable-receives}

Ao contrário de um matcher, um extrator não transforma nada em texto: um valor JSON mantém o seu tipo, então um número continua número e um objeto continua objeto.

| O que a requisição traz | O que a variável recebe |
|---|---|
| Um cabeçalho | O seu texto; uma string vazia quando o cabeçalho falta |
| Uma string, um número ou um booleano JSON | O mesmo valor, com o seu tipo |
| Um objeto ou um array JSON | O objeto ou array inteiro, com a estrutura preservada |
| Um `null` do JSON, um caminho que não existe ou um corpo que não é JSON válido | Nada — a variável **não é definida de forma alguma**, e o que o modelo define permanece |
| O corpo como **String** | O corpo bruto inteiro, como texto |

A diferença entre "vazio" e "não definido" importa: um cabeçalho ausente dá à tarefa uma string vazia, enquanto um campo JSON ausente deixa intacto o valor do próprio modelo.

### Variable Usage: Variables {#variable-usage-variables}

O valor se junta às variáveis da tarefa — o mesmo conjunto que o campo **Variables** da janela de nova tarefa preenche. O Semaphore as passa à ferramenta como variáveis extras (`--extra-vars` no Ansible, `-var` no Terraform), e elas substituem uma chave de mesmo nome do [grupo de variáveis](/user-guide/environment) do modelo.

Dê à variável exatamente o nome de uma [variável de questionário](/user-guide/task-templates/survey-vars) do modelo e o webhook preencherá essa variável em vez de uma pessoa.

### Variable Usage: Task Params {#variable-usage-task-params}

Os parâmetros da tarefa são os [prompts](/user-guide/task-templates/prompts) embutidos do modelo, não variáveis para o playbook. O valor extraído é passado sem alteração, então o seu tipo JSON precisa ser o esperado — `true`, não `"true"`.

| Variável | Vale para | Espera |
|---|---|---|
| `git_branch` | Qualquer aplicação | O branch a usar. Um `refs/heads/` inicial é removido, então o `ref` do GitHub pode ser usado como vem |
| `limit`, `tags`, `skip_tags` | Ansible | Uma lista de strings |
| `debug`, `dry_run`, `diff` | Ansible | `true` ou `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` ou `false` |

O modelo precisa permitir a substituição para o valor ter efeito: **Allow override branch in task** para `git_branch`, e o prompt correspondente para `limit`, `tags` e `skip_tags`. Sem essa permissão o valor é descartado e a tarefa roda com a configuração do próprio modelo.

### Exemplo de extratores: push do GitHub {#extractor-example-github-push}

Um webhook de push do GitHub envia um corpo que começa assim:

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

Quatro extratores o transformam em uma tarefa completamente descrita:

| Name | Source | Formato | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

A tarefa então usa `main` (o prefixo `refs/heads/` é removido por você) e roda com as variáveis `COMMIT`, `AUTHOR` e `EVENT` à disposição do playbook. Para ver o que uma chamada real entregou de fato, abra-a na aba History e compare o corpo dela com as suas chaves.

## Parâmetros de tarefa predefinidos {#task-parameters}

Assim que um modelo é escolhido no formulário da integração, aparecem as opções de execução dele: uma mensagem, as suas variáveis de questionário, o inventário, o branch do Git quando o modelo permite substituí-lo e os prompts da aplicação. O que você definir ali passa a ser o padrão de toda tarefa iniciada por esta integração, então os valores que nunca mudam — um inventário, uma mensagem fixa — pertencem a este lugar e não a um extrator.

Os extratores são aplicados por cima desses valores: uma variável ou um parâmetro de tarefa produzido por um extrator substitui o valor predefinido de mesmo nome, e o predefinido sobrevive quando o extrator não encontra nada.

## Integrações de workflow <FeatureState feature="workflows" /> {#workflow-integrations}

Uma integração pode iniciar um [workflow](/user-guide/workflows) em vez de um único modelo. Mude **Runs** para **Workflow** no formulário da integração e escolha o workflow.

Os extratores funcionam da mesma forma, com uma diferença: **Variable Usage** é ignorado e cada valor extraído é entregue como resposta ao questionário do workflow com o nome de **Variable**. O workflow então valida essas respostas e as passa aos seus nós pelos vínculos deles, de modo que um valor ao qual nenhum nó está vinculado nunca chega a uma tarefa. Uma chamada bem-sucedida informa `X-Semaphore-Workflow-ID` e `X-Semaphore-Workflow-Run-ID` além dos cabeçalhos da tarefa.

## Histórico de chamadas {#call-history}

A aba **History** da página de integrações lista todas as chamadas que o projeto recebeu por qualquer um dos seus aliases, da mais recente para a mais antiga. Ela sobrevive ao alias, à integração e à tarefa que iniciou, porque é guardada por projeto e não por integração.

| Coluna | Mostra |
|---|---|
| **Time** | Quando a chamada chegou |
| **Integration** | A integração que a atendeu, com o alias abaixo — clique no alias para filtrar a lista |
| **Source IP** | O endereço de onde a chamada veio |
| **Method** | `GET` ou `POST` |
| **Status** | O que a integração fez com a chamada, e por quê |
| **Task** | A tarefa ou a execução de workflow iniciada |
| **Duration** | Quanto a integração levou para atender a chamada |

Há quatro status possíveis:

| Status | Significado |
|---|---|
| `ok` | Uma tarefa ou uma execução de workflow começou |
| `unauthorized` | A requisição não passou no método de autenticação da integração |
| `skipped` | Os matchers não corresponderam, ou o alias não iniciou integração nenhuma |
| `error` | O início foi tentado e falhou — o modelo tinha sumido, o questionário recusou os valores |

Clicar em uma linha abre a chamada, incluindo o corpo da requisição como foi recebido (os primeiros 64 KiB; se era maior, são mostrados o tamanho guardado e o original). Os **cabeçalhos da requisição nunca são guardados**: eles carregam a assinatura ou o token com que o remetente se autenticou. O corpo de uma chamada que não passou na autenticação também não é guardado, já que qualquer um que conheça a URL pode enviar uma.

Filtre a lista por integração e por alias com os controles acima da tabela, e navegue com as setas abaixo. O histórico não expira — ele cresce até o projeto ser excluído.

## Solução de problemas {#troubleshooting}

| Sintoma | O que verificar |
|---|---|
| Nenhuma linha aparece no History | O alias na URL está errado ou foi apagado. Uma chamada ao alias próprio de uma integração com **Use project alias** ligado também não é registrada em lugar nenhum |
| `unauthorized` | O nome do cabeçalho de autenticação, a chave no cofre de chaves e se o remetente envia a assinatura com o prefixo `sha256=` que o método espera. GitHub e Bitbucket usam cabeçalhos próprios, independentemente de **Auth header** |
| `skipped`, motivo *No integration matched the alias* | O alias existe, mas nenhuma integração do projeto está com **Use project alias** ligado |
| `skipped`, motivo *No matcher matched the request* | Abra a chamada e compare o corpo dela com os seus matchers. Lembre que um campo ausente nunca corresponde com `==`, que as chaves diferenciam maiúsculas de minúsculas e que **Contains** não tem curingas. Uma integração sem matcher nenhum é ignorada pelo mesmo motivo |
| A tarefa roda, mas uma variável está vazia ou ausente | A chave JSON não corresponde ao payload (abra a chamada para ver o corpo), o valor era `null`, ou o nome em **Variable** difere da variável de questionário que deveria preencher |
| O branch não é substituído | O modelo precisa de **Allow override branch in task**, e o extrator precisa escrever no parâmetro de tarefa `git_branch` |
| Várias tarefas começam com uma chamada | Várias integrações usam o alias de projeto e os matchers de todas correspondem. Deixe os matchers mais estreitos, ou dê aliases próprios às integrações |
