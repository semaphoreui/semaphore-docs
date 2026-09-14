# Instalación

Puede instalar Semaphore de varias formas, según su sistema operativo, su entorno y sus preferencias.

## En esta sección {#in-this-section}

| Método | Cuándo usarlo |
|---|---|
| [Gestor de paquetes](/admin-guide/installation/package-manager) | Quieres un paquete nativo para tu distribución de Linux. |
| [Docker](/admin-guide/installation/docker) | Quieres ejecutar Semaphore en un contenedor con Docker o Docker Compose. |
| [Nube](/admin-guide/installation/cloud) | Vas a desplegar en una plataforma en la nube y necesitas orientación sobre servicios gestionados e infraestructura. |
| [Archivo binario](/admin-guide/installation/binary-file) | Quieres instalar un binario precompilado y gestionar el proceso por tu cuenta. |
| [Kubernetes (chart de Helm)](/admin-guide/installation/k8s) | Ya usas Kubernetes y quieres gestionar el despliegue con Helm. |

## Instalación de paquetes de Python adicionales {#installing-additional-python-packages}

Algunos módulos y roles de Ansible necesitan paquetes de Python adicionales para ejecutarse. Para instalar paquetes de Python adicionales, cree un archivo `requirements.txt` y móntelo en el directorio `/etc/semaphore` del contenedor. Por ejemplo, podría añadir las siguientes líneas a su archivo `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Los paquetes especificados en el archivo de requisitos se instalarán en el entorno virtual de Ansible incluido cada vez que se inicie el contenedor. El mismo montaje funciona para la imagen `semaphoreui/runner`. Consulte [Instalación de dependencias de Python adicionales](/admin-guide/installation/docker#installing-additional-python-dependencies) para obtener más detalles y una alternativa basada en una imagen personalizada.

Para obtener más información sobre los archivos de requisitos de Python, consulte la [referencia del formato de archivo de requisitos de pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)

## Por dónde empezar {#where-to-start}

Empieza por la guía de tu entorno de despliegue. Si instalas un binario, sigue las instrucciones del servicio para mantener Semaphore en ejecución. Para configurar el usuario del servicio, las dependencias de Python y systemd, usa la guía de instalación manual.

* [Ejecutar como servicio](/admin-guide/installation/binary-file#run-as-a-service)
* [Instalación manual](/admin-guide/installation_manually)
