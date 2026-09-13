# API

## Referencia de la API {#api-reference}

Semaphore UI ofrece dos formatos de documentación de la API, de modo que pueda elegir el que mejor se adapte a su flujo de trabajo:

* [Swagger/OpenAPI](https://semaphoreui.com/api-docs) &mdash; ideal si prefiere una experiencia interactiva en el navegador.
* [Colección oficial de Postman](https://www.postman.com/semaphoreui) &mdash; explore y pruebe todos los endpoints en Postman.
* **Documentación de la API de Swagger integrada** &mdash; documentación interactiva de la API basada en Swagger UI. Puede acceder a ella en su instancia.

![](/assets/swagger-link.webp)

Todas las opciones incluyen la documentación completa de los endpoints disponibles, los parámetros y ejemplos de respuestas.

## Primeros pasos con la API {#getting-started-with-the-api}

Para empezar a usar la API de Semaphore, debe generar un token de API.
Este token debe incluirse en la cabecera de la petición de la siguiente forma:

```http
Authorization: Bearer YOUR_API_TOKEN
```

### Crear un token de API {#creating-an-api-token}

Hay dos formas de crear un token de API:
- A través de la interfaz web
- Mediante una petición HTTP

#### A través de la interfaz web (desde la versión 2.14) {#through-the-web-interface-since-214}

Abra el menú de la cuenta en la parte inferior de la barra lateral y elija **Tokens de API**. La página muestra la lista de sus tokens; el enlace **Referencia de la API** abre la interfaz de Swagger integrada en su instancia.

![Tokens de API](/assets/api-tokens.webp)

Haga clic en **Nuevo token**, escriba un nombre, elija cuándo caduca el token y copie el valor que se muestra tras la creación. Consulte [Su cuenta](/user-guide/account#api-tokens).

<div style={{maxWidth: 420}}>

![Diálogo de nuevo token](/assets/api-token-new.webp)

</div>

#### Mediante una petición HTTP {#using-http-request}

También puede autenticarse y generar un token de sesión con una petición HTTP directa.

Inicie sesión en Semaphore (la contraseña debe escaparse, por ejemplo `slashy\\pass` en lugar de `slashy\pass`):

```bash
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

Genere un nuevo token y obténgalo:

```bash
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

El comando debería devolver algo similar a esto:

```json
{
    "id": "YOUR_ACCESS_TOKEN",
    "created": "2025-05-21T02:35:12Z",
    "expired": false,
    "user_id": 3
}
```
---

## Usar el token para realizar peticiones a la API {#using-token-to-make-api-requests}

Cuando tenga su token de API, inclúyalo en la cabecera **Authorization** para autenticar sus peticiones.

### Lanzar una tarea {#launch-a-task}

Use este token para lanzar una tarea o cualquier otra operación:

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

---

## Caducar un token de API {#expiring-an-api-token}

Si ya no necesita el token, debe hacerlo caducar para mantener su cuenta segura.

Para revocar (hacer caducar) manualmente un token de API, envíe una petición DELETE al endpoint del token:

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
