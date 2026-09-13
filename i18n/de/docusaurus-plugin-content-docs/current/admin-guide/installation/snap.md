# Snap (veraltet)

Um Semaphore über Snap zu installieren, führen Sie den folgenden Befehl im Terminal aus:

```bash
sudo snap install semaphore
```

Semaphore ist über die URL [https://localhost:3000](https://localhost:3000) erreichbar.&#x20;

Um sich anmelden zu können, müssen Sie jedoch einen Admin-Benutzer anlegen. Verwenden Sie dazu die folgenden Befehle:

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

Den Status des Semaphore-Dienstes können Sie mit dem folgenden Befehl prüfen:

```bash
sudo snap services semaphore
```

Es sollte die folgende Tabelle ausgegeben werden:

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

Nach der Installation können Sie Semaphore über die [Snap-Konfiguration](https://snapcraft.io/docs/configuration-in-snaps) einrichten. Verwenden Sie den folgenden Befehl, um Ihre Semaphore-Konfiguration anzuzeigen:

```bash
sudo snap get semaphore
```

&#x20;Eine Liste der verfügbaren Optionen finden Sie in der [Referenz der Konfigurationsoptionen](../configuration#configuration-options).

----
