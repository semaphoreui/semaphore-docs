# Configuración

Semaphore puede configurarse de varias formas:

* [Configurador en línea](https://semaphoreui.com/install) &mdash; interfaz web para generar la configuración en línea.
* [Archivo de configuración](/admin-guide/configuration/config-file) &mdash; la forma principal y más flexible de configurar Semaphore.
* [Variables de entorno](/admin-guide/configuration/env-vars) &mdash; útiles para despliegues en contenedores o nativos de la nube.


## Opciones de configuración {#configuration-options}

Todas las opciones, con su variable de entorno, su tipo y su valor por defecto, están
en la [referencia de opciones de configuración](/reference/configuration). Esa página se
genera a partir del código fuente de Semaphore, por lo que siempre corresponde a la
versión que está ejecutando.

Los valores se resuelven en un único orden: una variable de entorno prevalece sobre el
archivo de configuración, y el valor por defecto solo se aplica cuando no se ha definido
ninguno de los dos.

## Preguntas frecuentes {#frequently-asked-questions}

### 1. Cómo configurar una URL pública para Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Si usa nginx u otro servidor web delante de Semaphore, debe indicar la opción de configuración `web_host`.

Por ejemplo, suponga que ha configurado NGINX en el servidor para que redirija las consultas a Semaphore.

La dirección del servidor es `https://example.com` y redirige todas las consultas de `https://example.com/semaphore` a Semaphore.

Su `web_host` será `https://example.com/semaphore`.
