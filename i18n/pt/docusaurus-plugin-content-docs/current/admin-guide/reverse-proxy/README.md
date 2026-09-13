---
title: Proxy reverso
description: Por que colocar o Semaphore atrás de um proxy reverso, o que toda configuração precisa tratar e os exemplos para nginx, Apache e Caddy.
---

# Proxy reverso

Um proxy reverso fica na frente do Semaphore e termina o TLS, de modo que
navegadores e runners falam com ele por HTTPS enquanto o próprio Semaphore escuta
em HTTP simples na interface local. O Semaphore também possui
[TLS integrado](/admin-guide/security/network#tls), portanto um proxy não é
estritamente necessário. Use um quando você já operar um proxy, precisar de um
certificado gerenciado em outro lugar, quiser o Semaphore em um subcaminho ou
servir vários serviços a partir de um único host.

## O que toda configuração precisa tratar {#what-every-configuration-must-handle}

Qualquer que seja o proxy escolhido, três coisas precisam estar corretas, ou
partes da interface quebram de maneiras difíceis de diagnosticar:

- **Upgrade de WebSocket em `/api/ws`.** Os logs de tarefa são transmitidos por um
  WebSocket. Sem os cabeçalhos de upgrade, a janela de log permanece vazia
  enquanto a tarefa é executada.
- **Um tempo limite de leitura maior que o intervalo de ping.** O Semaphore envia
  um ping para um WebSocket ocioso a cada dois minutos, aproximadamente. Um proxy
  que fecha conexões ociosas após 60 segundos desconecta a visualização de log
  repetidamente.
- **`web_host` definido com a URL pública.** O Semaphore monta as URLs de
  redirecionamento, define a flag `Secure` do cookie e verifica a origem da
  requisição a partir desse valor. Se ele não corresponder ao que o navegador
  usou, o login falha. Consulte
  [Configuração](/admin-guide/configuration).

## Nesta seção {#in-this-section}

| Página | O que aborda |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | Um bloco `server` com TLS, o upgrade de WebSocket e os cabeçalhos encaminhados. |
| [Apache](/admin-guide/reverse-proxy/apache) | Um virtual host usando `mod_proxy` e `mod_proxy_wstunnel`. |
| [Caddy](/admin-guide/reverse-proxy/caddy) | Um Caddyfile mínimo com certificados automáticos. |

## Por onde começar {#where-to-start}

Escolha o proxy que você já opera. Se não tiver preferência nem um proxy
existente, o [Caddy](/admin-guide/reverse-proxy/caddy) é o caminho mais curto:
ele obtém e renova os certificados sozinho.

Para proteção além do TLS, consulte
[Segurança de rede](/admin-guide/security/network).
