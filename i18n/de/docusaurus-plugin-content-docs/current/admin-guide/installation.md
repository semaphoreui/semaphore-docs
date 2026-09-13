# Installation

Sie können Semaphore auf verschiedene Arten installieren, je nach Betriebssystem, Umgebung und Ihren Vorlieben:

* **Paketmanager**<br />
  Installieren Sie Semaphore über ein natives Paket für Ihre Distribution (z. B. apt für Debian/Ubuntu oder dnf für RHEL-basierte Systeme). Dies ist der einfachste Einstieg auf Linux-Servern und lässt sich gut in Systemdienste integrieren.<br />
  [Mehr erfahren »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Führen Sie Semaphore als Container mit Docker oder Docker Compose aus. Ideal für eine schnelle Einrichtung, isolierte Umgebungen und CI/CD-Pipelines. Empfohlen für Benutzer, die Infrastructure as Code bevorzugen.<br />
  [Mehr erfahren »](/admin-guide/installation/docker)

* **Cloud**<br />
  Hinweise zur Bereitstellung von Semaphore auf Cloud-Plattformen mit VMs, Containern oder Kubernetes und verwalteten Diensten.<br />
  [Mehr erfahren »](/admin-guide/installation/cloud)

* **Binärdatei**<br />
  Laden Sie eine vorkompilierte Binärdatei von der Releases-Seite herunter. Ideal für die manuelle Installation oder die Einbettung in eigene Workflows. Funktioniert unter Linux, macOS und Windows (über WSL).<br />
  [Mehr erfahren »](/admin-guide/installation/binary-file)

* **Kubernetes (Helm-Chart)**<br />
  Stellen Sie Semaphore mit Helm in einem Kubernetes-Cluster bereit. Am besten geeignet für produktionsreife, skalierbare Infrastruktur. Unterstützt eine einfache Konfiguration und Upgrades über Helm-Values.<br />
  [Mehr erfahren »](/admin-guide/installation/k8s)

Siehe auch:
* [Als Dienst ausführen](/admin-guide/installation/binary-file#run-as-a-service)
* [Manuelle Installation](/admin-guide/installation_manually)

----


### Zusätzliche Python-Pakete installieren {#installing-additional-python-packages}

Einige Ansible-Module und -Rollen benötigen zusätzliche Python-Pakete. Um zusätzliche Python-Pakete zu installieren, erstellen Sie eine Datei `requirements.txt` und mounten Sie sie im Verzeichnis `/etc/semaphore` des Containers. Sie könnten zum Beispiel die folgenden Zeilen zu Ihrer `docker-compose.yml` hinzufügen:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Die in der Requirements-Datei angegebenen Pakete werden bei jedem Start des Containers in die mitgelieferte virtuelle Ansible-Umgebung installiert. Derselbe Mount funktioniert auch für das Image `semaphoreui/runner`. Details und eine Alternative mit eigenem Image finden Sie unter [Zusätzliche Python-Abhängigkeiten installieren](/admin-guide/installation/docker#installing-additional-python-dependencies).

Weitere Informationen zu Python-Requirements-Dateien finden Sie in der [Referenz zum Pip-Requirements-Dateiformat](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
