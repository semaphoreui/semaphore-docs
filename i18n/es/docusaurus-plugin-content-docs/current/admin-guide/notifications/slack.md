# Slack

Las notificaciones de Slack permiten recibir actualizaciones en tiempo real sobre sus flujos de trabajo de Semaphore directamente en sus canales de Slack. Esta integración ayuda a los equipos a mantenerse informados sobre el estado de las compilaciones, los resultados de los despliegues y otros eventos importantes sin tener que consultar constantemente el panel de Semaphore.

Para configurar las notificaciones de Slack, necesita crear una URL de webhook que conecte Semaphore con el canal de Slack deseado. Este webhook actúa como un puente de comunicación seguro entre ambas plataformas.

## Crear el webhook de Slack {#creating-slack-webhook}

### Paso 1. Abrir la configuración de la API de Slack {#step-1-open-slack-api-settings}

1. Vaya a [https://api.slack.com/apps](https://api.slack.com/apps).
2. Haga clic en **Create New App** → elija **From Scratch**.
3. Asigne un nombre a su aplicación (p. ej., `Semaphore Bot`) y seleccione su **espacio de trabajo de Slack**.

---

### Paso 2. Habilitar los webhooks entrantes {#step-2-enable-incoming-webhooks}

1. Dentro de la configuración de la aplicación, vaya a **Features → Incoming Webhooks**.
2. Cambie **Activate Incoming Webhooks** a **On**.

---

### Paso 3. Crear una URL de webhook {#step-3-create-a-webhook-url}

1. Haga clic en **Add New Webhook to Workspace**.
2. Seleccione el canal al que deben enviarse los mensajes.
3. Haga clic en **Allow**.
4. Verá una **Webhook URL** similar a:

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Paso 4. Probar el webhook {#step-4-test-your-webhook}

Use `curl` para probarlo:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

Si todo está configurado correctamente, verá el mensaje en el canal de Slack seleccionado.


## Configuración de Semaphore {#semaphore-configuration}

Una vez que tenga la URL del webhook de Slack, puede configurar Semaphore para enviar notificaciones de varias maneras:

Puede habilitar las notificaciones de Slack mediante archivos de configuración o variables de entorno.

### Método 1: Archivo de configuración {#method-1-configuration-file}

Añada los siguientes ajustes a su archivo de configuración de Semaphore:

- `slack_alert`: establézcalo en `true` para habilitar las notificaciones de Slack
- `slack_url`: la URL del webhook obtenida en el paso anterior

Ejemplo de `config.json`:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### Método 2: Variables de entorno {#method-2-environment-variables}

Como alternativa, puede usar variables de entorno para configurar las notificaciones de Slack. Este método resulta especialmente útil en despliegues en contenedores o cuando desea mantener la información sensible separada de los archivos de configuración.

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
