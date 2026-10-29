---
title: "Lizenzaktivierung"
---

# Lizenzaktivierung <Pro />

Die Funktionen von Semaphore Pro und Enterprise werden mit einem Lizenzschlüssel freigeschaltet. Sie können die Lizenz über die Weboberfläche aktivieren oder den Schlüssel für automatisierte Deployments in der Serverkonfiguration hinterlegen.

## Bevor Sie beginnen {#before-you-start}

- Sie müssen Semaphore UI nicht neu installieren oder zu einem anderen Build wechseln, um Pro oder Enterprise zu aktivieren. Ihre aktuelle Version von Semaphore UI kann mit einem Lizenzschlüssel aktiviert werden. Aktualisieren Sie auf die neueste Version, wenn Sie Zugriff auf die neuesten Pro- oder Enterprise-Funktionen wünschen.
- Melden Sie sich mit einem Administratorkonto an.
- Halten Sie Ihren Lizenzschlüssel bereit. Sie finden ihn in der Kauf-E-Mail oder im [Semaphore UI Portal](https://portal.semaphoreui.com/auth/login).

## Aktivierung über die Weboberfläche {#activate-from-the-web-ui}

1. Melden Sie sich bei Semaphore UI als Administrator an.

![Anmeldebildschirm von Semaphore UI](/assets/subscription-login-screen.png)

2. Öffnen Sie das Admin-Menü über den Benutzerbereich in der unteren linken Ecke.

![Auslöser des Admin-Menüs in der unteren linken Ecke](/assets/subscription-admin-menu-trigger.png)

3. Wählen Sie **Auf PRO oder EE upgraden**.

![Admin-Menü mit dem Eintrag „Auf PRO oder EE upgraden“](/assets/subscription-upgrade-menu-item.png)

4. Fügen Sie Ihren Lizenzschlüssel in den Aktivierungsdialog ein und klicken Sie auf **NEUEN SCHLÜSSEL AKTIVIEREN**.

![Aktivierungsdialog von Semaphore Pro](/assets/subscription-activation-dialog.png)

Nach erfolgreicher Aktivierung zeigt Semaphore UI die Details Ihrer aktuellen Lizenz im Dialog **Abonnement & Abrechnung** an.

![Dialog „Abonnement & Abrechnung“ nach erfolgreicher Aktivierung](/assets/subscription-activation-success.png)

## Aktivierung über die Konfiguration {#activate-from-configuration}

Für Docker, Kubernetes, systemd oder andere automatisierte Deployments hinterlegen Sie den Lizenzschlüssel in der Serverkonfiguration, statt ihn in der Benutzeroberfläche einzugeben. Die Namen der Konfigurationsoptionen verwenden `subscription.*`.

In `config.json`:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

Oder als Umgebungsvariable:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

Sie können den Schlüssel auch in einer Datei speichern:

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

oder:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

Wenn der Lizenzschlüssel über die Konfiguration verwaltet wird, deaktiviert Semaphore UI die Bearbeitungs- und Aktivierungselemente im Dialog **Abonnement & Abrechnung**. Dies gilt sowohl für `subscription.key` als auch für `subscription.key_file`, da der Server die Schlüsseldatei beim Start in den Laufzeit-Lizenzschlüssel einliest.

## Lizenzserver über einen Proxy erreichen {#reach-the-license-server-through-a-proxy}

:::info Seit v2.20
Der Proxy ist seit **Semaphore 2.20** verfügbar.
:::

Die Aktivierung eines Schlüssels, das Erneuern des Lizenz-Tokens und die tägliche Token-Erneuerung rufen alle das Semaphore UI Portal unter `subscription.server_url` auf. In einem Netzwerk, in dem der Server keinen direkten Internetzugang hat, leiten Sie diese Aufrufe über einen HTTP-Proxy:

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

Oder als Umgebungsvariablen:

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

Hinweise:

- Die Schemata `http`, `https`, `socks5` und `socks5h` werden unterstützt. Eine ungültige Proxy-Adresse stoppt den Server beim Start.
- `username` und `password` sind optional und überschreiben Zugangsdaten, die in `url` angegeben sind. Getrennt gehalten, bleibt das Passwort aus der Proxy-Adresse heraus, die Semaphore UI protokolliert.
- Der Proxy gilt nur für Anfragen an den Lizenzserver. Aufgaben, Git-Clones und andere ausgehende Verbindungen sind nicht betroffen.
- Ohne `subscription.proxy` wird der Lizenzserver wie bisher über die Proxy-Variablen des Serverprozesses (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`) erreicht.
- Eine Installation ohne Internetzugang benötigt einen Offline-Lizenzschlüssel statt eines Proxys — dafür ruft der Server das Portal nie auf.

## Lizenzschlüssel verwalten oder ersetzen {#manage-or-replace-a-license-key}

Um Ihre Lizenz zu verlängern, zu ersetzen oder einzusehen, öffnen Sie das Admin-Menü und wählen Sie **Abonnement & Abrechnung**.

![Admin-Menü mit dem Eintrag „Abonnement & Abrechnung“](/assets/subscription-billing-menu-item.png)

Bei einem über die Weboberfläche verwalteten Lizenzschlüssel öffnen Sie das Aktionsmenü im Dialog **Abonnement & Abrechnung**, um den Schlüssel neu zu laden, hochzuladen oder zurückzusetzen.

![Dialog „Abonnement & Abrechnung“ mit Schlüsselaktionen](/assets/subscription-key-actions-menu.png)

Wenn der Schlüssel auf dem Server konfiguriert ist:

1. Ersetzen Sie den Wert von `subscription.key` oder aktualisieren Sie den Inhalt der Datei, auf die `subscription.key_file` verweist.
2. Starten Sie Semaphore UI neu, damit der Server den Lizenzschlüssel neu lädt.
3. Prüfen Sie, ob die erwarteten Pro- oder Enterprise-Optionen in Semaphore UI verfügbar sind.
