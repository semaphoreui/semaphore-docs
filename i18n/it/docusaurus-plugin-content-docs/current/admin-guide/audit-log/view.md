---
title: Visualizzare il log di audit
description: "Consulta il log di audit nell'interfaccia web: gli eventi più recenti, tutti i campi di un evento e, con Semaphore Pro, filtri ed esportazione in CSV o JSON Lines."
---

# Visualizzare il log di audit

Gli amministratori aprono **Audit log** dal menu utente. Gli eventi più recenti vengono per primi, 50 per pagina.

![Il log di audit, con gli eventi più recenti per primi](/assets/audit-log-list.png)

Fai clic su un evento per vedere tutti i suoi campi. Il pulsante di copia copia l'evento nel formato che
Semaphore invia a un SIEM.

![Un evento con tutti i suoi campi](/assets/audit-log-card.png)

## Filtrare ed esportare <FeatureState feature="audit-log-filters" /> {#filter-export}

Filtra per periodo, utente, tipo di evento, risultato, progetto o indirizzo IP. In un evento, l'utente,
l'indirizzo, l'oggetto e il progetto sono link che filtrano il log in base a essi.

![Il log filtrato per l'indirizzo di un evento](/assets/audit-log-filters.png)

Quando una combinazione di filtri trova pochi eventi, Semaphore cerca per due secondi alla volta e mostra fino a
dove è arrivato. Fai clic su **Search older** per proseguire.

**Export** salva tutti gli eventi che corrispondono ai filtri come file CSV o JSON Lines. Ogni esportazione viene
registrata come evento `audit.log/export`.

![Esportazione come CSV o JSON Lines](/assets/audit-log-export.png)
