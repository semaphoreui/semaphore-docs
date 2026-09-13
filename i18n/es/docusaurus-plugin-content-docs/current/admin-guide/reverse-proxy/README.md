---
title: Proxy inverso
description: Por qué conviene poner Semaphore detrás de un proxy inverso, qué debe resolver toda configuración y los ejemplos de nginx, Apache y Caddy.
---

# Proxy inverso

Un proxy inverso se sitúa delante de Semaphore y termina TLS, de modo que los
navegadores y los runners hablan con él por HTTPS mientras que Semaphore escucha en
HTTP sin cifrar en la interfaz local. Semaphore también dispone de
[TLS integrado](/admin-guide/security/network#tls), así que el proxy no es
estrictamente necesario. Úselo cuando ya opere un proxy, necesite un certificado
gestionado en otro lugar, quiera servir Semaphore en una subruta o publique varios
servicios desde un mismo host.

## Qué debe resolver toda configuración {#what-every-configuration-must-handle}

Sea cual sea el proxy que elija, tres cosas tienen que estar bien o algunas partes
de la interfaz fallarán de formas difíciles de diagnosticar:

- **La actualización a WebSocket en `/api/ws`.** Los registros de las tareas se
  transmiten por un WebSocket. Sin las cabeceras de actualización, la ventana del
  registro permanece vacía mientras la tarea se ejecuta.
- **Un tiempo de espera de lectura mayor que el intervalo de ping.** Semaphore hace
  ping a un WebSocket inactivo aproximadamente cada dos minutos. Un proxy que cierra
  las conexiones inactivas a los 60 segundos desconecta la vista del registro una y
  otra vez.
- **`web_host` con la URL pública.** A partir de este valor, Semaphore construye las
  URL de redirección, establece el atributo `Secure` de la cookie y comprueba el
  origen de la petición. Si no coincide con lo que ha usado el navegador, el inicio
  de sesión falla. Consulte
  [Configuración](/admin-guide/configuration).

## En esta sección {#in-this-section}

| Página | Qué cubre |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | Un bloque server con TLS, la actualización a WebSocket y las cabeceras reenviadas. |
| [Apache](/admin-guide/reverse-proxy/apache) | Un host virtual que usa `mod_proxy` y `mod_proxy_wstunnel`. |
| [Caddy](/admin-guide/reverse-proxy/caddy) | Un Caddyfile mínimo con certificados automáticos. |

## Por dónde empezar {#where-to-start}

Elija el proxy que ya tenga en funcionamiento. Si no tiene preferencia ni un proxy
existente, [Caddy](/admin-guide/reverse-proxy/caddy) es el camino más corto: obtiene
y renueva los certificados por su cuenta.

Para un refuerzo más allá de TLS, consulte [Seguridad de red](/admin-guide/security/network).
