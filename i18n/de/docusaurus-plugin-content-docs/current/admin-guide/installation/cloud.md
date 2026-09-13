# Cloud-Bereitstellung

Sie können Semaphore in jeder Cloud-Umgebung mit denselben unterstützten Installationsmethoden betreiben:

- Virtuelle Maschinen: Installation über Paketmanager oder Binärdatei, Betrieb hinter einem Reverse Proxy wie NGINX. Verwenden Sie für mehr Zuverlässigkeit eine verwaltete Datenbank (z. B. Amazon RDS, Cloud SQL).
- Container: Bereitstellung mit Docker oder Docker Compose auf einer VM oder einem Container-Dienst. Informationen zu persistenten Volumes und zur Konfiguration über Umgebungsvariablen finden Sie in der Docker-Anleitung.
- Kubernetes: Bereitstellung mit dem offiziellen Helm-Chart. Verwenden Sie Cloud-Storage-Klassen und verwaltete Datenbanken.

Das Wichtigste:

- Konfigurieren Sie die externe URL und TLS an Ihrem Load Balancer oder Reverse Proxy.
- Speichern Sie sensible Werte (Datenbank-Zugangsdaten, OAuth-Secrets) in einem sicheren Secret-Manager oder in Kubernetes Secrets.
- Verwenden Sie für die Produktion verwaltete Datenbanken und aktivieren Sie regelmäßige Backups.
- Platzieren Sie Runner nahe an Ihren Workloads, um Latenz und ausgehenden Datenverkehr zu reduzieren.

Verwandte Anleitungen:

- [Docker](../installation/docker)
- [Kubernetes (Helm-Chart)](../installation/k8s)
- [Binärdatei](../installation/binary-file)
- [Sicherheitshärtung](../security)
