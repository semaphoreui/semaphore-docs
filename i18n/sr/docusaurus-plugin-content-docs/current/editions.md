---
title: Izdanja
description: Šta obuhvataju Semaphore Community, Pro i Enterprise i koje funkcije zahtevaju plaćenu pretplatu.
---

import EditionsTable from '@site/src/components/EditionsTable';

# Izdanja

Semaphore se isporučuje u tri izdanja iz jedne kodne baze i sa jednom
dokumentacijom. Sve što je opisano u ovoj dokumentaciji dostupno je u izdanju
**Community**, osim ako stranica ili sekcija nosi oznaku izdanja.

| Izdanje | Šta je to |
|---|---|
| **Community** | Izdanje otvorenog koda. Besplatno, samostalno hostovano, bez licencnog ključa. Sve što nije navedeno u tabeli ispod. |
| **Pro** | Dodaje tokove rada, runnere na nivou projekta, eksterna skladišta tajni, izvršioce u kontejnerima i strukturirano logovanje. |
| **Enterprise** | Dodaje visoku dostupnost, prošireni RBAC sa prilagođenim rolama, Kubernetes izvršioca i skladišta tajni za velike organizacije. |

Pro i Enterprise se aktiviraju licencnim ključem, vidite
[Aktivacija licence](/admin-guide/license). Izdanje u kojem radi vaš server
prikazano je u meniju naloga, vidite [Vaš nalog](/user-guide/account).

## Matrica funkcija {#feature-matrix}

Funkcije koje zahtevaju plaćeno izdanje. Funkcija koja nije navedena ovde dostupna
je u svim izdanjima.

<EditionsTable />

## Kako su izdanja označena u ovoj dokumentaciji {#how-editions-are-marked}

Oznaka pored naslova znači da funkcija ispod nje zahteva to izdanje:

- <Pro /> označava funkciju izdanja Pro.
- <Enterprise /> označava funkciju izdanja Enterprise.

Oznaka može sadržati i verziju u kojoj se funkcija pojavila, na primer
<FeatureState feature="extended-rbac" />. Klik na oznaku vraća vas na ovu
stranicu.
