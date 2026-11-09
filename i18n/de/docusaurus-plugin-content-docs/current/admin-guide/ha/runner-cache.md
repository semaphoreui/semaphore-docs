---
title: Runner-Authentifizierungscache
description: Warum Semaphore Runner-Datensätze nach Token zwischenspeichert, wie HA-Knoten den Cache über Redis teilen, wann Einträge verworfen werden und was bei einem Redis-Ausfall passiert.
---

# Runner-Authentifizierungscache

Jede Anfrage, die ein [Runner](/admin-guide/runners) an den Server sendet, trägt sein Token, und der Server muss dieses Token in einen Runner-Datensatz auflösen, bevor er irgendetwas anderes tun kann. Runner fragen alle paar Sekunden nach und melden während eines laufenden Jobs jede Sekunde ihren Fortschritt, sodass ohne Cache jede dieser Anfragen eine Datenbankabfrage kosten würde. Der Runner-Cache beantwortet die meisten davon aus dem Speicher.

Ein einzelner Knoten hält den Cache in seinem eigenen Speicher. Im HA-Modus reicht das nicht aus: Wenn Sie einen Runner auf Knoten A bearbeiten, darf Knoten B nicht weiterhin den alten Datensatz ausliefern. Deshalb liegt der Cache im HA-Modus in Redis und wird von allen Knoten gemeinsam genutzt, und eine über einen beliebigen Knoten vorgenommene Änderung ist für alle sofort sichtbar.

:::note
Dieser Cache ist nicht die Aktion **Cache leeren** auf der Seite „Runner“. Diese Aktion fordert den Runner selbst auf, die Arbeitsverzeichnisse auf seiner Maschine zu löschen.
:::

## Was wie lange zwischengespeichert wird {#runner-cache-ttl}

Der zwischengespeicherte Wert ist der Runner-Datensatz ohne seine Tags und ohne das Token. Das Token gelangt nie nach Redis: Der Schlüssel wird aus einem SHA-256-Hash des Tokens abgeleitet, und das Token-Feld wird geleert, bevor der Datensatz gespeichert wird.

Ein Eintrag lebt höchstens 30 Sekunden. In der Praxis wird er deutlich früher verworfen, weil jede über Semaphore vorgenommene Änderung den Cache sofort invalidiert:

* Das Erstellen, Aktualisieren, Löschen oder erneute Registrieren eines Runners sowie das Löschen eines Projekts verwirft **jeden** zwischengespeicherten Runner auf allen Knoten.
* Ein Runner-Heartbeat verwirft **nur den Eintrag dieses Runners**, sodass die gespeicherte „Zuletzt gesehen“-Zeit aktuell bleibt, ohne die anderen anzufassen. Ein Heartbeat wird höchstens einmal pro Intervall geschrieben; das Intervall ist ein Drittel von `runners.offline_timeout_sec`, begrenzt auf 45 Sekunden. Mit dem Standard-Timeout von 120 Sekunden ist das alle 40 Sekunden.

Die Ablaufzeit von 30 Sekunden spielt nur bei Änderungen an Semaphore vorbei eine Rolle, etwa beim direkten Bearbeiten der Tabelle `runner` oder beim Wiederherstellen eines Backups.

## Wie veraltete Schreibvorgänge verhindert werden {#runner-cache-generation}

Eine Abfrage, die den Cache verfehlt, liest den Runner aus der Datenbank und speichert ihn anschließend. Zwischen diesen beiden Schritten kann ein anderer Knoten den Runner ändern. Damit die Abfrage nie das zwischenspeichert, was sie vor der Änderung gelesen hat, führt der Cache einen Zähler, der bei jeder Invalidierung wächst. Die Abfrage merkt sich den Zählerwert, den sie vor dem Gang zur Datenbank gesehen hat, und das Speichern wird abgelehnt, wenn der Zähler in der Zwischenzeit weitergelaufen ist. Jeder Schritt läuft als ein einziges Lua-Skript in Redis, sodass Zähler und Eintrag zusammen gelesen und geschrieben werden.

## Redis-Schlüssel {#runner-cache-redis-keys}

| Schlüssel | Typ | Zweck |
| --- | --- | --- |
| `ha:runner:gen` | string, integer | Der Zähler. Wächst bei jeder Invalidierung um eins, egal ob des gesamten Caches oder eines einzelnen Runners. |
| `ha:runner:inv` | string, integer | Zählerwert bei der letzten vollständigen Invalidierung. Er ist Teil jedes Eintragsschlüssels, sodass eine vollständige Invalidierung alle vorhandenen Einträge auf einen Schlag unerreichbar macht; sie laufen dann von selbst ab. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binary | Der zwischengespeicherte Runner-Datensatz. Läuft nach 30 s ab. |
| `ha:runner:forgot:<sha256(token)>` | string, integer | Zählerwert beim letzten Heartbeat dieses Runners. Eine Abfrage, die vor dem Heartbeat begonnen hat, kann den Datensatz von vor dem Heartbeat nicht speichern. Läuft nach 30 s ab. |

Das Cluster-Dashboard meldet die Anzahl der Schlüssel `ha:runner:token:*` als Größe des Runner-Caches.

## Verhalten bei Redis-Problemen {#runner-cache-failures}

Der Cache lässt eine Runner-Anfrage nie fehlschlagen. Jede Cache-Operation ist auf 500 Millisekunden begrenzt; ist Redis langsam oder nicht erreichbar, wird die Abfrage als Fehltreffer behandelt und geht zur Datenbank, und nichts wird gespeichert. Der einzige Fall, den Sie kennen sollten, ist eine Invalidierung, die fehlschlägt, weil Redis genau in dem Moment ausgefallen ist, in dem ein Runner geändert wird: Andere Knoten können dann den alten Datensatz ausliefern, bis er abläuft, spätestens 30 Sekunden später. Der Fehler wird auf der Stufe „error“ protokolliert.

## Verwandte Seiten {#related-pages}

- [Hochverfügbarkeit](/admin-guide/ha) — Architektur, Konfiguration und Einrichtung des Load Balancers.
- [Cluster-Koordination](/admin-guide/ha/coordination) — die von den Knoten gemeinsam genutzten Redis-Schlüssel, Sperren und Kanäle.
- [Runner](/admin-guide/runners) — Runner registrieren und konfigurieren.
