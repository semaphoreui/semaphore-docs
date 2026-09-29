---
title: Audit-Log
description: Das Sicherheits-Audit-Log, das Semaphore für Anmeldungen, MFA, Benutzer, Berechtigungen, API-Tokens und Einstellungen führt, und wie Sie es einschalten.
---

# Audit-Log

Das Audit-Log ist ein Sicherheits-Audit-Trail: wer was getan hat, von wo, an welchem Objekt und mit welchem
Ergebnis. Sicherheitsanalysten und Compliance-Teams lesen es, meist in einem SIEM. Jedes Ereignis hat ein
stabiles, dokumentiertes Schema, sodass ein Analyst Erkennungsregeln schreiben kann, ohne die Interna von
Semaphore zu kennen.

Das Audit-Log ist vom [Aktivitätsprotokoll](/admin-guide/logs) getrennt. Das Aktivitätsprotokoll ist ein
Feed für die Benutzer eines Projekts. Das Audit-Log ist ein Trail für die Personen, die prüfen, ob das System
richtig verwendet wird.

## Funktionsweise {#overview}

Wenn das Audit-Log eingeschaltet ist, zeichnet Semaphore für jede sicherheitsrelevante Aktion, die über die
Weboberfläche oder die API kommt, ein Ereignis auf: An- und Abmeldungen, MFA-Prüfungen, Änderungen an
Benutzern, Projektmitgliedern, Rollen und Berechtigungen, API-Tokens und Systemeinstellungen. Abgelehnte
Anfragen werden ebenfalls aufgezeichnet: eine fehlgeschlagene Anmeldung, ein unbekanntes oder abgelaufenes
API-Token, eine verweigerte Berechtigung, eine blockierte Cross-Site-Anfrage.

