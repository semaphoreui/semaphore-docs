# Konfiguration

Semaphore kann auf mehrere Arten konfiguriert werden:

* [Online-Konfigurator](https://semaphoreui.com/install) &mdash; Weboberfläche zum Erzeugen der Konfiguration online.
* [Konfigurationsdatei](/admin-guide/configuration/config-file) &mdash; die primäre und flexibelste Methode, Semaphore zu konfigurieren.
* [Umgebungsvariablen](/admin-guide/configuration/env-vars) &mdash; nützlich für containerisierte oder Cloud-native Bereitstellungen.


## Konfigurationsoptionen {#configuration-options}

Jede Option mit ihrer Umgebungsvariablen, ihrem Typ und ihrem Standardwert ist in
der [Referenz der Konfigurationsoptionen](/reference/configuration) aufgeführt. Diese
Seite wird aus dem Semaphore-Quellcode erzeugt und passt daher immer zu der Version,
die Sie einsetzen.

Werte werden in einer festen Reihenfolge aufgelöst: Eine Umgebungsvariable hat
Vorrang vor der Konfigurationsdatei, und der eingebaute Standardwert greift nur,
wenn keines von beidem gesetzt ist.

## Häufig gestellte Fragen {#frequently-asked-questions}

### 1. Wie konfiguriert man eine öffentliche URL für Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Wenn Sie nginx oder einen anderen Webserver vor Semaphore einsetzen, sollten Sie die Konfigurationsoption `web_host` angeben.

Angenommen, Sie haben NGINX auf dem Server konfiguriert, der Anfragen an Semaphore weiterleitet.

Die Serveradresse lautet `https://example.com` und Sie leiten alle Anfragen an `https://example.com/semaphore` an Semaphore weiter.

Ihr `web_host` lautet dann `https://example.com/semaphore`.
