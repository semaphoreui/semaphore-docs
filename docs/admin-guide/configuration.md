---
title: Configuration
description: "How Semaphore reads its configuration: the file, environment variables, their precedence, and setting a public URL."
---

# Configuration

Semaphore can be configured using several methods:

* [Online configurator](https://semaphoreui.com/install) &mdash; web interface for generating configuration online.
* [Configuration file](/admin-guide/configuration/config-file) &mdash; the primary and most flexible way to configure Semaphore.
* [Environment variables](/admin-guide/configuration/env-vars) &mdash; useful for containerized or cloud-native deployments.


## Configuration options {#configuration-options}

Every option, with its environment variable, type, and default, is listed in the
[Configuration options reference](/reference/configuration). That page is generated
from the Semaphore source, so it always matches the release you are running.

Values are resolved in one order: an environment variable wins over the
configuration file, and the built-in default applies only when neither is set.

## Frequently asked questions {#frequently-asked-questions}

### 1. How to configure a public URL for Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

If you use nginx or other web server before Semaphore, you should provide configuration option `web_host`.

For example you configured NGINX on the server which proxies queries to Semaphore.

Server address `https://example.com` and you proxies all queries `https://example.com/semaphore` to Semaphore.

Your `web_host` will be `https://example.com/semaphore`.
