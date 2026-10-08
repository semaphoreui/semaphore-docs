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

Findet eine Filterkombination nur wenige Ereignisse, sucht Semaphore jeweils zwei Sekunden lang und zeigt an, wie
weit zurück es gekommen ist. Klicken Sie auf **Search older**, um weiterzusuchen.

**Export** speichert jedes Ereignis, das zu den Filtern passt, als CSV- oder JSON-Lines-Datei. Jeder Export wird
als Ereignis `audit.log/export` aufgezeichnet.

![Export als CSV oder JSON Lines](/assets/audit-log-export.png)
