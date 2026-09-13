# Despliegue en la nube

Puede ejecutar Semaphore en cualquier entorno en la nube utilizando los mismos métodos de instalación compatibles:

- Máquinas virtuales: instale mediante el gestor de paquetes o el binario y ejecútelo detrás de un proxy inverso como NGINX. Utilice una base de datos gestionada (por ejemplo, Amazon RDS o Cloud SQL) para mayor fiabilidad.
- Contenedores: despliegue con Docker o Docker Compose en una máquina virtual o en un servicio de contenedores. Consulte los volúmenes persistentes y la configuración del entorno en la guía de Docker.
- Kubernetes: despliegue con el chart de Helm oficial. Utilice las clases de almacenamiento de la nube y bases de datos gestionadas.

Aspectos esenciales:

- Configure la URL externa y TLS en su balanceador de carga o proxy inverso.
- Guarde los valores sensibles (credenciales de la base de datos, secretos de OAuth) en un gestor de secretos seguro o en Secrets de Kubernetes.
- Utilice bases de datos gestionadas en producción y habilite copias de seguridad periódicas.
- Sitúe los runners cerca de sus cargas de trabajo para reducir la latencia y el tráfico de salida.

Guías relacionadas:

- [Docker](../installation/docker)
- [Kubernetes (chart de Helm)](../installation/k8s)
- [Archivo binario](../installation/binary-file)
- [Refuerzo de la seguridad](../security)

