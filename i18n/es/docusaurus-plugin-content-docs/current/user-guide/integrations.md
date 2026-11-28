---
title: Integraciones
description: Inicio de plantillas y flujos de trabajo a partir de webhooks entrantes con endpoints, grupos de integraciones, métodos de autenticación, coincidencias y extractores de valores.
---

# Integraciones

Las integraciones permiten que servicios externos como GitHub, GitLab o un servidor de CI inicien tareas en Semaphore llamando a una URL de webhook. Tres objetos describen una integración: un **endpoint** indica dónde llega la petición y cómo se autentica, un **grupo de integraciones** indica qué integraciones se ejecutan desde ese endpoint y una **integración** indica qué se inicia y con qué parámetros.

![Lista de integraciones](/assets/integrations-list.webp)

## Cómo funciona {#how-it-works}

| Objeto | Qué contiene | Dónde |
|---|---|---|
| **Endpoint** | Un nombre y una descripción, uno o varios **alias** (URL públicas con el formato `/api/integrations/<random_string>`) y la **autenticación** con la que se comprueba cada petición a esas URL. | Proyecto → **Endpoints** |
| **Grupo de integraciones** | Un conjunto de integraciones que se ejecutan desde un endpoint. Normalmente, un grupo hereda la autenticación del endpoint; puede **sobrescribirla** con su propio método y secreto. | Proyecto → **Integraciones**, una sección por grupo |
| **Integración** | La plantilla o el flujo de trabajo (Pro) que se inicia, sus parámetros de tarea, las [coincidencias](#matchers) que filtran las peticiones y los [extractores de valores](#value-extractors) que alimentan la tarea. | Dentro de su grupo |

Cuando llega una petición a un alias, Semaphore localiza el endpoint, comprueba la petición con la autenticación de cada grupo (la del endpoint o la propia del grupo) e inicia todas las integraciones de un grupo autorizado cuyas coincidencias aceptan la petición. Una integración sin coincidencias se ejecuta con cada petición autorizada. La respuesta siempre es `204 No Content`; las cabeceras `X-Semaphore-Endpoint-ID`, `X-Semaphore-Integration-Group-ID`, `X-Semaphore-Integration-ID` y `X-Semaphore-Task-ID` indican qué se ha iniciado. Se admiten `GET` y `POST`.

![Detalles de la integración](/assets/integration-detail.webp)

La cadena del alias es el único secreto de un endpoint sin autenticación: trate la URL como una contraseña y elimine un alias para revocarlo. Un endpoint puede tener varios alias, de modo que puede entregar una URL distinta a cada remitente y revocarlas una a una.

## Autenticación {#authentication}

Un endpoint, o un grupo que lo sobrescribe, comprueba las peticiones con uno de los siguientes métodos:

* **Webhooks de GitHub** — la cabecera `X-Hub-Signature-256`, HMAC-SHA256 del cuerpo con el secreto
* **Webhooks de Bitbucket** — la cabecera `x-hub-signature`, HMAC-SHA256 del cuerpo
* **Token** — una cabecera de su elección debe ser igual al secreto
* **HMAC (SHA-256)** y **HMAC (SHA-512)** — una cabecera de su elección contiene la firma del cuerpo
* **BasicAuth** — usuario y contraseña de una credencial de usuario y contraseña
* **Sin autenticación** — cualquier petición con una URL de alias válida pasa

El secreto procede del [almacén de claves](./key-store) del proyecto: una clave de tipo **Cadena** (su valor es el secreto) o una credencial de **usuario y contraseña** (su contraseña es el secreto). BasicAuth es la excepción: también comprueba el usuario, por lo que necesita una credencial de usuario y contraseña. El formulario solo ofrece las claves cuyo tipo se ajusta al método, y la API rechaza las demás.

## Autenticación HMAC {#hmac-authentication}

Los métodos de autenticación HMAC (`hmac` / SHA-256 y `hmac-sha512` / SHA-512) verifican que el cuerpo del webhook se haya firmado con un secreto compartido.

Configure en el endpoint (o en el grupo que lo sobrescribe):

1. **Auth header** — la cabecera de la petición que contiene la firma (por ejemplo, `X-Signature`).
2. **Auth secret** — una clave de tipo **Cadena** del almacén de claves o una credencial de usuario y contraseña.

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

Las coincidencias describen las peticiones a las que reacciona una integración: una cabecera o un campo del cuerpo (ruta JSON o el cuerpo completo como cadena) comparado con un valor. Todas las coincidencias de una integración deben cumplirse; una integración sin coincidencias se ejecuta con cada petición que su grupo deja pasar. Use coincidencias para ejecutar distintas integraciones de un mismo endpoint según el evento — por ejemplo, una plantilla para `push` y otra para `release`.

## Extractores de valores {#value-extractors}

Con un extractor puede tomar datos de la cabecera o del cuerpo de la petición (un campo JSON o una cadena) y pasarlos a la tarea. Cada valor extraído tiene un **Tipo de variable**:

* **Entorno**: el valor se añade a las variables de entorno de la tarea y sustituye a la variable del mismo nombre del grupo de variables.
* **Parámetro de la tarea**: el valor se convierte en un parámetro de la tarea, por ejemplo una variable de encuesta o una solicitud.

## Parámetros de la tarea {#task-parameters}

Las integraciones pueden lanzar tareas con parámetros. Use extractores de valores para construir un contenido JSON con los parámetros de la tarea y configure la plantilla para que acepte valores solicitados.

## Actualización desde versiones anteriores {#upgrading-from-older-versions}

Antes de la versión 2.20.19, cada integración llevaba su propia autenticación, y los alias existían para todo el proyecto o para una sola integración. La actualización convierte esa configuración sin cambiar lo que hace ninguna URL existente:

| Antes | Después de la actualización |
|---|---|
| Alias del proyecto (la URL encima de la lista de integraciones) | Un endpoint llamado **Default** sin autenticación que los contiene todos |
| Una integración accesible mediante el alias del proyecto («Usar alias del proyecto» activado) | Un grupo propio en el endpoint **Default**. Si la integración tenía autenticación, el grupo **sobrescribe** con ella la del endpoint |
| Una integración con sus propios alias | Un endpoint con el nombre de la integración, con sus alias y su autenticación, y un grupo propio en ese endpoint |
| Coincidencias y extractores de valores | Sin cambios |

Cada integración acaba sola en un grupo con su nombre; después puede fusionar grupos o renombrar endpoints como prefiera. Dos detalles difieren del comportamiento anterior: una integración detrás del alias del proyecto que no tenía coincidencias nunca se ejecutaba antes y ahora se ejecuta con cada petición autorizada, y los alias propios de una integración que también usaba el alias del proyecto (que nunca coincidían con nada) se descartan. Las copias de seguridad de proyectos hechas con una versión anterior se convierten de la misma forma al restaurarlas.
