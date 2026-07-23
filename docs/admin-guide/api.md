# API

Semaphore UI provides a REST API. It is the same API the web UI is built on: everything you can do in the web interface — manage projects, templates, inventories, keys, and run tasks — can also be done with API calls. All endpoints live under the `/api` path of your Semaphore instance (for example `http://localhost:3000/api`).

The API is described by an OpenAPI specification ([`api-docs.yml`](https://github.com/semaphoreui/semaphore/blob/develop/api-docs.yml) in the Semaphore repository). You can browse it in several ways:

* [Interactive API reference](https://semaphoreui.com/api-docs) &mdash; Swagger/OpenAPI in the browser.
* [Official Postman Collection](https://www.postman.com/semaphoreui) &mdash; explore and test all endpoints in Postman.
* **Built-in Swagger API documentation** &mdash; interactive API documentation powered by Swagger UI, available on your own instance.

![Link to the built-in Swagger documentation in the Semaphore UI](/assets/swagger-link.webp)

All options include complete documentation of available endpoints, parameters, and example responses.

## Authentication

API requests are authenticated with an API token passed in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_TOKEN
```

### Create an API token in the web interface

*Available since v2.14.*

You can create and manage your API tokens via the Semaphore web UI:

![API Tokens](https://www.semaphoreui.com/uploads/v2.14/tokens.webp)

### Create an API token via HTTP requests

You can also authenticate and generate a token using direct HTTP requests.

1. Log in to Semaphore with `POST /api/auth/login` to obtain a session cookie (the password should be escaped: `slashy\\pass` instead of `slashy\pass`, for example):

   ```bash
   curl -v -c /tmp/semaphore-cookie -XPOST \
   -H 'Content-Type: application/json' \
   -H 'Accept: application/json' \
   -d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
   http://localhost:3000/api/auth/login
   ```

2. Create a new token with `POST /api/user/tokens`, using the session cookie:

   ```bash
   curl -v -b /tmp/semaphore-cookie -XPOST \
   -H 'Content-Type: application/json' \
   -H 'Accept: application/json' \
   http://localhost:3000/api/user/tokens
   ```

   The command returns something similar to:

   ```json
   {
       "id": "YOUR_ACCESS_TOKEN",
       "created": "2025-05-21T02:35:12Z",
       "expired": false,
       "user_id": 3
   }
   ```

The `id` value is your API token.

### Expire an API token

If you no longer need a token, expire it to keep your account secure. Send a `DELETE` request to the token endpoint:

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```

## Common operations

The following recipes assume project ID `1`; adjust IDs and the base URL for your instance.

### Launch a task from a template

`POST /api/project/{project_id}/tasks` starts a job. Only `template_id` is required; optional fields include `debug`, `dry_run`, `diff`, `playbook`, `environment`, `limit`, `git_branch`, `message`, `arguments`, and `inventory_id`.

```bash
curl -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

The response (`201`) is the queued task, including its `id`.

### Get task status

`GET /api/project/{project_id}/tasks/{task_id}` returns a single task, including its current status:

```bash
curl \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/project/1/tasks/23
```

### Get task output

`GET /api/project/{project_id}/tasks/{task_id}/output` returns the task output as an array of log records:

```bash
curl \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/project/1/tasks/23/output
```

To get the output as plain text instead, use `GET /api/project/{project_id}/tasks/{task_id}/raw_output`.
