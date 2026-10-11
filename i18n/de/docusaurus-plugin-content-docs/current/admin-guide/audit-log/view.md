---
title: Audit-Protokoll ansehen
description: "Das Audit-Protokoll in der Weboberfläche lesen: die neuesten Ereignisse, alle Felder eines Ereignisses und mit Semaphore Pro Filter und Export als CSV oder JSON Lines."
---

# Audit-Protokoll ansehen

Administratoren öffnen das **Audit log** im Benutzermenü. Die neuesten Ereignisse stehen oben, 50 pro Seite.

![Das Audit-Protokoll, neueste Ereignisse zuerst](/assets/audit-log-list.png)

Klicken Sie auf ein Ereignis, um alle seine Felder zu sehen. Die Schaltfläche zum Kopieren kopiert das Ereignis in
dem Format, in dem Semaphore es an ein SIEM sendet.

![Ein Ereignis mit allen seinen Feldern](/assets/audit-log-card.png)

## Filtern und exportieren <FeatureState feature="audit-log-filters" /> {#filter-export}

Filtern Sie nach Zeitraum, Benutzer, Ereignisart, Ergebnis, Projekt oder IP-Adresse. In einem Ereignis sind der
Benutzer, die Adresse, das Objekt und das Projekt Links, die das Protokoll danach filtern.

![Das nach der Adresse eines Ereignisses gefilterte Protokoll](/assets/audit-log-filters.png)

Wenn eine Kombination von Filtern nur wenige Ereignisse findet, sucht Semaphore jeweils etwa zwei Sekunden lang.
**Older** und **Newer** suchen von selbst weiter, bis sie Ereignisse finden, zeigen, wie weit die Suche gekommen ist,
und halten mit **Stop** an.

**Export** speichert jedes Ereignis, das zu den Filtern passt, als CSV- oder JSON-Lines-Datei. Jeder Export wird
als Ereignis `audit.log/export` aufgezeichnet.

![Export als CSV oder JSON Lines](/assets/audit-log-export.png)
