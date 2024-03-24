# Integrations

Integrations allow establishing interaction between Semaphore and external services, such as GitHub and GitLab.

Using integration, you can trigger a specific template by calling a special endpoint (alias), for which you can configure one of the following authentication methods:
* GitHub Webhooks
* Token
* HMAC
* No authentication

The alias represents a URL in the following format: `/api/integrations/<random_string>`. Supports `GET` and `POST` requests.

## Matchers


## Value Extractors



![](<../.gitbook/assets/integrations_1.jpg>)

