---
title: Den Online-Konfigurator verwenden
description: Erzeugen Sie Befehle für eine Binärinstallation oder eine Docker-Compose-Datei mit dem Online-Konfigurator von Semaphore.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Den Online-Konfigurator verwenden

Füllen Sie das Formular aus, um Einrichtungsbefehle für einen neuen Semaphore-Server zu erzeugen. Die Vorschau aktualisiert sich während der Eingabe; wenden Sie das Ergebnis auf Ihrem Server an, um die Einrichtung abzuschließen.

## Bevor Sie beginnen {#before-you-begin}

- Wählen Sie eine Binär- oder Docker-Installation und die Semaphore-Version. Die Links und Videos verwenden **2.19**; wählen Sie auf der Website Ihre Version.
- Halten Sie für MySQL oder Postgres die Verbindungsdaten bereit. Wählen Sie für SQLite einen Datenbankdateipfad, auf den der Semaphore-Dienstbenutzer schreiben darf.
- Verwenden Sie ein eigenes Administratorpasswort. Die Videos enthalten Demonstrationswerte.

## Schritte {#steps}

Folgen Sie dem Abschnitt für Ihre Installationsmethode.

### Binärinstallation {#binary-installation}

1. Öffnen Sie die [Seite zur Binärinstallation](https://semaphoreui.com/install/binary/2_19/install). Suchen Sie Plattform, Architektur und Pakettyp. Klicken Sie auf die Zeile, um die Befehle anzuzeigen; kopieren Sie diese und führen Sie sie auf dem Server aus, oder laden Sie das Paket mit **Download** herunter.
2. Öffnen Sie [Server setup](https://semaphoreui.com/install/binary/2_19/config). Wählen Sie unter **Database settings** die Option **SQLite**, **MySQL** oder **Postgres** und geben Sie Dateipfad oder Verbindungsdaten ein. Tragen Sie unter **Admin user** Anmeldenamen, Passwort, Namen und E-Mail ein.
3. Kehren Sie zu **Config file** zurück und klicken Sie auf das Kopiersymbol. Prüfen Sie die Befehle, bevor Sie sie in einem beschreibbaren Verzeichnis auf dem Server ausführen. Sie erstellen `config.json`, legen den Administrator an und starten Semaphore. Bewahren Sie Konfiguration und erzeugte Verschlüsselungsschlüssel für spätere Starts auf.

![Aufgeklappte Zeile Linux amd64 deb mit Installationsbefehlen](/img/admin-guide/configuration/online/binary-install.png)

![Datenbank- und Administratorfelder mit Demonstrationswerten](/img/admin-guide/configuration/online/binary-settings.png)

Das Video zeigt Paketauswahl, Servereinstellungen und das Kopieren der Befehle.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="Das Video zeigt Paketauswahl, Servereinstellungen und das Kopieren der Befehle.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Docker-Installation {#docker-installation}

1. Öffnen Sie den [Docker-Konfigurator](https://semaphoreui.com/install/docker/2_19). Legen Sie unter **Container settings** Namen und Host-Port fest. Aktivieren Sie unter **Docker volumes** die Daten- und Konfigurationsvolumes, damit sie beim Ersetzen des Containers erhalten bleiben.
2. Wählen Sie die Datenbank und füllen Sie **Admin user** mit einem eigenen Passwort aus. Verwenden Sie für eine externe Datenbank einen vom Container erreichbaren Host.
3. Wählen Sie **Docker Compose** und klicken Sie auf das Downloadsymbol. Speichern Sie das Ergebnis als `docker-compose.yml` im Bereitstellungsverzeichnis, prüfen Sie es und führen Sie dort `docker compose up -d` aus. Alternativ wählen Sie **Docker command** und kopieren den erzeugten Befehl `docker run`.

![Docker-Containereinstellungen mit aktivierten persistenten Daten- und Konfigurationsvolumes](/img/admin-guide/configuration/online/docker-settings.png)

Das Video zeigt Containereinstellungen, persistente Volumes und den Download von Docker Compose.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="Das Video zeigt Containereinstellungen, persistente Volumes und den Download von Docker Compose.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## Nächste Schritte {#whats-next}

Öffnen Sie den Server im Browser, etwa `http://localhost:3000` bei lokaler Ausführung, und melden Sie sich mit den eingegebenen Administratordaten an.

- [Die Binärdatei als Dienst ausführen](/admin-guide/installation/binary-file#run-as-a-service).
- [Details zur Docker-Bereitstellung](/admin-guide/installation/docker).
- [Alle Konfigurationsoptionen](/reference/configuration).
