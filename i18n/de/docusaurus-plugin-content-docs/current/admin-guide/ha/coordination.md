---
title: Cluster-Koordination
description: Wie sich Semaphore-HA-Knoten über Redis koordinieren, mit jedem gemeinsamen Schlüssel, jeder Sperre und jedem Pub/Sub-Kanal und deren Lebensdauer.
---

# Cluster-Koordination <Enterprise />

Semaphore-Knoten kommunizieren nie direkt miteinander. Alles, worüber sie sich einigen müssen, läuft über Redis: wer am Leben ist, welcher Task zu welchem Knoten gehört, wer einen Zeitplan auslöst und welche UI-Nachrichten weiterzuleiten sind. Jeder Teil dieses Zustands ist eine kleine Menge von Redis-Schlüsseln mit Ablaufzeit, sodass ein abgestürzter Knoten nichts für lange Zeit zurücklassen kann. Die dauerhaften Daten (Tasks, Vorlagen, Logs, Runner) liegen immer in der Datenbank; Redis hält nur den Koordinationszustand.

Alle Schlüssel verwenden die festen Präfixe `ha:` und `tasks:`. Sie sind nicht konfigurierbar, daher müssen zwei Semaphore-Cluster, die sich einen Redis-Server teilen, unterschiedliche Datenbanknummern (`ha.redis.db`) verwenden.

## Knotenregister {#node-registry}

Jeder Knoten registriert sich beim Start und aktualisiert seinen Eintrag anschließend alle 10 Sekunden. Der Eintrag läuft nach 30 Sekunden ab, sodass ein Knoten, der ihn nicht mehr aktualisiert, nach spätestens einer halben Minute als tot gilt. Bei einem geordneten Herunterfahren entfernt der Knoten seinen Eintrag sofort.

| Schlüssel | Typ | Zweck |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Heartbeat eines Knotens: `node_id`, `started_at`, `version`, `last_beat`. Läuft 30 s nach der letzten Aktualisierung ab. |
| `ha:nodes` | set | IDs aller registrierten Knoten. Mitglieder, deren Heartbeat-Schlüssel abgelaufen ist, werden von den anderen Knoten entfernt. |

Das Knotenregister ist das, was das Cluster-Dashboard anzeigt, und das, was der Orphan-Cleaner (siehe unten) heranzieht, um zu entscheiden, ob der Besitzer eines Tasks noch am Leben ist.

## Task-Warteschlange und laufende Tasks {#task-queue}

Die Task-Warteschlange ist gemeinsam, sodass ein auf einem Knoten gestarteter Task von jedem anderen Knoten verteilt, überwacht und abgeschlossen werden kann. Redis speichert nur Task-IDs und einige wenige flüchtige Felder; der Task selbst wird von dem Knoten, der ihn benötigt, aus der Datenbank geladen.

| Schlüssel | Typ | Zweck |
| --- | --- | --- |
| `tasks:queue` | list | IDs der Tasks, die auf ihre Verteilung warten, in Reihenfolge. |
| `tasks:claim:<task_id>` | string | ID des Knotens, dem der Task gehört. Wird atomar zusammen mit dem Entfernen aus der Warteschlange geschrieben, sodass ein Task von genau einem Knoten übernommen wird. Läuft nach 5 Minuten ab; der Besitzer aktualisiert ihn jede Minute. |
| `tasks:running` | set | IDs der Tasks, die gerade laufen. |
| `tasks:active:<project_id>` | set | IDs der Tasks, die in einem Projekt aktiv sind (wartend oder laufend). Wird für die Parallelitätsgrenzen pro Projekt verwendet. |
| `tasks:task_project` | hash | `task_id` → `project_id`, damit jeder Knoten den Task aus der Datenbank laden kann. |
| `tasks:aliases` | hash | `alias` → `task_id` für Tasks, die über einen Alias angesprochen werden. |
| `tasks:runtime:<task_id>` | hash | Felder, die sich während der Ausführung des Tasks ändern, etwa die Runner-ID und der Benutzer, der ihn gestartet hat. |
| `tasks:finalize:<task_id>` | string | Sperre, die der Knoten nimmt, der das Endergebnis eines auf einem Remote-Runner ausgeführten Tasks schreibt. Läuft nach 5 Minuten ab. |

Einträge in `tasks:task_project`, `tasks:aliases` und `tasks:runtime:*` werden entfernt, wenn der Task endet, und laufen zusätzlich als Sicherheitsnetz nach 7 Tagen ab.

