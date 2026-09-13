# Integraciones

Las integraciones permiten establecer la interacción entre Semaphore y servicios externos, como GitHub y GitLab.

![Lista de integraciones](/assets/integrations-list.webp)

La URL del webhook del proyecto se muestra encima de la lista. Cada integración tiene un nombre y la plantilla que inicia; haga clic en una integración para configurar sus coincidencias y extractores de valores.

![Detalles de la integración](/assets/integration-detail.webp)

Mediante una integración, puede lanzar una plantilla concreta llamando a un endpoint especial (alias), para el que puede configurar uno de los siguientes métodos de autenticación:
* Webhooks de GitHub
* Token
* HMAC
* Sin autenticación

El alias representa una URL con el siguiente formato: `/api/integrations/<random_string>`. Admite peticiones `GET` y `POST`.

## Coincidencias {#matchers}

Con las coincidencias puede definir parámetros de la petición entrante. Cuando estos parámetros coinciden, se invoca la plantilla.

## Extractores de valores {#value-extractors}

Con un extractor puede tomar datos de la cabecera o del cuerpo de la petición (un campo JSON o una cadena) y pasarlos a la tarea. Cada valor extraído tiene un **Tipo de variable**:

* **Entorno**: el valor se añade a las variables de entorno de la tarea y sustituye a la variable del mismo nombre del grupo de variables.
* **Parámetro de la tarea**: el valor se convierte en un parámetro de la tarea, por ejemplo una variable de encuesta o una solicitud.

## Parámetros de la tarea {#task-parameters}

Las integraciones pueden lanzar tareas con parámetros. Use extractores de valores para construir un contenido JSON con los parámetros de la tarea y configure la plantilla para que acepte valores solicitados.

## Notas sobre los alias y las coincidencias {#notes-on-aliases-and-matchers}

El alias de un proyecto (la URL que aparece encima de la lista de integraciones) es compartido por todas las integraciones del proyecto: Semaphore comprueba las coincidencias de cada integración e inicia las plantillas cuyas coincidencias concuerdan. Una integración también puede tener su propio alias; las peticiones dirigidas a él inician esa integración sin evaluar las coincidencias. Use la autenticación por token o HMAC según convenga y pase los parámetros mediante extractores.
