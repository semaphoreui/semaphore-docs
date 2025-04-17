# API

## API reference

<div class="warning">
    Full API documentation is available in <a href="https://semaphoreui.com/api-docs">API reference</a>.
</div>

## Creating API token

### Create API token 

<img style="aspect-ratio: 1920/1440" src="https://www.semaphoreui.com/uploads/v2.14/tokens.webp">

### CLI

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

Use this token for launching a task or anything else:

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

Expire a token:

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
