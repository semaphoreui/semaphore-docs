---
title: Configuración
description: Semaphore lee los ajustes de un archivo de configuración y de variables de entorno. El configurador en línea permite prepararlos mediante un formulario. Elige el método adecuado para tu servidor.
---

# Configuración

Semaphore lee los ajustes de un archivo de configuración y de variables de entorno. El configurador en línea permite prepararlos mediante un formulario. Elige el método adecuado para tu servidor.

## En esta sección {#in-this-section}

| Método | Cuándo usarlo |
|---|---|
| [Configurador en línea](/admin-guide/configuration/online) | Quieres un formulario que genere la configuración y los comandos de inicio para una instalación binaria o Docker. |
| [Archivo de configuración](/admin-guide/configuration/config-file) | Quieres guardar los ajustes del servidor en un archivo `config.json`. |
| [Variables de entorno](/admin-guide/configuration/env-vars) | Gestionas los ajustes mediante Docker, una definición de servicio o herramientas de despliegue. |

## Opciones de configuración {#configuration-options}

Una variable de entorno tiene prioridad sobre el valor correspondiente del archivo. El valor predeterminado se aplica cuando ninguno está definido. Si editar el archivo no tiene efecto, comprueba el entorno del proceso de Semaphore.

La [referencia de opciones de configuración](/reference/configuration) enumera nombres, variables de entorno, tipos y valores predeterminados. Se genera a partir del código de Semaphore; usa la documentación de tu versión si configuras un servidor antiguo.

<span id="frequently-asked-questions" />

## URL pública {#1-how-to-configure-a-public-url-for-semaphore-ui}

Configura `web_host` (o `SEMAPHORE_WEB_ROOT`) con la dirección que los usuarios abren en el navegador. Si un proxy inverso sirve Semaphore en `https://example.com/semaphore`, incluye la dirección completa con `/semaphore`. Es la dirección pública, no la dirección interna a la que se conecta el proxy.

## Por dónde empezar {#where-to-start}

Para un servidor nuevo, abre la guía del configurador en línea y sigue los pasos para binarios o Docker. Para uno existente, actualiza el archivo o las variables de entorno de su servicio y reinicia Semaphore.
