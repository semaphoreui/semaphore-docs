---
title: Edizioni
description: Cosa includono Semaphore Community, Pro ed Enterprise e quali funzionalità richiedono un abbonamento a pagamento.
---

import EditionsTable from '@site/src/components/EditionsTable';

# Edizioni

Semaphore viene distribuito in tre edizioni a partire da un'unica base di codice e da
un'unica documentazione. Tutto ciò che è descritto in questa documentazione è disponibile
in **Community**, a meno che la pagina o la sezione non riporti un badge di edizione.

| Edizione | Che cos'è |
|---|---|
| **Community** | L'edizione open source. Gratuita, self-hosted, senza chiave di licenza. Tutto ciò che non è elencato nella tabella sottostante. |
| **Pro** | Aggiunge i Workflow, i runner di Project, gli archivi di segreti esterni, gli executor per container e il logging strutturato. |
| **Enterprise** | Aggiunge l'alta disponibilità, l'RBAC esteso con ruoli personalizzati, l'executor Kubernetes e gli archivi di segreti enterprise. |

Pro ed Enterprise vengono attivati con una chiave di licenza, vedere
[Licenza](/admin-guide/license). L'edizione eseguita dal proprio server è indicata nel
menu dell'account, vedere [Il proprio account](/user-guide/account).

## Matrice delle funzionalità {#feature-matrix}

Funzionalità che richiedono un'edizione a pagamento. Una funzionalità non elencata qui è
disponibile in tutte le edizioni.

<EditionsTable />

## Come sono indicate le edizioni in questa documentazione {#how-editions-are-marked}

Un badge accanto a un titolo indica che la funzionalità descritta di seguito richiede
quell'edizione:

- <Pro /> contrassegna una funzionalità Pro.
- <Enterprise /> contrassegna una funzionalità Enterprise.

Un badge può anche riportare la versione in cui la funzionalità è comparsa, per esempio
<FeatureState feature="extended-rbac" />. Facendo clic su un badge si torna a questa
pagina.
