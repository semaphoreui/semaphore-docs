---
title: Notificaciones
description: Cómo Semaphore entrega las alertas de tareas, los canales que admite y cómo se relacionan los canales del servidor con las alertas por proyecto.
---

# Notificaciones

Semaphore informa de los resultados de las tareas por chat y correo electrónico de dos maneras:

- **Los canales del servidor** se configuran una vez en el servidor, en `config.json` o mediante
  variables de entorno, y están disponibles para todos los proyectos. Esta página los describe.
- **Las alertas del proyecto** son destinos con nombre que los miembros del proyecto crean en la
  pestaña [Alertas](/user-guide/alerts) del proyecto, con su propio chat, webhook o
  destinatarios, y que se vinculan a plantillas y programaciones.

## Cómo funciona la entrega {#how-delivery-works}

Para un canal del servidor, tres ajustes deciden si se envía un mensaje, y los tres deben
permitirlo:

1. **El canal está configurado en el servidor.** Cada proveedor tiene sus propias claves en
   `config.json`. Consulte la página de ese proveedor más abajo.
2. **El proyecto usa los canales del servidor.** *Enviar alertas de este proyecto a los canales
   del servidor* en la pestaña [Alertas](/user-guide/alerts#server-channels) del proyecto
   es el interruptor principal. Si está apagado, los canales del servidor no envían nada sobre
   ese proyecto. Las alertas del proyecto no se ven afectadas por este interruptor.
3. **La plantilla lo solicita.** Una plantilla que usa los *valores por defecto del proyecto*
   envía a los canales del servidor; una plantilla con una lista de alertas personalizada no.
   Las plantillas también pueden suprimir las notificaciones de éxito o fallo, consulte
   [Plantillas de tareas](/user-guide/task-templates).

Los canales de chat informan de éxitos, fallos y tareas esperando confirmación; el correo solo
informa de fallos. Las alertas del proyecto pueden anular los eventos por destino.

Use **Probar todo** en la pestaña Alertas para enviar un mensaje de prueba por cada canal del
servidor y cada alerta del proyecto habilitada sin ejecutar una tarea.

## Canales {#channels}

| Canal | Página |
|---|---|
| Correo electrónico (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Se pueden habilitar varios canales a la vez; cada uno recibe todas las alertas que superan las
tres comprobaciones anteriores. Los mismos proveedores están disponibles para las alertas del
proyecto; las alertas de correo y Telegram reutilizan el servidor SMTP y el token del bot de la
configuración del servidor, y una alerta de Gotify sin URL y token propios reutiliza el par
global.

## Anulaciones por proyecto {#per-project-overrides}

Telegram admite un chat por proyecto: establezca **Telegram Chat ID** en la pestaña
[Alertas](/user-guide/alerts#server-channels) del proyecto para dirigir los mensajes
de canal del servidor de un proyecto a un chat distinto del global. Para cualquier otro destino
por proyecto cree una [alerta del proyecto](/user-guide/alerts#project-alerts).

## Por dónde empezar {#where-to-start}

Configure primero un canal, abra la pestaña Alertas del proyecto, active *Enviar alertas de este
proyecto a los canales del servidor* y pulse **Probar todo**. Cuando llegue un mensaje de
prueba, ajuste las plantillas que importen.
