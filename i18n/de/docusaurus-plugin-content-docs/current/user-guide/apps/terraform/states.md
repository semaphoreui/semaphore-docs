---
title: "HTTP-Backend"
sidebar_custom_props:
  edition: pro
---

# HTTP-Backend <Pro />

Das HTTP-Backend von Semaphore UI für Terraform speichert und verwaltet Terraform-State-Dateien sicher direkt in Semaphore. Es ist im Pro-Plan verfügbar und bietet mehrere wesentliche Vorteile.

## Funktionen {#features}

- **Sichere State-Speicherung**: State-Dateien werden <!-- encrypted and--> sicher in Semaphore gespeichert.
- **State-Locking**: Verhindert gleichzeitige Änderungen an derselben State-Datei.
- **Versionsverlauf**: Verfolgen Sie Änderungen am State Ihrer Infrastruktur über die Zeit.
- **UI-Integration**: Verwalten Sie State-Dateien direkt über die Semaphore-Oberfläche.

## Konfiguration {#configuration}

Um das integrierte HTTP-Backend zu verwenden, müssen Sie zunächst einen Workspace für Ihre Terraform-Aufgabenvorlage erstellen.

Um einen Workspace hinzuzufügen, gehen Sie zum Tab **Workspaces** Ihrer Terraform/OpenTofu-Vorlage.

Beim Erstellen eines Workspace werden Sie aufgefordert, einen SSH-Schlüssel zum Klonen privater Module auszuwählen, die in Ihrem Terraform-Code verwendet werden. Wenn Sie keine privaten Module verwenden, wählen Sie einfach die Option `None`.

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### Verwendung des HTTP-Backends in Aufgaben {#using-the-http-backend-in-tasks}

Um das integrierte HTTP-Backend zum Speichern des State Ihrer Terraform-Aufgaben zu verwenden, müssen Sie das Backend nicht manuell in Ihrem Terraform-Code konfigurieren. Semaphore kann die Konfigurationsdatei während der Ausführung automatisch erstellen. Aktivieren Sie dazu einfach die Option **Backend-Einstellungen überschreiben** in den Einstellungen Ihrer Aufgabenvorlage, wie im folgenden Screenshot gezeigt.


Optional können Sie den Namen der Konfigurationsdatei angeben, die während der Ausführung dynamisch erstellt wird. Das ist nützlich, wenn Ihr Code bereits eine Backend-Konfigurationsdatei enthält und Sie diese dynamisch überschreiben müssen, damit sie mit dem integrierten Backend von Semaphore funktioniert.

### Verwendung des HTTP-Backends außerhalb von Semaphore {#using-the-http-backend-outside-semaphore}

Sie können das integrierte HTTP-Backend nicht nur beim Ausführen von Aufgaben innerhalb von Semaphore verwenden, sondern auch beim Ausführen von Terraform-Code außerhalb von Semaphore, zum Beispiel aus Ihrem lokalen Terminal.

Dazu ermöglicht Semaphore das Erstellen von Aliassen (eindeutige HTTP-Endpunkte) für Ihren State-Speicher. Über diese Aliasse lassen sich Ihre State-Dateien einfach aus externen Umgebungen referenzieren.

Um dies einzurichten, gehen Sie zum Tab **Workspaces**, wählen Sie den gewünschten Workspace aus und fügen Sie einen Alias hinzu. Außerdem müssen Sie einen Schlüssel mit Benutzername und Passwort auswählen, der zur Authentifizierung des Zugriffs auf das Backend verwendet wird.

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

Anschließend müssen Sie die Backend-Einstellungen zu Ihrem Terraform-Code hinzufügen:

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

Jetzt verwendet Terraform das integrierte HTTP-Backend von Semaphore auch beim Ausführen aus Ihrem Terminal:

```
terraform apply
```
