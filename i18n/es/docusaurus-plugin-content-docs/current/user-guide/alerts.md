---
title: Alertas
description: La pestaña Alertas de un proyecto, donde se activan los canales del servidor y se crean, prueban y vinculan a plantillas y programaciones las alertas con nombre del proyecto.
---

# Alertas

La pestaña **Alertas** de un proyecto decide a dónde se informan los resultados de las tareas. Tiene dos partes:

- **Canales del servidor** son los proveedores de notificación que un administrador configuró en el servidor en `config.json`, consulte [Notificaciones](/admin-guide/notifications). Son compartidos por todos los proyectos y cada proyecto decide si los usa.
- **Alertas del proyecto** son destinos con nombre que pertenecen al proyecto: un chat de Telegram, un webhook de Slack, una lista de direcciones de correo, etc. Las plantillas y las programaciones eligen qué alertas envían.

Ambas partes pueden usarse a la vez.

![Pestaña Alertas de un proyecto](/assets/alerts-page.webp)

## Canales del servidor {#server-channels}

La tarjeta de la parte superior de la página muestra los canales configurados en el servidor. Active **Enviar alertas de este proyecto a los canales del servidor** para recibir por ellos todos los resultados de tareas de este proyecto. Es el mismo interruptor que en versiones anteriores se llamaba **Allow alerts for this project** en la configuración del proyecto.

Telegram aparece en cuanto el servidor tiene un token de bot, en gris hasta que se conozca un chat. Pulse el chip para introducir el **Telegram Chat ID** de este proyecto; anula el chat global y es obligatorio cuando el servidor no tiene ninguno.