Die Ereignisse werden in der Semaphore-Datenbank gespeichert. Semaphore Pro kann sie an ein SIEM senden,
siehe [Export an ein SIEM](#siem-export).

## Ereignisschema {#event-schema}

Jedes Ereignis ist ein JSON-Objekt mit denselben Feldern. Die Liste der Ereignisse mit ihren Ergebnissen,
Gründen und Metadaten finden Sie unter [Audit-Ereignisse](/reference/audit-events).

| Feld | Beschreibung |
| --- | --- |
| `event_id` | Eindeutige ID des Ereignisses. Damit entfernen Sie Duplikate im SIEM. |
| `seq` | Lückenlose Sequenznummer, die mit jedem Ereignis wächst. Damit ordnen Sie Ereignisse. |
| `timestamp` | Zeitpunkt des Ereignisses in UTC. |
| `schema_version` | Version dieses Schemas. Sie ändert sich nur, wenn ein Feld umbenannt, entfernt oder umtypisiert wird. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system` oder `audit`. |
| `event_code` | Worum es im Ereignis geht, zum Beispiel `iam.api_token`. |
| `type` | Art der Änderung: `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied` oder `info`. |
| `action` | Was getan wurde, zum Beispiel `create`. |
| `outcome` | `success` oder `failure`. |
| `reason` | Warum die Aktion fehlgeschlagen ist, aus einer festen Liste je Ereignis. Leer bei Erfolg. |
| `actor` | Wer gehandelt hat: sein `type` (`user`, `anonymous`, `system`, `runner`, `integration`), `id` und `name`. Für einen Benutzer auch `auth` (`session` oder `api_token`) und für ein API-Token `token_fingerprint`. |
| `source` | Für Anfragen an die Weboberfläche und die API: `ip` und `user_agent` des Clients. |
| `target` | Das Objekt der Aktion: sein `type`, `id` und `name`. |
| `scope` | Die `project_id` für Ereignisse innerhalb eines Projekts. |
| `request_id` | ID der HTTP-Anfrage. Semaphore gibt sie auch im Antwort-Header `X-Request-ID` zurück. |
| `instance_id` | Name dieser Semaphore-Installation aus `audit.instance_id`. |
| `node_id` | Knoten, der das Ereignis aufgezeichnet hat, wenn [Hochverfügbarkeit](/admin-guide/ha) aktiv ist. |
| `metadata` | Zusätzliche Details, die vom Ereignis abhängen. |

`timestamp` ist die Zeit der Datenbank, in Mikrosekunden, auf SQLite in Millisekunden. Ordnen Sie Ereignisse
nach `seq`: Zwei Ereignisse können dieselbe Zeit haben, aber nie dieselbe `seq`.

Unter MySQL verwendet die Spalte `created` der Tabelle `audit_event` die Zeitzone der Verbindungsoption
`loc`, standardmäßig UTC. Der `timestamp` jedes Ereignisses ist immer in UTC.

Jeder Start des Servers zeichnet `audit.lifecycle` mit der Aktion `start` auf. Es gibt kein Stopp-Ereignis:
Ein Stopp, ein Absturz oder das Ausschalten des Audit-Logs zeigt sich als Zeitlücke vor dem nächsten `start`.

## Was nie aufgezeichnet wird {#never-recorded}

Das Audit-Log enthält nie Passwörter, Einmalcodes, TOTP-Geheimnisse und QR-Codes, Wiederherstellungscodes,
Sitzungs-Cookies, Tokens, OAuth-Codes und -Claims, private Schlüssel, Passphrasen, Werte von Secrets,
Umgebungs- und Umfragewerte, Webhook-Inhalte, Task-Ausgaben, E-Mail-Adressen oder URLs. Ein API-Token wird
nur über seinen Fingerabdruck identifiziert: die ersten 16 Hex-Zeichen seines SHA-256-Hashs.

Die Benutzer-ID und der Benutzername identifizieren den Handelnden. Eine fehlgeschlagene Anmeldung zeichnet
den eingegebenen Login auf, gekürzt auf 64 Bytes, weil die Untersuchung fehlgeschlagener Anmeldungen ihn
braucht.

## Audit-Log einschalten {#enable}

Setzen Sie `audit.enabled` und geben Sie der Installation in `audit.instance_id` einen Namen. Der Name hat 1
bis 255 druckbare ASCII-Zeichen ohne Leerzeichen und erscheint in jedem Ereignis.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Oder mit Umgebungsvariablen:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Starten Sie Semaphore neu, um die Änderung zu übernehmen. Alle Optionen finden Sie unter
[Konfiguration](/reference/configuration).

## Client-Adresse hinter einem Reverse Proxy {#trusted-proxies}

Hinter einem Reverse Proxy ist der direkte Gegenüber von Semaphore der Proxy, und die Client-Adresse kommt aus
dem Header `X-Forwarded-For` oder `X-Real-IP`. Semaphore liest diese Header nur, wenn der direkte Gegenüber in
`audit.trusted_proxy_cidrs` liegt. Sonst zeichnet es die Adresse des Gegenübers auf, sodass ein Client seine
Adresse nicht fälschen kann.

Tragen Sie in `audit.trusted_proxy_cidrs` nur Ihre Reverse Proxies ein, nie Client-Netze. Ein Client in einem
vertrauenswürdigen Bereich kann jede Adresse in `X-Forwarded-For` eintragen.

Aufgezeichnet wird die Adresse ganz rechts in `X-Forwarded-For`, die kein vertrauenswürdiger Proxy ist.
`X-Real-IP` wird nur ohne `X-Forwarded-For` verwendet und nur, wenn es einen einzigen Wert hat.

## Speicherung {#storage}

Ereignisse werden in der Semaphore-Datenbank gespeichert und nie gelöscht: Diese Version hat keine
Aufbewahrungsfrist. Planen Sie die Größe der Datenbank für die Zahl der Anmeldungen und Änderungen in Ihrer
Installation.

## Compliance-Zuordnung {#compliance}

Semaphore zeichnet die Ereignisse auf, die Sie für diese Kontrollen brauchen. Es macht Ihre Installation nicht
von selbst konform.

| Anforderung | Abgedeckt durch | Status |
| --- | --- | --- |
| PCI DSS 10.2.1.1 Zugriff auf sensible Daten (Analogon: Secrets) | `iam.mfa/view_qr` | Verfügbar |
| PCI DSS 10.2.1.1 Zugriff auf sensible Daten (Analogon: Secrets) | `resource.project_backup/export` | Geplant |
| PCI DSS 10.2.1.2 Aktionen von Administratoren / ISO 27002 8.15 Verwendung von Privilegien | `iam.*`, `system.*` | Verfügbar |
| PCI DSS 10.2.1.2 Aktionen von Administratoren / ISO 27002 8.15 Verwendung von Privilegien | `resource.*`, `secret.*` | Geplant |
| PCI DSS 10.2.1.2 Aktionen von Administratoren / ISO 27002 8.15 Verwendung von Privilegien | `runner.*`, `task.control`, `task.history` | Geplant |
| PCI DSS 10.2.1.3 Zugriff auf Audit-Logs | Nicht anwendbar: Semaphore gibt keinen Zugriff auf den Audit-Trail. | — |
| PCI DSS 10.2.1.4 ungültige logische Zugriffsversuche / ISO abgelehnte Zugriffsversuche | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Verfügbar |
| PCI DSS 10.2.1.4 ungültige logische Zugriffsversuche / ISO abgelehnte Zugriffsversuche | `runner.lifecycle/register` failure | Geplant |
| PCI DSS 10.2.1.5 Änderungen an Identifikations- und Authentifizierungsdaten | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Verfügbar |
| PCI DSS 10.2.1.5 Änderungen an Identifikations- und Authentifizierungsdaten | `runner.credential` | Geplant |
| PCI DSS 10.2.1.6 Start, Stopp und Pause von Audit-Logs / ISO Aktivierung von Sicherheitssystemen | `audit.lifecycle/start`; ein Stopp zeigt sich als Lücke davor | Verfügbar |
| PCI DSS 10.2.1.7 Erstellen und Löschen von Objekten auf Systemebene | `resource.*` create/delete | Geplant |
| PCI DSS 10.2.1.7 Erstellen und Löschen von Objekten auf Systemebene | `runner.lifecycle` create/delete | Geplant |
| PCI DSS 10.2.2 Pflichtfelder | `actor`, `event_code` und `action`, `timestamp`, `outcome`, `source` oder `node_id`, `target` oder `scope` | Verfügbar |
| PCI DSS 10.3.3 zeitnahe Sicherung auf einen zentralen Log-Server | Export an ein SIEM über Syslog+TLS | Verfügbar |
| PCI DSS 10.3.3 zeitnahe Sicherung auf einen zentralen Log-Server | Export an ein SIEM über Splunk HEC | Geplant |

Geplante Ereignisse werden in dieser Version nicht aufgezeichnet.

## Was in dieser Version nicht aufgezeichnet wird {#not-recorded}

- Aktionen mit dem Befehl `semaphore` auf dem Server, etwa `user add` oder `user token`. Sie ändern die
  Datenbank direkt, und wer sie ausführen kann, kann auch die Audit-Tabelle ändern.
- Entfernen der Lizenz, Laufzeiteinstellungen von Apps, Löschen des HA-Task-Zustands, Aliase von
  Terraform-Inventaren, Workflow-Läufe und Projekteinladungen. Für sie gibt es noch kein Audit-Ereignis.

## Export an ein SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro sendet das Audit-Log über Syslog mit TLS an ein SIEM. Es merkt sich seine Position im Log für das
SIEM, sodass Ereignisse, die aufgezeichnet werden, während das SIEM nicht erreichbar ist, gesendet werden,
sobald es wieder erreichbar ist. Die Schritte finden Sie unter
[Audit-Log an ein SIEM senden](/admin-guide/audit-log-siem).

## Nächste Schritte {#whats-next}

- [Audit-Log an ein SIEM senden](/admin-guide/audit-log-siem) — die Ereignisse über Syslog+TLS exportieren.
- [Audit-Ereignisse](/reference/audit-events) — jedes Ereignis mit Ergebnissen, Gründen und Metadaten.
- [Konfiguration](/reference/configuration) — jede Option `audit.*`.
