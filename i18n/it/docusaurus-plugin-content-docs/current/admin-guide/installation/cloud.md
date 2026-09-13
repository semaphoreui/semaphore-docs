# Distribuzione nel cloud

È possibile eseguire Semaphore in qualsiasi ambiente cloud utilizzando gli stessi metodi di installazione supportati:

- Macchine virtuali: installare tramite gestore di pacchetti o file binario ed eseguire dietro un reverse proxy come NGINX. Utilizzare un database gestito (ad es. Amazon RDS, Cloud SQL) per garantire l'affidabilità.
- Container: distribuire con Docker o Docker Compose su una VM o su un servizio di container. Consultare la guida Docker per i volumi persistenti e la configurazione dell'ambiente.
- Kubernetes: distribuire con l'Helm chart ufficiale. Utilizzare le storage class del cloud e database gestiti.

Aspetti essenziali:

- Configurare l'URL esterno e TLS sul bilanciatore di carico o sul reverse proxy.
- Conservare i valori sensibili (credenziali del database, segreti OAuth) in un gestore di segreti sicuro o nei Secret di Kubernetes.
- Utilizzare database gestiti in produzione e abilitare backup regolari.
- Posizionare i runner vicino ai carichi di lavoro per ridurre latenza e traffico in uscita.

Guide correlate:

- [Docker](../installation/docker)
- [Kubernetes (Helm chart)](../installation/k8s)
- [File binario](../installation/binary-file)
- [Hardening della sicurezza](../security)

