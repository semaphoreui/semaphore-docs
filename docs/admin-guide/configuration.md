---
title: Configuration
description: Choose how to configure Semaphore, understand setting precedence, and set the public URL users connect to.
---

# Configuration

Semaphore reads its settings from a configuration file and environment variables.
The online configurator helps you prepare either format by filling in a form.
Choose the workflow that fits how you run your server.

## In this section {#in-this-section}

| Method | Use it when |
|---|---|
| [Online configurator](/admin-guide/configuration/online) | You want a form that generates configuration and startup commands for a binary or Docker installation. |
| [Configuration file](/admin-guide/configuration/config-file) | You want to keep server settings in a `config.json` file. |
| [Environment variables](/admin-guide/configuration/env-vars) | You manage settings through Docker, a service definition, or your deployment tools. |

## Configuration options {#configuration-options}

An environment variable overrides the corresponding value in the configuration
file. The built-in default applies when neither is set. If editing the file has no
effect, check the environment passed to the Semaphore process.

The [Configuration options reference](/reference/configuration) lists option names,
environment variables, types, and defaults. It is generated from the Semaphore
source; use documentation for your release when configuring an older server.

<span id="frequently-asked-questions" />

## Public URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

Set `web_host` (or `SEMAPHORE_WEB_ROOT`) to the address users open in their browser.
For example, if a reverse proxy serves Semaphore at
`https://example.com/semaphore`, use that full address, including `/semaphore`.
This is the public address, not the internal address the proxy connects to.

## Where to start {#where-to-start}

For a new server, open the online configurator guide above and follow the binary
or Docker steps. For an existing server, update the file or environment variables
used by its service, then restart Semaphore to apply the changes.
