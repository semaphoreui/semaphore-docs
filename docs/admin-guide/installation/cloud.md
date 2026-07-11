# Cloud deployment

You can run Semaphore in any cloud environment using the same supported installation methods:

- Virtual machines: install via package manager or binary, and run behind a reverse proxy such as NGINX. Use a managed database (e.g., Amazon RDS, Cloud SQL) for reliability.
- Containers: deploy with Docker or Docker Compose on a VM or container service. See persistent volumes and environment configuration in the Docker guide.
- Kubernetes: deploy with the official Helm chart. Use cloud storage classes and managed databases.

Essentials:

- Configure external URL and TLS at your load balancer or reverse proxy.
- Store sensitive values (DB credentials, OAuth secrets) in a secure secret manager or Kubernetes Secrets.
- Use managed databases for production and enable regular backups.
- Put runners close to your workloads to reduce latency and egress.

Related guides:

- [Docker](../installation/docker)
- [Kubernetes (Helm chart)](../installation/k8s)
- [Binary file](../installation/binary-file)
- [Security hardening](../security)

