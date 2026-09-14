# Installation

Sie können Semaphore auf verschiedene Arten installieren, je nach Betriebssystem, Umgebung und Ihren Vorlieben.

## In diesem Abschnitt {#in-this-section}

| Methode | Wann verwenden |
|---|---|
| [Paketmanager](/admin-guide/installation/package-manager) | Sie möchten ein natives Paket für Ihre Linux-Distribution verwenden. |
| [Docker](/admin-guide/installation/docker) | Sie möchten Semaphore in einem Container mit Docker oder Docker Compose ausführen. |
| [Cloud](/admin-guide/installation/cloud) | Sie stellen Semaphore auf einer Cloud-Plattform bereit und benötigen Hinweise zu verwalteten Diensten und Infrastruktur. |
| [Binärdatei](/admin-guide/installation/binary-file) | Sie möchten eine vorkompilierte Binärdatei installieren und den Prozess selbst verwalten. |
| [Kubernetes (Helm-Chart)](/admin-guide/installation/k8s) | Sie verwenden bereits Kubernetes und möchten die Bereitstellung mit Helm verwalten. |

## Zusätzliche Python-Pakete installieren {#installing-additional-python-packages}

Einige Ansible-Module und -Rollen benötigen zusätzliche Python-Pakete. Um zusätzliche Python-Pakete zu installieren, erstellen Sie eine Datei `requirements.txt` und mounten Sie sie im Verzeichnis `/etc/semaphore` des Containers. Sie könnten zum Beispiel die folgenden Zeilen zu Ihrer `docker-compose.yml` hinzufügen:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Die in der Requirements-Datei angegebenen Pakete werden bei jedem Start des Containers in die mitgelieferte virtuelle Ansible-Umgebung installiert. Derselbe Mount funktioniert auch für das Image `semaphoreui/runner`. Details und eine Alternative mit eigenem Image finden Sie unter [Zusätzliche Python-Abhängigkeiten installieren](/admin-guide/installation/docker#installing-additional-python-dependencies).

Weitere Informationen zu Python-Requirements-Dateien finden Sie in der [Referenz zum Pip-Requirements-Dateiformat](https://pip.pypa.io/en/stable/reference/requirements-file-format/)

## Wo anfangen {#where-to-start}

Beginnen Sie mit der Anleitung für Ihre Bereitstellungsumgebung. Folgen Sie bei einer Binärinstallation den Anweisungen zum Dienstbetrieb, damit Semaphore weiterläuft. Hinweise zu Dienstbenutzern, Python-Abhängigkeiten und systemd finden Sie in der Anleitung zur manuellen Installation.

* [Als Dienst ausführen](/admin-guide/installation/binary-file#run-as-a-service)
* [Manuelle Installation](/admin-guide/installation_manually)
