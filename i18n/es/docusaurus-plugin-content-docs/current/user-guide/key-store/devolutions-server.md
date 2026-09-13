---
title: "Almacenamiento de secretos en Devolutions Server"
---

# Almacenamiento de secretos en Devolutions Server <Enterprise />

Semaphore UI admite Devolutions Server como almacenamiento de secretos. 

![](/assets/dvls1.webp)

Puede proporcionar las siguientes opciones:
- **URL de Devolutions Server** — dirección de su servidor Devolutions.
- **ID de vault** — identificador del vault donde se guardan los secretos.
- **App Key** — clave de aplicación usada para la autenticación.
- **Token** — token de autenticación. El token puede:
    - Guardarse en la base de datos.
    - Proporcionarse mediante una variable de entorno.
    - Proporcionarse mediante un archivo.

El almacenamiento puede funcionar en modo de solo lectura.
