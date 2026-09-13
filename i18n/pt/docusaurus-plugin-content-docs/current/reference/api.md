# API

## Referência da API {#api-reference}

O Semaphore UI oferece dois formatos de documentação da API, para que você possa escolher o que melhor se adapta ao seu fluxo de trabalho:

* [Swagger/OpenAPI](https://semaphoreui.com/api-docs) &mdash; ideal se você prefere uma experiência interativa no navegador.
* [Coleção oficial do Postman](https://www.postman.com/semaphoreui) &mdash; explore e teste todos os endpoints no Postman.
* **Documentação Swagger integrada da API** &mdash; documentação interativa da API baseada no Swagger UI. Você pode acessá-la na sua instância.

![](/assets/swagger-link.webp)

Todas as opções incluem a documentação completa dos endpoints disponíveis, parâmetros e exemplos de respostas.

## Primeiros passos com a API {#getting-started-with-the-api}

Para começar a usar a API do Semaphore, você precisa gerar um token de API.
Esse token deve ser incluído no cabeçalho da requisição como:

```http
Authorization: Bearer YOUR_API_TOKEN
```

### Criando um token de API {#creating-an-api-token}

Há duas maneiras de criar um token de API:
- Pela interface web
- Usando uma requisição HTTP

#### Pela interface web (desde a versão 2.14) {#through-the-web-interface-since-214}

Abra o menu da conta na parte inferior da barra lateral e escolha **Tokens de API**. A página lista os seus tokens; o link **Referência da API** nela abre o Swagger UI integrado à sua instância.

![Tokens de API](/assets/api-tokens.webp)

Clique em **Novo Token**, informe um nome, escolha quando o token expira e copie o valor exibido após a criação. Consulte [Sua conta](/user-guide/account#api-tokens).

<div style={{maxWidth: 420}}>

![Diálogo de novo token](/assets/api-token-new.webp)

</div>

#### Usando uma requisição HTTP {#using-http-request}

Você também pode se autenticar e gerar um token de sessão usando uma requisição HTTP direta.

Faça login no Semaphore (a senha deve ser escapada, por exemplo `slashy\\pass` em vez de `slashy\pass`):

```bash
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

Gere um novo token e obtenha o novo token:

```bash
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

O comando deve retornar algo semelhante a:

```json
{
    "id": "YOUR_ACCESS_TOKEN",
    "created": "2025-05-21T02:35:12Z",
    "expired": false,
    "user_id": 3
}
```
---

## Usando o token para fazer requisições à API {#using-token-to-make-api-requests}

Depois de obter o seu token de API, inclua-o no cabeçalho **Authorization** para autenticar as suas requisições.

### Iniciar uma tarefa {#launch-a-task}

Use este token para iniciar uma tarefa ou qualquer outra operação:

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

---

## Expirando um token de API {#expiring-an-api-token}

Se você não precisar mais do token, expire-o para manter a sua conta segura.

Para revogar (expirar) manualmente um token de API, envie uma requisição DELETE para o endpoint do token:

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
