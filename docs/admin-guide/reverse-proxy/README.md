---
title: Reverse proxy
description: Why to put Semaphore behind a reverse proxy, what every configuration must handle, and the nginx, Apache, and Caddy examples.
---

# Reverse proxy

A reverse proxy sits in front of Semaphore and terminates TLS, so browsers and
runners talk to it over HTTPS while Semaphore itself listens on plain HTTP on the
local interface. Semaphore also has [built-in TLS](/admin-guide/security/network#tls),
so a proxy is not strictly required. Use one when you already run a proxy, need a
certificate managed elsewhere, want Semaphore on a sub-path, or serve several
services from one host.

## What every configuration must handle {#what-every-configuration-must-handle}

Whichever proxy you choose, three things have to be right or parts of the
interface break in ways that are hard to diagnose:

- **WebSocket upgrade on `/api/ws`.** Task logs stream over a WebSocket. Without
  the upgrade headers the log window stays empty while the task runs.
- **A read timeout longer than the ping interval.** Semaphore pings an idle
  WebSocket roughly every two minutes. A proxy that closes idle connections after
  60 seconds disconnects the log view repeatedly.
- **`web_host` set to the public URL.** Semaphore builds redirect URLs, sets the
  cookie `Secure` flag, and checks the request origin from this value. If it does
  not match what the browser used, sign-in fails. See
  [Configuration](/admin-guide/configuration).

## In this section {#in-this-section}

| Page | What it covers |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | A server block with TLS, the WebSocket upgrade, and forwarded headers. |
| [Apache](/admin-guide/reverse-proxy/apache) | A virtual host using `mod_proxy` and `mod_proxy_wstunnel`. |
| [Caddy](/admin-guide/reverse-proxy/caddy) | A minimal Caddyfile with automatic certificates. |

## Where to start {#where-to-start}

Pick the proxy you already operate. If you have no preference and no existing
proxy, [Caddy](/admin-guide/reverse-proxy/caddy) is the shortest path: it obtains
and renews certificates on its own.

For hardening beyond TLS, see [Network security](/admin-guide/security/network).
