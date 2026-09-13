# Integrações

As integrações permitem estabelecer a interação entre o Semaphore e serviços externos, como GitHub e GitLab.

![Lista de integrações](/assets/integrations-list.webp)

A URL do webhook do projeto é exibida acima da lista. Cada integração tem um nome e o modelo que ela inicia; clique em uma integração para configurar seus matchers e extratores de valor.

![Detalhes da integração](/assets/integration-detail.webp)

Usando uma integração, você pode acionar um modelo específico chamando um endpoint especial (alias), para o qual você pode configurar um dos seguintes métodos de autenticação:
* Webhooks do GitHub
* Token
* HMAC
* Sem autenticação

O alias representa uma URL no seguinte formato: `/api/integrations/<random_string>`. Suporta requisições `GET` e `POST`.

## Matchers {#matchers}

Com os matchers, você pode definir parâmetros da requisição recebida. Quando esses parâmetros correspondem, o modelo será invocado.

## Extratores de Valor {#value-extractors}

Com um extrator, você pode obter dados do cabeçalho ou do corpo da requisição (campo JSON ou string) e passá-los para a tarefa. Cada valor extraído tem um **Tipo de variável**:

* **Ambiente**: o valor é adicionado às variáveis de ambiente da tarefa, sobrescrevendo uma variável de mesmo nome do grupo de variáveis.
* **Parâmetro da tarefa**: o valor se torna um parâmetro da tarefa, por exemplo uma variável de survey ou um prompt.

## Parâmetros da tarefa {#task-parameters}

As integrações podem acionar tarefas com parâmetros. Use extratores de valor para construir um payload JSON para os parâmetros da tarefa e configure o modelo para aceitar valores solicitados.

## Observações sobre aliases e matchers {#notes-on-aliases-and-matchers}

Um alias de projeto (a URL acima da lista de integrações) é compartilhado por todas as integrações do projeto: o Semaphore verifica os matchers de cada integração e inicia os modelos cujos matchers correspondem. Uma integração também pode ter seu próprio alias; as requisições a ele iniciam essa integração sem avaliar os matchers. Prefira a autenticação por token/HMAC conforme necessário e passe os parâmetros por meio de extratores.