Los canales del servidor informan de todos los estados relevantes: éxito, fallo y *esperando confirmación*. El correo electrónico solo informa de fallos. Una plantilla aún puede suprimir las notificaciones de éxito o de fallo, consulte [Alertas de plantilla](#template-alerts).

![Tarjeta de canales del servidor con el chat ID de Telegram abierto](/assets/alerts-server-channels.webp)

## Alertas del proyecto {#project-alerts}

![Menú Nueva alerta](/assets/alerts-new-menu.webp)

Pulse **Nueva alerta** para crear un destino. Cada alerta tiene:

| Campo | Descripción |
|---|---|
| **Nombre** | Se muestra en los formularios de plantillas y programaciones. Único dentro del proyecto. |
| **Tipo** | El canal: Telegram, Slack, Email, Microsoft Teams, Rocket.Chat, DingTalk o Gotify. El formulario muestra los campos de destino que necesita el canal. |
| **Destino** | ID de chat y tema de foro opcional para Telegram; URL del webhook para Slack, Teams, Rocket.Chat y DingTalk; URL del servidor para Gotify; destinatarios para correo (déjelo vacío para avisar a los miembros del proyecto que activaron las alertas en su perfil). |
| **Secreto** | Telegram, Gotify y correo necesitan un secreto: el token del bot, el token de aplicación, las credenciales SMTP. *Usar la configuración del servidor* lo toma de la configuración del servidor; *Usar el mío* lo toma de una clave de acceso del Almacén de claves (tipo *Token secreto* para tokens, *Inicio de sesión con contraseña* para SMTP). Una alerta de correo con credenciales propias también puede definir su propio host SMTP, puerto, remitente y cifrado. |
| **Enviar en** | Los eventos que escucha la alerta: éxito, fallo, esperando confirmación. Las alertas nuevas empiezan con los valores por defecto del canal. |
| **Predeterminada del proyecto** | Marca la alerta como una de las predeterminadas del proyecto. Toda plantilla que use los valores por defecto del proyecto la envía. |
| **Habilitada** | Una alerta deshabilitada nunca se envía y no es predeterminada del proyecto. |
| **Plantilla del mensaje** | Plantilla Go opcional para el cuerpo del mensaje. Deje el texto integrado para seguir las futuras actualizaciones del servidor. |

Los secretos nunca se guardan en la alerta: viven cifrados en el Almacén de claves y la clave no se puede eliminar mientras una alerta la use. Si el servidor no tiene configurado token del bot, servidor SMTP o par de Gotify, el formulario solo ofrece *Usar el mío*. Las URL de webhook deben usar `http` o `https` y no pueden apuntar al propio servidor.

Use **Enviar mensaje de prueba** en la lista para comprobar una alerta y **Probar todo** en la barra de herramientas para enviar una prueba a todos los destinos habilitados del proyecto, incluidos los canales del servidor.

Una alerta vinculada a una plantilla o a una programación no se puede eliminar. El diálogo muestra los objetos que la usan.

![Alerta de Telegram con token de bot propio](/assets/alert-form-telegram.webp)

![Alerta de correo con servidor SMTP propio](/assets/alert-form-email.webp)

### Plantillas de mensaje {#message-templates}

El cuerpo es una `text/template` de Go (`html/template` para correo). Los campos disponibles son:

| Campo | Valor |
|---|---|
| `.Name` | Nombre de la plantilla |
| `.Author` | Nombre del usuario que inició la tarea, o `—` |
| `.Project.Name`, `.Project.ID` | El proyecto |
| `.Playbook` | Playbook o script de la plantilla |
| `.ScheduleName` | Nombre de la programación que inició la tarea, si existe |
| `.Task.ID`, `.Task.URL` | Número de la tarea y enlace a su registro |
| `.Task.Result` | Estado con icono, por ejemplo `✅ SUCCESS` |
| `.Task.Desc` | Mensaje introducido al iniciar la tarea |
| `.Task.Version` | Versión de compilación, o la versión entrante para tareas de despliegue |
| `.Task.Duration` | Tiempo de ejecución, vacío hasta que la tarea empieza |
| `.Task.Trigger` | `manual`, `schedule`, `integration` o `api` |
| `.Color` | Color del adjunto para Slack y Rocket.Chat |

Para los canales de chat el texto renderizado debe ser el documento JSON que espera el mensajero; la plantilla integrada es un buen punto de partida. Los cuerpos de Telegram son texto plano con formato HTML; Semaphore añade el chat y el tema.

## Alertas de plantilla {#template-alerts}

En la sección **Avanzado** de una plantilla de tarea, **Alertas** elige entre:

- **Usar los valores por defecto del proyecto** — los canales del servidor, cuando están activados para el proyecto, más las alertas marcadas como predeterminadas del proyecto. Las plantillas existentes conservan este comportamiento tras una actualización.
- **Usar un conjunto personalizado de alertas** — solo las alertas seleccionadas. Una selección vacía significa que la plantilla no envía nada.

**Suprimir notificaciones de éxito** y **Suprimir notificaciones de error** se aplican a ambas opciones. Las notificaciones de una tarea esperando confirmación nunca se suprimen.

![Plantilla de tarea con un conjunto personalizado de alertas](/assets/template-form-alerts.webp)

## Alertas de programación {#schedule-alerts}

Una programación puede **usar las alertas de la plantilla** o **usar un conjunto distinto de alertas**. La segunda opción sustituye por completo la selección de la plantilla para las tareas iniciadas por esa programación, de modo que un trabajo nocturno puede informar a un canal de guardia mientras las ejecuciones manuales permanecen en silencio.

![Programación con su propio conjunto de alertas](/assets/schedule-form-alerts.webp)

## Cómo se enruta una tarea {#how-a-task-is-routed}

Los destinos de una tarea se fijan al crearla. Cambiar una alerta, una plantilla o una programación mientras una tarea se ejecuta no cambia a dónde informa esa tarea. Cada entrega se registra por tarea, destino y evento, por lo que en una instalación de alta disponibilidad solo un nodo del servidor envía cada mensaje.

## Copias de seguridad {#backups}

Las alertas del proyecto forman parte de la [copia de seguridad del proyecto](./projects/settings#danger-zone). Las plantillas y programaciones se refieren a ellas por nombre, así que un proyecto restaurado conserva sus vínculos. Las alertas se refieren a su clave de acceso por nombre; como con cualquier clave, el valor secreto no se exporta.
