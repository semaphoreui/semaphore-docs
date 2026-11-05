# Microsoft Teams

Las notificaciones de Microsoft Teams envían los resultados de las tareas de Semaphore directamente a un canal de Teams. Cada mensaje es una tarjeta con el nombre de la plantilla, el estado de la tarea, el usuario que la inició y un botón que abre la tarea en Semaphore.

Para configurar las notificaciones de Teams, necesita una URL de webhook que conecte Semaphore con el canal. En Teams, esta URL se crea con la aplicación **Workflows**, que funciona con Microsoft Power Automate y no tiene relación con los Workflows de Semaphore.

:::warning
En mayo de 2026, Microsoft retiró los conectores de Office 365 en Teams, incluido el antiguo conector **Incoming Webhook**. Una URL de webhook en `webhook.office.com` ya no entrega mensajes. Cree una URL nueva con la aplicación Workflows como se describe a continuación.
:::

## Crear el webhook de Teams {#creating-teams-webhook}

### Paso 1. Abrir Workflows para el canal {#step-1-open-workflows-for-the-channel}

1. En Microsoft Teams, vaya al equipo y al canal que deben recibir las notificaciones.
2. Haga clic en **More options (…)** junto al nombre del canal.
3. Seleccione **Workflows**.

---

### Paso 2. Crear un flujo a partir de la plantilla {#step-2-create-a-workflow-from-the-template}

1. Busque la plantilla **Send webhook alerts to a channel** y selecciónela.
2. Compruebe los parámetros del flujo: el **Team** y el **Channel** en los que se publican los mensajes.
3. Haga clic en **Save**.

Semaphore envía la solicitud sin cabeceras de autenticación, así que use esta plantilla y no sus variantes *from specific people* o *from people in an org*.

---

### Paso 3. Copiar la URL del webhook {#step-3-copy-the-webhook-url}

1. Una vez creado el flujo, Teams muestra su enlace de webhook. Cópielo.
2. La URL es larga y tiene un aspecto similar a:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

El parámetro `sig` es la única protección del webhook: cualquiera que tenga la URL puede publicar en el canal. Trate la URL completa como un secreto.

---

### Paso 4. Probar el webhook {#step-4-test-your-webhook}

Use `curl` para probarlo:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

El cuerpo de la solicitud tiene la misma estructura que los mensajes que envía Semaphore: un mensaje con un adjunto de tipo Adaptive Card. Si todo está configurado correctamente, la respuesta es `202 Accepted` y la tarjeta aparece en el canal de Teams seleccionado en pocos segundos.


## Configuración de Semaphore {#semaphore-configuration}

Una vez que tenga la URL del webhook de Teams, puede habilitar las notificaciones de Teams mediante el archivo de configuración o variables de entorno. Reinicie Semaphore para aplicar el cambio.

### Método 1: Archivo de configuración {#method-1-configuration-file}

Añada los siguientes ajustes a su archivo de configuración de Semaphore:

- `microsoft_teams_alert`: establézcalo en `true` para habilitar las notificaciones de Teams
- `microsoft_teams_url`: la URL del webhook obtenida en el paso anterior

Ejemplo de `config.json`:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Método 2: Variables de entorno {#method-2-environment-variables}

Como alternativa, puede usar variables de entorno. Este método resulta especialmente útil en despliegues en contenedores o cuando desea mantener la URL del webhook fuera del archivo de configuración.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
La URL contiene los caracteres `&` y `%`. Enciérrela entre comillas simples cuando defina la variable en un shell. En una unidad de systemd, colóquela en un `EnvironmentFile` en lugar de una línea `Environment=`, donde `%` inicia un especificador.
:::

## Habilitar las notificaciones para un proyecto {#enabling-notifications-for-a-project}

Los ajustes anteriores activan el canal para todo el servidor, y todos los mensajes van al único canal al que pertenece el webhook. Un proyecto los recibe solo cuando usa los canales del servidor, y una plantilla de tarea puede suprimir los mensajes de éxito o de error. Consulte [Cómo funciona la entrega](/admin-guide/notifications#how-delivery-works), donde también se explica cómo enviar un mensaje de prueba sin ejecutar una tarea.

Teams recibe una notificación cuando una tarea finaliza correctamente, falla o queda a la espera de confirmación.

Para enviar las notificaciones de un proyecto a otro canal de Teams, cree una [alerta del proyecto](/user-guide/alerts#project-alerts) del tipo Microsoft Teams con su propia URL de webhook.

## Contenido del mensaje {#message-content}

| Elemento de la tarjeta | Valor |
|---|---|
| Encabezado | `Ansible Task Template Execution by:` y el nombre del usuario que inició la tarea, o `—` si la tarea no la inició un usuario. |
| **Task** | Nombre de la plantilla de tarea. |
| **Status** | Estado de la tarea con un icono, por ejemplo `✅ SUCCESS`, `❌ ERROR` o `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Número de la tarea. |
| Botón **Task URL** | Abre la tarea en Semaphore. El enlace se construye a partir de `web_host`, así que establezca esta opción en la dirección con la que los usuarios abren Semaphore. |

## Solución de problemas {#troubleshooting}

La solicitud la envía el servidor de Semaphore, no un runner, y el resultado se escribe en el registro de la tarea. Semaphore envía cada mensaje una sola vez y no lo reintenta.

| Registro de la tarea | Qué comprobar |
|---|---|
| No hay ninguna línea sobre Microsoft Teams | No se intentó enviar el mensaje. Compruebe que `microsoft_teams_alert` sea `true`, que el proyecto use los canales del servidor y que la plantilla no suprima la notificación. |
| `Can't send microsoft teams alert! Error: …` | El servidor no pudo conectar con el host del webhook. Permita el tráfico HTTPS saliente desde el servidor hacia el host de la URL. Si hay un proxy, defina `HTTPS_PROXY` para el servidor de Semaphore; consulte [Ejecución detrás de un proxy corporativo](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | El webhook rechazó la solicitud. Compruebe que la URL se copió completa, incluido el parámetro `sig`, y que el flujo está activado y no se ha eliminado. Microsoft limita cada webhook a cuatro solicitudes por segundo. |
| `Sent successfully microsoft teams alert`, pero no aparece ninguna tarjeta en el canal | El flujo aceptó la solicitud y falló después. Abra el flujo en la aplicación **Workflows** y revise su historial de ejecuciones. Un flujo pertenece al usuario que lo creó y deja de funcionar cuando ese usuario abandona la organización o pierde el acceso al canal, así que añada copropietarios al flujo. |
