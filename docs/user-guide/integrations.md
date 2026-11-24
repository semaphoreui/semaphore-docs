---
title: Integrations
description: Starting templates from incoming webhooks — aliases, authentication methods, matchers that decide when to run, extractors that pass request data to the task, and the call history.
---

# Integrations

An integration starts a task template when an external service calls a Semaphore URL. The caller can be GitHub, GitLab, Bitbucket, a monitoring system, or any program able to send an HTTP request. The request does not only trigger the run: parts of it — a branch name, a commit, a release tag — can be carried into the task as variables.

![Integrations list](/assets/integrations-list.webp)

Every integration has four moving parts:

| Part | Answers the question |
|---|---|
| **Alias** | Which URL does the sender call? |
| **Auth method** | Is this request allowed to start anything? |
| **Matchers** | Is *this* request the one the integration is waiting for? |
| **Value extractors** | Which fields of the request reach the task, and as what? |

To create one, open **Integrations** in the project menu and click **New Integration**: give it a name, pick the task template it runs, and choose an authentication method. Then click the integration in the list to configure its alias, matchers, and value extractors.

![Integration details](/assets/integration-detail.webp)

## How a call is handled {#how-a-call-is-handled}

1. The sender calls `/api/integrations/<alias>` with `GET` or `POST`.
2. Semaphore resolves the alias to the integrations it may start. The endpoint is public — the alias and the authentication method are the only things protecting it.
3. Each of those integrations checks the request against its own **auth method**. A request that fails the check starts nothing.
4. If the call arrived through a **project alias**, the integration's **matchers** are evaluated. They all have to match, or the integration is skipped.
5. The **value extractors** run and turn parts of the request into variables and task parameters.
6. The task is created and queued, exactly as if someone had started the template by hand.

A call that was processed answers `204 No Content` with an empty body, whether or not anything started. What did start is reported in the response headers:

| Response header | Value |
|---|---|
| `X-Semaphore-Task-ID` | The task that was created |
| `X-Semaphore-Template-ID` | The template it runs |
| `X-Semaphore-Project-ID` | The project the task belongs to |
| `X-Semaphore-Integration-ID` | The integration that started it |
| `X-Semaphore-Inventory-ID` | The inventory of the task, when it has one |