Ein Knoten nimmt einen Task mit einer einzigen atomaren Operation aus der Warteschlange: Er prüft, dass der Task noch in der Warteschlange steht, schreibt den Claim, entfernt den Task aus der Warteschlange und fügt ihn zur Menge der laufenden Tasks hinzu. Versuchen es zwei Knoten gleichzeitig, hat nur einer Erfolg.

**Orphan-Cleaner.** Einmal pro Minute prüft jeder Knoten die laufenden Tasks, deren Besitzer tot ist, das heißt, der Claim ist abgelaufen oder der Heartbeat des Besitzers ist verschwunden. Ein Task, den die Datenbank bereits als beendet ausweist, wird einfach aus Redis entfernt. Ein Task, der nie an einen Runner übergeben wurde, wird zurück in die Warteschlange gestellt, damit ein lebender Knoten ihn verteilt. Ein Task, der bereits auf einem Runner ausgeführt wird, bleibt unangetastet: Der Runner arbeitet weiter, und der Task wird aufgeräumt, sobald die Datenbank ihn als beendet ausweist.

## Sperren {#locks}

Sperren sind einzelne Schlüssel, die mit `SET NX` erstellt werden: Der Knoten, dem es gelingt, den Schlüssel anzulegen, hält die Sperre. Jede Sperre hat eine Ablaufzeit, und lange gehaltene Sperren werden von ihrem Besitzer aufgefrischt, sodass ein abgestürzter Knoten seine Sperren automatisch freigibt.

| Schlüssel | Ablauf | Zweck |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Eine Sperre pro Zeitplan und Minute. Der Knoten, der sie anlegt, löst den Zeitplan aus; die anderen überspringen ihn. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, alle 10 s aufgefrischt | Nur ein Knoten treibt einen bestimmten Workflow-Lauf zu einem Zeitpunkt voran. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Kurze Sperre, während ein neuer Workflow-Lauf erstellt wird, damit zwei Knoten denselben Workflow nicht zweimal starten. |
| `ha:audit:export:<destination_id>` | 30 s, alle 10 s aufgefrischt | Nur ein Knoten exportiert Audit-Ereignisse an ein bestimmtes Ziel. Ist Redis nicht verfügbar, exportiert kein Knoten, sodass Ereignisse nie doppelt gesendet werden. |

Zeitplan- und Workflow-Sperren verhalten sich im Fehlerfall offen (fail open): Ist Redis nicht erreichbar, fährt der Knoten fort, statt die Arbeit zu überspringen, und die bedingten Aktualisierungen in der Datenbank halten das Ergebnis korrekt. Die Lease für den Audit-Export verhält sich im Fehlerfall geschlossen (fail closed), weil ein doppelter Export nicht rückgängig gemacht werden kann.

## Pub/Sub-Kanäle {#pubsub-channels}

| Kanal | Zweck |
| --- | --- |
| `ha:ws:broadcast` | WebSocket-Nachrichten für die Benutzeroberfläche. Ein Knoten stellt eine Nachricht an seine eigenen verbundenen Browser zu und veröffentlicht sie hier; die anderen Knoten leiten sie an ihre Browser weiter. |
| `tasks:events` | Änderungen in der Task-Warteschlange und in der Menge der laufenden Tasks, Aktualisierungen der Laufzeitfelder und Anfragen zum erzwungenen Stopp. Die Knoten nutzen diese Ereignisse, um ihre Sicht auf die Warteschlange im Speicher aktuell zu halten und einen Task zu stoppen, dessen Stopp ein anderer Knoten angefordert hat. |

Nachrichten tragen die ID des sendenden Knotens, sodass ein Knoten seine eigenen Nachrichten ignoriert.

## Schlüssel des Runner-Caches {#runner-cache-keys}

Die Schlüssel `ha:runner:*` gehören zum gemeinsamen Cache der Runner-Datensätze. Weitere Informationen finden Sie unter [Runner-Authentifizierungscache](/admin-guide/ha/runner-cache).

## Verwandte Seiten {#related-pages}

- [Hochverfügbarkeit](/admin-guide/ha) — Architektur, Konfiguration und Einrichtung des Load Balancers.
- [Runner-Authentifizierungscache](/admin-guide/ha/runner-cache) — der gemeinsame Cache der Runner-Datensätze.
