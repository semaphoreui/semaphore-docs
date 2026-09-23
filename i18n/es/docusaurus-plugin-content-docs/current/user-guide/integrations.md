# Integraciones

Las integraciones permiten establecer la interacción entre Semaphore y servicios externos, como GitHub y GitLab.

![Lista de integraciones](/assets/integrations-list.webp)

La URL del webhook del proyecto se muestra encima de la lista. Cada integración tiene un nombre y la plantilla que inicia; haga clic en una integración para configurar sus coincidencias y extractores de valores.

![Detalles de la integración](/assets/integration-detail.webp)

Mediante una integración, puede lanzar una plantilla concreta llamando a un endpoint especial (alias), para el que puede configurar uno de los siguientes métodos de autenticación:
* Webhooks de GitHub
* Token
* HMAC (SHA-256)
* HMAC (SHA-512)
* Sin autenticación

El alias representa una URL con el siguiente formato: `/api/integrations/<random_string>`. Admite peticiones `GET` y `POST`.

## Autenticación HMAC {#hmac-authentication}

Los métodos de autenticación HMAC (`hmac` / SHA-256 y `hmac-sha512` / SHA-512) verifican que el cuerpo del webhook se haya firmado con un secreto compartido.

Configure:

1. **Auth header** — la cabecera de la petición que contiene la firma (por ejemplo, `X-Signature` o `X-Hub-Signature-256`).
2. **Auth secret** — una credencial de usuario y contraseña del almacén de claves; Semaphore utiliza el valor de la **contraseña** como secreto HMAC.

El remitente debe incluir en esa cabecera un resumen HMAC **hexadecimal sin formato** del cuerpo original de la petición (sin el prefijo `sha256=` / `sha512=`). Semaphore lo compara con el `HMAC-SHA256` o `HMAC-SHA512` del cuerpo calculado con el secreto configurado.

Ejemplo (SHA-512) con OpenSSL:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

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
