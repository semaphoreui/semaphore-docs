---
title: Hosts
description: Welche Hosts Ihre Ansible-Tasks erreichen, wie jeder von ihnen geendet hat und wo Sie nachsehen, wenn ein Host fehlschlägt oder nie erreicht wird.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

Die Seite **Hosts** eines Projekts listet jeden Host auf, den die Ansible-Tasks des Projekts erreicht
haben, mit dem Ergebnis des letzten Laufs auf diesem Host. Öffnen Sie sie, wenn Sie wissen möchten,
welche Hosts fehlschlagen, welche nicht erreichbar sind und welche seit einiger Zeit kein Task
berührt hat, ohne Task-Logs einzeln zu öffnen.

## So funktioniert es {#how-it-works}

Sie fügen Hosts nicht von Hand hinzu. Nach jedem Ansible-Task speichert Semaphore jeden Host des
Plays mit seinem Ergebnis auf diesem Host: `ok`, `changed`, `failed` oder `unreachable`. Tasks auf
dem Server, auf Runnern und in Docker- oder Kubernetes-Executors zählen alle. Tasks anderer
Anwendungen, wie Terraform oder Bash, fügen keine Hosts hinzu.

Ein Host ist sein Inventarname. `web-01` in zwei Inventaren ist ein Host, und `Web-01` ist derselbe
Host wie `web-01`. Ein Host, den Tasks mehrerer Projekte erreichen, wird in jedem Projekt mit den
eigenen Zahlen dieses Projekts aufgeführt. Ein Host bleibt mit seinem Verlauf in der Liste, nachdem
er Ihr Inventar verlassen hat.

## Einen Host finden {#find-a-host}

- **Search** findet Hosts nach Namen.
- **Failing now** zeigt Hosts, deren letzter Lauf fehlgeschlagen ist. **Unreachable** zeigt Hosts,
  zu denen Ansible keine Verbindung herstellen konnte. **Not seen 30 days** zeigt Hosts, die seit
  einem Monat kein Task berührt hat.
- **Template** schränkt die Liste auf die Hosts einer Vorlage ein.

Klicken Sie auf einen Host, um seine Karte zu öffnen: wann er zum ersten Mal gesehen wurde, wie viele
Läufe er hatte, wie viele der letzten 10 Läufe fehlgeschlagen sind und welche Tasks ihn erreicht
haben, mit dem Ergebnis auf diesem Host. Klicken Sie auf einen Task, um sein Log zu öffnen.

Der Tab **Summary** eines Tasks zeigt dasselbe für einen Lauf: Wählen Sie **All servers**, um alle
Hosts dieses Tasks mit ihren Zählern zu sehen.

## Wie geht es weiter {#whats-next}

- [Hosts für Administratoren](/admin-guide/hosts) — alle Projekte, die Lizenzzählung und Außerbetriebnahme.
- [Inventar](/user-guide/inventory) — definieren Sie die Hosts, gegen die Ihre Tasks laufen.
