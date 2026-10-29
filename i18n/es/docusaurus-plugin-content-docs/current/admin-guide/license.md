---
title: "Activación de la licencia"
---

# Activación de la licencia <Pro />

Las funciones de Semaphore Pro y Enterprise se habilitan con una clave de licencia. Puede activar la licencia desde la interfaz web o indicar la clave en la configuración del servidor para despliegues automatizados.

## Antes de empezar {#before-you-start}

- No necesita reinstalar Semaphore UI ni cambiar a una compilación distinta para activar Pro o Enterprise. Su versión actual de Semaphore UI puede activarse con una clave de licencia. Actualice a la última versión si desea acceder a las funciones más recientes de Pro o Enterprise.
- Inicie sesión con una cuenta de administrador.
- Tenga a mano su clave de licencia. Puede encontrarla en el correo electrónico de compra o en el [portal de Semaphore UI](https://portal.semaphoreui.com/auth/login).

## Activación desde la interfaz web {#activate-from-the-web-ui}

1. Inicie sesión en Semaphore UI como administrador.

![Pantalla de inicio de sesión de Semaphore UI](/assets/subscription-login-screen.png)

2. Abra el menú de administración desde el área de usuario, en la esquina inferior izquierda.

![Acceso al menú de administración en la esquina inferior izquierda](/assets/subscription-admin-menu-trigger.png)

3. Seleccione **Actualizar a PRO o EE**.

![Menú de administración con la opción Actualizar a PRO o EE](/assets/subscription-upgrade-menu-item.png)

4. Pegue su clave de licencia en el cuadro de diálogo de activación y haga clic en **ACTIVAR NUEVA CLAVE**.

![Cuadro de diálogo de activación de Semaphore Pro](/assets/subscription-activation-dialog.png)

Tras una activación correcta, Semaphore UI muestra los detalles de su licencia actual en el cuadro de diálogo **Suscripción y facturación**.

![Cuadro de diálogo de Suscripción y facturación tras una activación correcta](/assets/subscription-activation-success.png)

## Activación desde la configuración {#activate-from-configuration}

Para despliegues con Docker, Kubernetes, systemd u otros despliegues automatizados, indique la clave de licencia en la configuración del servidor en lugar de introducirla en la interfaz. Los nombres de las opciones de configuración utilizan `subscription.*`.

En `config.json`:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

O como variable de entorno:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

También puede guardar la clave en un archivo:

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

o bien:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

Cuando la clave de licencia se gestiona desde la configuración, Semaphore UI desactiva los controles de edición y activación del cuadro de diálogo **Suscripción y facturación**. Esto se aplica tanto a `subscription.key` como a `subscription.key_file`, ya que el servidor lee el archivo de la clave y lo carga como clave de licencia en tiempo de ejecución durante el arranque.

## Acceder al servidor de licencias a través de un proxy {#reach-the-license-server-through-a-proxy}

La activación de una clave, la renovación del token de licencia y la renovación diaria del token llaman al Portal de Semaphore UI en `subscription.server_url`. En una red donde el servidor no tiene acceso directo a internet, dirija esas llamadas a través de un proxy HTTP:

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

O como variables de entorno:

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

Notas:

- Se admiten los esquemas `http`, `https`, `socks5` y `socks5h`. Una dirección de proxy no válida detiene el servidor al arrancar.
- `username` y `password` son opcionales y sustituyen las credenciales indicadas dentro de `url`. Mantenerlas aparte evita que la contraseña aparezca en la dirección del proxy que Semaphore UI registra.
- El proxy se aplica solo a las peticiones al servidor de licencias. Las tareas, los clones de Git y otras conexiones salientes no se ven afectadas.
- Sin `subscription.proxy`, el servidor de licencias se alcanza a través de las variables de proxy del proceso del servidor (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`), como antes.
- Una instalación aislada de internet necesita una clave de licencia sin conexión en lugar de un proxy: para ella el servidor nunca llama al portal.

## Gestionar o sustituir una clave de licencia {#manage-or-replace-a-license-key}

Para renovar, sustituir o revisar su licencia, abra el menú de administración y seleccione **Suscripción y facturación**.

![Menú de administración con la opción Suscripción y facturación](/assets/subscription-billing-menu-item.png)

Si la clave de licencia se gestiona desde la interfaz web, abra el menú de acciones del cuadro de diálogo **Suscripción y facturación** para recargar, cargar o restablecer la clave.

![Cuadro de diálogo de Suscripción y facturación con las acciones de la clave](/assets/subscription-key-actions-menu.png)

Si la clave está configurada en el servidor:

1. Sustituya el valor de `subscription.key` o actualice el contenido del archivo al que hace referencia `subscription.key_file`.
2. Reinicie Semaphore UI para que el servidor vuelva a cargar la clave de licencia.
3. Compruebe que las opciones de Pro o Enterprise esperadas estén disponibles en Semaphore UI.