Every call to a known alias is also written to the [call history](#call-history), which is the place to look when a webhook does not do what you expect.

## Aliases {#aliases}

An alias is the random, unguessable part of the webhook URL: `/api/integrations/<random_string>`. It accepts `GET` and `POST`. There are two kinds, and an integration uses one of them at a time.

A **project alias** is created with **Add Alias** above the integration list, and it is shared by every integration of the project that has the **Use project alias** switch turned on. One incoming request is offered to all of them, and each one decides through its matchers whether to run. This is the alias to hand to GitHub or GitLab once and then route by event.

An **integration alias** is created with **Add Alias** on the integration's own page, and it belongs to that integration alone. A call to it starts the integration immediately — **matchers are not evaluated at all**. Use it when the sender is dedicated to one job, or when the body is in a format matchers cannot inspect.

:::warning
The **Use project alias** switch on the integration page decides which kind of alias works. While it is on, the integration answers the project alias and its own aliases are ignored; while it is off, the project alias never reaches the integration, and its matchers are never used.
:::

A project may have several aliases of both kinds. Deleting one with the bin icon next to it stops it working immediately, while the calls it already received stay in the history.

## Authentication {#authentication}

The webhook endpoint is not behind a login, so the auth method is what keeps strangers from starting your tasks. Pick it in the integration form; **Auth secret** is a key from the [key store](/user-guide/key-store).

| Auth method | What Semaphore checks | Auth secret |
|---|---|---|
| **None** | Nothing — anyone who learns the URL can start the template | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` equals `sha256=` plus the HMAC-SHA256 of the body | String, or the password of a login/password key |
| **Bitbucket Webhooks** | `X-Hub-Signature` the same way | String, or the password of a login/password key |
| **Token** | The header named in **Auth header** equals the secret | String, or the password of a login/password key |
| **HMAC** | The header named in **Auth header** holds the HMAC-SHA256 of the body | String, or the password of a login/password key |
| **HMAC (SHA-512)** | The same with HMAC-SHA512 | String, or the password of a login/password key |
| **BasicAuth** | The `Authorization` header carries the login *and* the password | Login/password key only |

A **String** key uses its value as the shared secret; a **login/password** key uses its password, and only BasicAuth also compares the login. A key of a type the method cannot use rejects the request instead of ignoring the mismatch.

### HMAC authentication {#hmac-authentication}

HMAC auth methods (`hmac` / SHA-256 and `hmac-sha512` / SHA-512) verify that the webhook body was signed with a shared secret.

Configure:

1. **Auth header** — the request header that carries the signature (for example `X-Signature` or `X-Hub-Signature-256`).
2. **Auth secret** — a key-store **String** key (its value is the secret) or a login/password credential (its **password** is the secret).

The sender must put a **raw hexadecimal** HMAC digest of the raw request body into that header (no `sha256=` / `sha512=` prefix; the GitHub and Bitbucket methods expect that prefix, the HMAC methods do not). Semaphore compares it with `HMAC-SHA256` or `HMAC-SHA512` of the body using the configured secret.

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

A matcher is one condition on the incoming request: *this header equals that*, *this JSON field contains that*. Matchers are how one project alias can serve many integrations — GitHub sends every event to the same URL, and the matchers decide which integration reacts to which event.

A matcher only decides whether the integration runs. It never changes the task; that is what extractors are for.

Matchers are evaluated **only for calls that arrive through a project alias** (the **Use project alias** switch is on). A call to an integration's own alias starts it without looking at them.

### Matcher fields {#matcher-fields}

| Field | Meaning |
|---|---|
| **Name** | A label for the list. Free text, not used in matching |
| **Match on** | **Body** or **Header** — where the value comes from |
| **Body Data Format** | **JSON** or **String**, shown for **Body** only |
| **Key** | The header name, or the path to a field in the JSON body |
| **Comparison Method** | `==`, `!=`, or **Contains** |
| **Value** | The text the request value is compared with |

**Match on: Header** — **Key** is a header name, matched case-insensitively, so `X-GitHub-Event` and `x-github-event` are the same header. A header the request does not carry behaves like a missing value (see below). When a header appears several times, only the first value is compared.

**Match on: Body, JSON** — **Key** is a path into the parsed body, described in the next section. A body that is not valid JSON yields a missing value for every key.

**Match on: Body, String** — the whole raw body is the value and **Key** is ignored. The form still asks for a key because it is a required field; write a dash. This is the only way to match a body that is not JSON — combine it with **Contains**.

Both **Key** and **Value** are mandatory, so a matcher cannot be used to test for an empty value. To react to a field being absent, compare it with `!=` against a value it never has.

### JSON keys {#json-keys}

A key is a path through the JSON document. Levels are separated by dots, and an array element is addressed by its index in square brackets, counting from zero. Names are case-sensitive.

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

| Key | Value it points at |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | The whole array |
| `repository.url` | Nothing — the field does not exist |

The same syntax is used by the **Key** field of a value extractor.

### How a matcher compares values {#how-a-matcher-compares-values}

The value from the request is turned into text and compared with **Value** as text, so the **Value** field never needs quotes, brackets, or escaping.

- **Strings** are compared literally, and the comparison is case-sensitive: `Push` does not match `push`.
- **Numbers** are compared without their decimal part when they have none: `42` in the body matches the value `42`, not `42.0`. A fractional number is compared as written, so `1.5` matches `1.5`.
- **Booleans** match `true` and `false`.
- **A missing value** — an absent header, a JSON path that does not exist, a `null`, or a body that is not valid JSON — is compared as the literal text `<nil>`. This has a consequence worth remembering: `==` can never match a missing field, and `!=` always matches one.
- **Objects and arrays** have no readable text form; do not compare them. Point the key at a scalar field inside instead.
- **Contains** is a plain substring test, case-sensitive, with no wildcards and no regular expressions.

### Several matchers {#several-matchers}

An integration can have any number of matchers, and they are combined with **AND**: the integration runs only when every one of them matches. There is no way to express *or* within one integration — create a second integration on the same template for the alternative condition.

:::warning
An integration that uses the project alias and has **no matchers** never starts, because there is nothing that could match. Give it at least one matcher, or turn **Use project alias** off and call the integration's own alias.
:::

### Matcher examples {#matcher-examples}

| Goal | Match on | Format | Key | Method | Value |
|---|---|---|---|---|---|
| Only GitHub pushes | Header | — | `X-GitHub-Event` | `==` | `push` |
| Only pushes to `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| Any branch except `main` | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| Only tags | Body | JSON | `ref` | Contains | `refs/tags/` |
| Only merged GitLab merge requests | Body | JSON | `object_attributes.state` | `==` | `merged` |
| Ignore a bot's commits | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| Only published GitHub releases | Body | JSON | `action` | `==` | `published` |
| A plain-text alert mentioning a disk | Body | String | `-` | Contains | `disk` |

The first two rows together are the usual configuration for a deploy integration: the event type from the header, the branch from the body, both of which have to match.

## Value extractors {#value-extractors}

A value extractor copies one piece of the incoming request into the task that is about to start. That is how a webhook passes a branch, a commit hash, an author, or a release version to the automation it triggers.

Extractors always run, whichever kind of alias the call arrived through, and they run after the authentication and the matchers have passed.

### Extractor fields {#extractor-fields}

| Field | Meaning |
|---|---|
| **Name** | A label for the list. Free text |
| **Source of the Value** | **Body** or **Header** |
| **Data Type of Body** | **JSON** or **String**, shown for **Body** only |
| **Key** | The header name, or a [JSON key](#json-keys) — the same syntax matchers use |
| **Variable Usage** | **Variables** or **Task Params** — where the value is delivered |
| **Variable** | The name the value gets in the task |

With **Body** and **String** the whole raw body becomes the value and **Key** is ignored, exactly as in a matcher.

### What the variable receives {#what-the-variable-receives}

Unlike a matcher, an extractor does not flatten anything into text: a JSON value keeps its type, so a number stays a number and an object stays an object.

| What the request holds | What the variable gets |
|---|---|
| A header | Its text; an empty string when the header is absent |
| A JSON string, number, or boolean | The same value, with its type |
| A JSON object or array | The whole object or array, structure preserved |
| A JSON `null`, a path that does not exist, or a body that is not valid JSON | Nothing — the variable is **not set at all**, and whatever the template defines keeps its place |
| The body as **String** | The entire raw body as text |

The difference between "empty" and "not set" matters: a missing header gives the task an empty string, while a missing JSON field leaves the template's own value untouched.

### Variable usage: Variables {#variable-usage-variables}

The value joins the task's variables — the same set the **Variables** field of the New Task dialog fills. Semaphore passes them to the tool as extra variables (`--extra-vars` for Ansible, `-var` for Terraform), and they override a key of the same name in the template's [variable group](/user-guide/environment).

Name the variable exactly like a [survey variable](/user-guide/task-templates/survey-vars) of the template, and the webhook fills that survey variable instead of a person typing it.

### Variable usage: Task params {#variable-usage-task-params}

Task params are the built-in [prompts](/user-guide/task-templates/prompts) of the template rather than variables for the playbook. The extracted value is passed through unchanged, so its JSON type has to be the one the parameter expects — `true`, not `"true"`.

| Variable | Applies to | Expects |
|---|---|---|
| `git_branch` | Every app | The branch to check out. A leading `refs/heads/` is stripped, so GitHub's `ref` can be used as it comes |
| `limit`, `tags`, `skip_tags` | Ansible | A list of strings |
| `debug`, `dry_run`, `diff` | Ansible | `true` or `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` or `false` |

The template has to allow the override for it to take effect: **Allow override branch in task** for `git_branch`, and the matching prompt for `limit`, `tags`, and `skip_tags`. Without that permission the value is dropped and the task runs with the template's own setting.

### Extractor example: GitHub push {#extractor-example-github-push}

A GitHub push webhook sends a body that starts like this:

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

Four extractors turn it into a fully described task:

| Name | Source | Format | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

The task then checks out `main` (the `refs/heads/` prefix is removed for you) and runs with the variables `COMMIT`, `AUTHOR`, and `EVENT` available to the playbook. To see what a real call actually delivered, open it in the History tab and read its body next to your keys.

## Preset task parameters {#task-parameters}

Picking a template in the integration form reveals that template's own task options: a message, its survey variables, the inventory, the Git branch when the template allows overriding it, and the app's prompts. Whatever you set there becomes the default for every task this integration starts, so values that never change — an inventory, a fixed message — belong here rather than in an extractor.

Extractors are applied on top of these defaults: a variable or task parameter produced by an extractor replaces the preset value of the same name, and the preset survives when the extractor finds nothing.

## Workflow integrations <FeatureState feature="workflows" /> {#workflow-integrations}

An integration can start a [workflow](/user-guide/workflows) instead of a single template. Switch **Runs** to **Workflow** in the integration form and pick the workflow.

Extractors work the same way, with one difference: **Variable Usage** is ignored, and every extracted value is delivered as an answer to the workflow's survey under the **Variable** name. The workflow then validates those answers and passes them to its nodes through their bindings, so a value that no node is bound to never reaches a task. A successful call reports `X-Semaphore-Workflow-ID` and `X-Semaphore-Workflow-Run-ID` in addition to the task headers.

## Call history {#call-history}

The **History** tab of the Integrations page lists every call the project received through any of its aliases, newest first. It survives the alias, the integration, and the task it started, because it is kept per project rather than per integration.

| Column | Shows |
|---|---|
| **Time** | When the call arrived |
| **Integration** | The integration that handled it, with the alias below — click the alias to filter the list by it |
| **Source IP** | The address the call came from |
| **Method** | `GET` or `POST` |
| **Status** | What the integration did with the call, and why |
| **Task** | The task or workflow run that started |
| **Duration** | How long the integration took to handle the call |

Four statuses are possible:

| Status | Meaning |
|---|---|
| `ok` | A task or a workflow run started |
| `unauthorized` | The request failed the integration's auth method |
| `skipped` | The matchers did not match, or the alias started no integration at all |
| `error` | The start was attempted and failed — the template was gone, the survey rejected the values |

Clicking a row opens the call, including the request body as received (the first 64 KiB of it; the stored and the original size are both shown when it was longer). Request **headers are never stored**: they carry the signature or the token the sender authenticated with. The body of a call that failed authentication is not kept either, since anyone who knows the URL can produce one.

Filter the list by integration and by alias with the controls above the table, and page through it with the arrows below. The history has no expiry — it grows until the project is deleted.

## Troubleshooting {#troubleshooting}

| Symptom | What to check |
|---|---|
| No row appears in the History at all | The alias in the URL is wrong or deleted. A call to an integration's own alias while **Use project alias** is on is also recorded nowhere |
| `unauthorized` | The auth header name, the key in the key store, and whether the sender sends the signature with the `sha256=` prefix the method expects. GitHub and Bitbucket use their own headers regardless of **Auth header** |
| `skipped`, reason *No integration matched the alias* | The alias exists but no integration of the project has **Use project alias** turned on |
| `skipped`, reason *No matcher matched the request* | Open the call and compare its body with your matchers. Remember that a missing field never matches `==`, that keys are case-sensitive, and that **Contains** has no wildcards. An integration with no matchers at all is skipped for the same reason |
| The task runs but a variable is empty or absent | The JSON key does not match the payload (open the call to see the body), the value was `null`, or the **Variable** name differs from the survey variable it should fill |
| The branch is not overridden | The template needs **Allow override branch in task**; the extractor must write to the `git_branch` task parameter |
| Several tasks start from one call | Several integrations use the project alias and their matchers all match. Make the matchers narrower, or give the integrations their own aliases |
