# API

### How to use Semaphore API

Login to Semaphore (password should be escaped, `slashy\\pass` instead of `slashy\pass` e.g.):

```
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

Get user tokens:

```
curl -v -b /tmp/semaphore-cookie \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

Generate a new token if user had no one and get tokens again:

```
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens


curl -v -b /tmp/semaphore-cookie \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

Should be returned something like:

`[{"id":"`**`YOUR_ACCESS_TOKEN`**`","created":"2017-03-11T13:13:13Z","expired":false,"user_id":1}]`

Use this token for launching a task or anything else:

```
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

Expire token:

```
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```

### API documentation

{% hint style="info" %}
Full API documentation is available in [API reference](https://ansible-semaphore.com/api).
{% endhint %}
