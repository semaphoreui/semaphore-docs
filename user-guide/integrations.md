# Integrations

Integrations allow establishing interaction between Semaphore and external services, such as GitHub and GitLab.

![](<../.gitbook/assets/integrations_1.jpg>)

Using integration, you can trigger a specific template by calling a special endpoint (alias), for which you can configure one of the following authentication methods:
* GitHub Webhooks
* Token
* HMAC
* No authentication

The alias represents a URL in the following format: `/api/integrations/<random_string>`. Supports `GET` and `POST` requests.

## Matchers

With matchers, you can define parameters of the incoming request. When these parameters match, the template will be invoked.

## Value Extractors

With an extractor, you can extract the necessary data from the incoming request and pass it to the task as environment variables.