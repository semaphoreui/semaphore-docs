---
title: Editionen
description: Was Semaphore Community, Pro und Enterprise umfassen und welche Funktionen ein kostenpflichtiges Abonnement erfordern.
---

import EditionsTable from '@site/src/components/EditionsTable';

# Editionen

Semaphore wird in drei Editionen aus einer einzigen Codebasis und mit einer einzigen
Dokumentation ausgeliefert. Alles, was in dieser Dokumentation beschrieben ist, ist in
**Community** verfügbar, sofern die Seite oder der Abschnitt kein Editions-Abzeichen trägt.

| Edition | Was sie ist |
|---|---|
| **Community** | Die Open-Source-Edition. Kostenlos, selbst gehostet, ohne Lizenzschlüssel. Alles, was nicht in der Tabelle unten aufgeführt ist. |
| **Pro** | Ergänzt Workflows, Projekt-Runner, externe Secret-Speicher, Container-Executoren und strukturiertes Logging. |
| **Enterprise** | Ergänzt Hochverfügbarkeit, erweitertes RBAC mit eigenen Rollen, den Kubernetes-Executor und Enterprise-Secret-Speicher. |

Pro und Enterprise werden mit einem Lizenzschlüssel aktiviert, siehe
[Lizenz](/admin-guide/license). Welche Edition Ihr Server ausführt, sehen Sie im
Kontomenü, siehe [Ihr Konto](/user-guide/account).

## Funktionsmatrix {#feature-matrix}

Funktionen, die eine kostenpflichtige Edition erfordern. Eine Funktion, die hier nicht
aufgeführt ist, ist in jeder Edition verfügbar.

<EditionsTable />

## Wie Editionen in dieser Dokumentation markiert sind {#how-editions-are-marked}

Ein Abzeichen neben einer Überschrift bedeutet, dass die darunter beschriebene Funktion
diese Edition benötigt:

- <Pro /> kennzeichnet eine Pro-Funktion.
- <Enterprise /> kennzeichnet eine Enterprise-Funktion.

Ein Abzeichen kann außerdem die Version angeben, in der die Funktion erschienen ist, zum
Beispiel <FeatureState feature="extended-rbac" />. Ein Klick auf ein Abzeichen bringt Sie
zurück auf diese Seite.
