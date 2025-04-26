# API

## API reference

Semaphore UI provides two formats of API documentation, so you can choose the one that fits your workflow best:

* [Swagger/OpenAPI](https://semaphoreui.com/api-docs) &mdash; ideal if you prefer an interactive, browser-based experience.
* [Postman](https://api.semaphoreui.com) &mdash; perfect if you want to leverage the full power of the Postman app for testing and exploring the API.

Both options include complete documentation of available endpoints, parameters, and example responses.

## Getting Started with the API

To start using the Semaphore API, you need to generate an API token.
This token must be included in the request header as:

```http
Authorization: Bearer YOUR_API_TOKEN
```

### Creating an API Token

There are two ways to create an API token:
- Through the web interface (singe 2.14)
- Using HTTP request

#### Through the web interface (singe 2.14)

You can create and manage your API tokens via the Semaphore web UI:

<img style="aspect-ratio: 1920/1440" src="https://www.semaphoreui.com/uploads/v2.14/tokens.webp">

#### Using HTTP request

You can also authenticate and generate a session token using a direct HTTP request.

Login to Semaphore (password should be escaped, `slashy\\pass` instead of `slashy\pass` e.g.):

```bash
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

Get a user tokens:

```bash
curl -v -b /tmp/semaphore-cookie \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

Generate a new token, and get the new token:

```bash
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens


curl -v -b /tmp/semaphore-cookie \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

The command should return something similar to:

`[{"id":"`**`YOUR_ACCESS_TOKEN`**`","created":"2017-03-11T13:13:13Z","expired":false,"user_id":1}]`

---

## Using token to make API requests

Once you have your API token, include it in the **Authorization** header to authenticate your requests.

### Launch a task

Use this token for launching a task or anything else:

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

---

## Expiring an API token

If you no longer need the token, you should expire it to keep your account secure.

To manually revoke (expire) an API token, send a DELETE request to the token endpoint:

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
