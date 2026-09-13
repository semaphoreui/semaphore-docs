---
title: Integrations
description: Triggering templates from incoming webhooks with aliases, authentication methods, matchers, and value extractors.
---

# Integrations

Integrations allow establishing interaction between Semaphore and external services, such as GitHub and GitLab.

![Integrations list](/assets/integrations-list.webp)

The project webhook URL is shown above the list. Every integration has a name and the template it starts; click an integration to configure its matchers and value extractors.

![Integration details](/assets/integration-detail.webp)

Using integration, you can trigger a specific template by calling a special endpoint (alias), for which you can configure one of the following authentication methods:
* GitHub Webhooks
* Token
* HMAC
* No authentication

The alias represents a URL in the following format: `/api/integrations/<random_string>`. Supports `GET` and `POST` requests.

## Matchers {#matchers}

With matchers, you can define parameters of the incoming request. When these parameters match, the template will be invoked.

## Value Extractors {#value-extractors}

With an extractor, you can take data from the request header or body (JSON field or string) and pass it to the task. Each extracted value has a **Variable type**:

* **Environment**: the value is added to the task's environment variables, overriding a variable of the same name from the variable group.
* **Task parameter**: the value becomes a task parameter, for example a survey variable or a prompt.

## Task parameters {#task-parameters}

Integrations can trigger tasks with parameters. Use value extractors to build a JSON payload for task parameters and configure the template to accept prompted values.

## Notes on aliases and matchers {#notes-on-aliases-and-matchers}

A project alias (the URL above the integration list) is shared by all integrations of the project: Semaphore checks the matchers of every integration and starts the templates whose matchers match. An integration can also have its own alias; requests to it start that integration without evaluating matchers. Prefer token/HMAC authentication as needed and pass parameters via extractors.
