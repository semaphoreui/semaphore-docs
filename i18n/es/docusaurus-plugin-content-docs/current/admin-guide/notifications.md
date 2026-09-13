---
title: Notificaciones
description: Cómo entrega Semaphore las alertas de las tareas, los canales que admite y los dos interruptores que deben estar activados para que se envíe algo.
---

# Notificaciones

Semaphore comunica los resultados de las tareas al chat y al correo electrónico. Un
canal se configura una sola vez en el servidor, en `config.json` o mediante
variables de entorno, y a partir de ahí se aplica a todos los proyectos. Qué tareas
generan una alerta se decide por proyecto y por plantilla en la interfaz web.

## Cómo funciona la entrega {#how-delivery-works}

Tres ajustes deciden si se envía un mensaje, y los tres deben permitirlo:

1. **El canal está configurado en el servidor.** Cada proveedor tiene sus propias
   claves en `config.json`. Consulte más abajo la página de ese proveedor.
2. **El proyecto permite las alertas.** *Allow alerts for this project*, en los
   [ajustes del proyecto](/user-guide/projects/settings), es el interruptor
   principal. Si está desactivado, ningún canal envía nada sobre ese proyecto.
3. **La plantilla las solicita.** Una plantilla de tareas elige si alertar en caso de
   éxito, en caso de error o no hacerlo nunca; consulte [Plantillas de tareas](/user-guide/task-templates).

Use **Test alerts** en los ajustes del proyecto para enviar un mensaje de prueba por
todos los canales configurados sin ejecutar ninguna tarea.

## Canales {#channels}

| Canal | Página |
|---|---|
| Correo electrónico (SMTP) | [Correo electrónico](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Pueden habilitarse varios canales a la vez; cada uno de ellos recibe todas las
alertas que superan las tres comprobaciones anteriores.

## Excepciones por proyecto {#per-project-overrides}

Telegram admite un chat por proyecto: defina **Telegram Chat ID** en los
[ajustes del proyecto](/user-guide/projects/settings) para dirigir las alertas de un
proyecto a un chat distinto del configurado para todo el servidor. Los demás canales
usan la configuración del servidor para todos los proyectos.

## Por dónde empezar {#where-to-start}

Configure primero un canal, active *Allow alerts for this project* y pulse
**Test alerts**. Cuando llegue el mensaje de prueba, habilite las alertas en las
plantillas que le interesen.
