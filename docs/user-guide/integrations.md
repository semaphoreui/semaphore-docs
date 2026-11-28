---
title: Integrations
description: Starting templates and workflows from incoming webhooks with endpoints, integration groups, authentication methods, matchers, and value extractors.
---

# Integrations

Integrations let external services such as GitHub, GitLab or a CI server start tasks in Semaphore by calling a webhook URL. Three objects describe an integration: an **endpoint** says where the request arrives and how it is authenticated, an **integration group** says which integrations run from that endpoint, and an **integration** says what to start and with which parameters.

![Integrations list](/assets/integrations-list.webp)

## How it works {#how-it-works}

| Object | What it holds | Where |
|---|---|---|
| **Endpoint** | A name and description, one or more **aliases** (public URLs of the form `/api/integrations/<random_string>`) and the **authentication** every request to those URLs is checked with. | Project → **Endpoints** |
| **Integration group** | A set of integrations that run from one endpoint. A group normally inherits the endpoint's authentication; it can **override** it with its own method and secret. | Project → **Integrations**, one section per group |
| **Integration** | The template or workflow (Pro) to start, its task parameters, the [matchers](#matchers) that filter requests and the [value extractors](#value-extractors) that feed the task. | Inside its group |

When a request arrives at an alias, Semaphore finds the endpoint, checks the request against the authentication of each group (the endpoint's or the group's own), and starts every integration of an authorized group whose matchers all accept the request. An integration without matchers runs on every authorized request. The response is always `204 No Content`; the `X-Semaphore-Endpoint-ID`, `X-Semaphore-Integration-Group-ID`, `X-Semaphore-Integration-ID` and `X-Semaphore-Task-ID` headers name what was started. `GET` and `POST` are accepted.

![Integration details](/assets/integration-detail.webp)

The alias string is the only secret of an unauthenticated endpoint: treat the URL like a password, and remove an alias to revoke it. One endpoint can have several aliases, so you can hand a separate URL to every sender and revoke them one by one.

## Authentication {#authentication}

An endpoint, or a group that overrides it, checks requests with one of the following methods:

* **GitHub Webhooks** — the `X-Hub-Signature-256` header, HMAC-SHA256 of the body with the secret
* **Bitbucket Webhooks** — the `x-hub-signature` header, HMAC-SHA256 of the body
* **Token** — a header of your choice must equal the secret
* **HMAC (SHA-256)** and **HMAC (SHA-512)** — a header of your choice carries the signature of the body
* **BasicAuth** — login and password of a login/password credential
* **No authentication** — any request with a valid alias URL passes

The secret comes from the project [Key Store](./key-store): a **String** key (its value is the secret) or a **login/password** credential (its password is the secret). BasicAuth is the exception: it checks the login as well, so it needs a login/password credential. The form only offers keys whose type fits the method, and the API refuses the others.

## HMAC authentication {#hmac-authentication}

HMAC auth methods (`hmac` / SHA-256 and `hmac-sha512` / SHA-512) verify that the webhook body was signed with a shared secret.

Configure on the endpoint (or on the group that overrides it):

1. **Auth header** — the request header that carries the signature (for example `X-Signature`).
2. **Auth secret** — a key-store **String** key or a login/password credential.

The sender must put a **raw hexadecimal** HMAC digest of the raw request body into that header (no `sha256=` / `sha512=` prefix). Semaphore compares it with `HMAC-SHA256` or `HMAC-SHA512` of the body using the configured secret.

Example (SHA-512) with OpenSSL:

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

Matchers describe the requests an integration reacts to: a header or a body field (JSON path or the whole body as a string) compared with a value. All matchers of an integration must match; an integration without matchers runs on every request its group lets through. Use matchers to run different integrations of one endpoint for different events — for example one template for `push` and another for `release`.

## Value Extractors {#value-extractors}

With an extractor, you can take data from the request header or body (JSON field or string) and pass it to the task. Each extracted value has a **Variable type**:

* **Environment**: the value is added to the task's environment variables, overriding a variable of the same name from the variable group.
* **Task parameter**: the value becomes a task parameter, for example a survey variable or a prompt.

## Task parameters {#task-parameters}

Integrations can trigger tasks with parameters. Use value extractors to build a JSON payload for task parameters and configure the template to accept prompted values.

## Upgrading from older versions {#upgrading-from-older-versions}

Before version 2.20.19 an integration carried its own authentication, and aliases existed either for the whole project or for a single integration. Upgrading converts that configuration without changing what any existing URL does:

| Before | After the upgrade |
|---|---|
| Project aliases (the URL above the integration list) | An endpoint named **Default** with no authentication that holds all of them |
| An integration reached through the project alias ("Use project alias" on) | A group of its own on the **Default** endpoint. If the integration had authentication, the group **overrides** the endpoint's with it |
| An integration with its own aliases | An endpoint named after the integration, with its aliases and authentication, and a group of its own on that endpoint |
| Matchers and value extractors | Unchanged |

Every integration ends up alone in a group named after it; merge groups or rename endpoints as you like afterwards. Two details differ from the old behaviour: an integration behind the project alias that had no matchers never ran before and now runs on every authorized request, and the own aliases of an integration that also used the project alias (which never matched anything) are dropped. Project backups taken with an older version are converted the same way when restored.
