# Instalación

Puede instalar Semaphore de varias formas, según su sistema operativo, su entorno y sus preferencias:

* **Gestor de paquetes**<br />
  Instale Semaphore mediante un paquete nativo para su distribución (por ejemplo, apt para Debian/Ubuntu o dnf para sistemas basados en RHEL). Es la forma más sencilla de empezar en servidores Linux y se integra bien con los servicios del sistema.<br />
  [Más información »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Ejecute Semaphore como contenedor con Docker o Docker Compose. Ideal para una puesta en marcha rápida, entornos aislados y pipelines de CI/CD. Recomendado para usuarios que prefieren la infraestructura como código.<br />
  [Más información »](/admin-guide/installation/docker)

* **Nube**<br />
  Orientación para desplegar Semaphore en plataformas en la nube mediante máquinas virtuales, contenedores o Kubernetes con servicios gestionados.<br />
  [Más información »](/admin-guide/installation/cloud)

* **Archivo binario**<br />
  Descargue un binario precompilado desde la página de versiones. Excelente para instalaciones manuales o para integrarlo en flujos de trabajo personalizados. Funciona en Linux, macOS y Windows (a través de WSL).<br />
  [Más información »](/admin-guide/installation/binary-file)

* **Kubernetes (chart de Helm)**<br />
  Despliegue Semaphore en un clúster de Kubernetes con Helm. La opción más adecuada para infraestructuras escalables de nivel de producción. Permite configurar y actualizar fácilmente mediante los valores de Helm.<br />
  [Más información »](/admin-guide/installation/k8s)

Véase también:
* [Ejecutar como servicio](/admin-guide/installation/binary-file#run-as-a-service)
* [Instalación manual](/admin-guide/installation_manually)

----


### Instalación de paquetes de Python adicionales {#installing-additional-python-packages}

Algunos módulos y roles de Ansible necesitan paquetes de Python adicionales para ejecutarse. Para instalar paquetes de Python adicionales, cree un archivo `requirements.txt` y móntelo en el directorio `/etc/semaphore` del contenedor. Por ejemplo, podría añadir las siguientes líneas a su archivo `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Los paquetes especificados en el archivo de requisitos se instalarán en el entorno virtual de Ansible incluido cada vez que se inicie el contenedor. El mismo montaje funciona para la imagen `semaphoreui/runner`. Consulte [Instalación de dependencias de Python adicionales](/admin-guide/installation/docker#installing-additional-python-dependencies) para obtener más detalles y una alternativa basada en una imagen personalizada.

Para obtener más información sobre los archivos de requisitos de Python, consulte la [referencia del formato de archivo de requisitos de pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
