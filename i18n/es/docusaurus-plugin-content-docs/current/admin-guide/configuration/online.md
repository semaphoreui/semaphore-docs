---
title: Usa el configurador en línea
description: Genera comandos de configuración binaria o un archivo Docker Compose con el configurador en línea de Semaphore.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Usa el configurador en línea

Rellena el formulario para generar comandos de configuración de un nuevo servidor Semaphore. La vista previa se actualiza al editar; aplica el resultado en tu servidor para completar la configuración.

## Antes de empezar {#before-you-begin}

- Elige una instalación binaria o Docker y la versión de Semaphore. Los enlaces y vídeos usan **2.19**; selecciona tu versión en el sitio web.
- Para MySQL o Postgres, prepara los datos de conexión. Para SQLite, elige una ubicación del archivo de base de datos donde el usuario del servicio Semaphore pueda escribir.
- Usa tu propia contraseña de administrador. Los vídeos contienen valores de demostración.

## Pasos {#steps}

Sigue la sección correspondiente a tu método de instalación.

### Instalación binaria {#binary-installation}

1. Abre la [página de instalación binaria](https://semaphoreui.com/install/binary/2_19/install). Busca tu plataforma, arquitectura y tipo de paquete. Haz clic en la fila para mostrar los comandos; cópialos y ejecútalos en el servidor, o usa **Download** para descargar el paquete.
2. Abre [Server setup](https://semaphoreui.com/install/binary/2_19/config). En **Database settings**, selecciona **SQLite**, **MySQL** o **Postgres** e introduce la ruta o los datos de conexión. En **Admin user**, rellena el usuario, contraseña, nombre y correo.
3. Vuelve a **Config file** y haz clic en el icono de copiar. Revisa los comandos antes de ejecutarlos en un directorio con permiso de escritura del servidor. Crean `config.json`, añaden al administrador e inician Semaphore. Conserva la configuración y las claves de cifrado generadas para futuros inicios.

![Fila Linux amd64 deb expandida con los comandos de instalación](/img/admin-guide/configuration/online/binary-install.png)

![Campos de base de datos y administrador con valores de demostración](/img/admin-guide/configuration/online/binary-settings.png)

El vídeo muestra la selección del paquete, los ajustes del servidor y cómo copiar los comandos.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="El vídeo muestra la selección del paquete, los ajustes del servidor y cómo copiar los comandos.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Instalación con Docker {#docker-installation}

1. Abre el [configurador Docker](https://semaphoreui.com/install/docker/2_19). En **Container settings**, define el nombre y el puerto del host. En **Docker volumes**, activa los volúmenes de datos y configuración para conservarlos al reemplazar el contenedor.
2. Elige la base de datos y rellena **Admin user**, incluida tu propia contraseña. Para una base de datos externa, usa un host accesible desde el contenedor.
3. Selecciona **Docker Compose** y haz clic en el icono de descarga. Guarda el resultado como `docker-compose.yml` en el directorio de despliegue, revísalo y ejecuta allí `docker compose up -d`. También puedes seleccionar **Docker command** y copiar el comando `docker run` generado.

![Ajustes del contenedor Docker con volúmenes persistentes de datos y configuración activados](/img/admin-guide/configuration/online/docker-settings.png)

El vídeo muestra los ajustes del contenedor, los volúmenes persistentes y la descarga de Docker Compose.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="El vídeo muestra los ajustes del contenedor, los volúmenes persistentes y la descarga de Docker Compose.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## Qué sigue {#whats-next}

Abre el servidor en un navegador, por ejemplo `http://localhost:3000` si lo ejecutas localmente, e inicia sesión con las credenciales de administrador que introdujiste.

- [Ejecutar el binario como servicio](/admin-guide/installation/binary-file#run-as-a-service).
- [Detalles del despliegue con Docker](/admin-guide/installation/docker).
- [Todas las opciones de configuración](/reference/configuration).
