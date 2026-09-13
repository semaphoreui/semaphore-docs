---
title: Sicherheitsmodell
description: Was Semaphore schützt, welche Vertrauensgrenzen es in einer Installation gibt, wer Code zur Ausführung bringen kann und welche Entscheidungen bei Ihnen liegen.
---

# Sicherheitsmodell

Semaphore verwahrt die Zugangsdaten zu Ihrer Infrastruktur und führt Code gegen sie aus.
Daraus ergeben sich zwei Eigenschaften, die jede weitere Entscheidung auf dieser Seite
prägen: **Secrets dürfen niemals zu einem Browser zurückgelangen**, und **wer einen Task
starten kann, kann Code auf den Maschinen ausführen, die dieser Task erreicht**.

Diese Seite erläutert das Modell. Die Einstellungen, die es umsetzen, finden Sie unter
[Sicherheit](/admin-guide/security).

## Vertrauensgrenzen {#trust-boundaries}

| Grenze | Überschritten von | Geschützt durch |
|---|---|---|
| Browser ↔ Server | Sitzungen, API-Tokens | TLS, sichere Cookies, [Reverse Proxy](/admin-guide/reverse-proxy) |
| Server ↔ Datenbank | Sämtlicher persistenter Zustand | Netzwerkbeschränkung; Secrets werden vor dem Schreiben verschlüsselt |
| Server ↔ Runner | Job-Payloads, einschließlich Secrets | HTTPS und ein Bearer-Token pro Runner |
| Task ↔ verwaltete Hosts | Ihre Automatisierung | Die Schlüssel, die Sie dem Template gegeben haben |

Ein Task befindet sich jenseits jeder dieser Grenzen. Er erhält die benötigten Secrets in
seiner Umgebung, und von diesem Moment an entscheidet der Code in Ihrem Repository, was
mit ihnen geschieht.

## Identität {#identity}

Benutzer authentifizieren sich auf eine von drei Arten, und alle drei enden in derselben
Sitzung:

- **Lokale Konten.** Passwörter werden mit Argon2id gehasht (vor 2.20 mit bcrypt, beim
  ersten Anmelden umgestellt). TOTP-Zwei-Faktor-Authentifizierung kann verpflichtend sein.
- **[LDAP oder Active Directory](/admin-guide/ldap).** Das Verzeichnis prüft das Passwort;
  Semaphore behält nur das Konto.
- **[OpenID Connect](/admin-guide/openid).** Der Provider authentifiziert, und Semaphore
  bildet Claims auf Benutzer ab.

Nicht-interaktiver Zugriff erfolgt über **API-Tokens**, die ein Benutzer erstellt und die
dessen Berechtigungen tragen. Runner verwenden überhaupt keine Benutzeridentität: Sie
authentifizieren sich mit ihrem eigenen, bei der Registrierung ausgestellten Token.

Auch Tasks können eine Identität tragen. Mit [Task-JWTs](/user-guide/task-templates/jwt)
erhält ein Lauf ein kurzlebiges signiertes Token, das Projekt, Template und Benutzer
benennt und das ein externer Secret-Speicher prüfen kann, statt dass Sie dort ein
langlebiges Zugangsdatum hinterlegen.

## Autorisierung {#authorization}

Es gibt zwei Ebenen, und sie sind voneinander unabhängig.

**Serverebene.** Ein Administrator verwaltet Benutzer, globale Runner und
Servereinstellungen. Serveradministrator zu sein bedeutet für sich genommen keine
Mitgliedschaft in einem Projekt.

**Projektebene.** Jedes Mitglied hat in jedem Projekt genau eine Rolle:

| Rolle | Darf |
|---|---|
| **Owner** | Alles im Projekt, einschließlich Mitglieder und Löschung. |
| **Manager** | Tasks ausführen sowie Ressourcen und Templates verwalten. |
| **Task Runner** | Tasks ausführen. Sonst nichts. |
| **Guest** | Lesen. |

Enterprise ergänzt [benutzerdefinierte Rollen](/user-guide/team) <FeatureState feature="extended-rbac" />,
wenn diese vier zu grob sind.

Die sicherheitsrelevante Trennlinie verläuft zwischen **Task Runner** und **Manager**.
Ein Manager kann ändern, was ein Template ausführt, und damit beliebigen Code mit den
Zugangsdaten dieses Projekts ausführen. Ein Task Runner kann nur starten, was bereits
existiert — es sei denn, das Template bietet Prompts oder Survey-Variablen an, die bis auf
die Kommandozeile durchschlagen; in diesem Fall hat die Autorin oder der Autor des
Template diese Grenze bewusst geöffnet.

## Secrets {#secrets}

Geheime Werte — private SSH-Schlüssel, Passwörter, Tokens, geheime Variablen — werden vor
dem Speichern mit dem Schlüssel aus `access_key_encryption` verschlüsselt, sodass ein
Datenbank-Dump allein sie nicht preisgibt. Die API gibt niemals einen geheimen Wert
zurück; die UI zeigt, dass ein Secret gesetzt ist, nicht welches.

Secrets erreichen einen Task beim Start über dessen Umgebung. Deshalb sollte die
Task-Ausgabe als sensibel behandelt werden: Ein Playbook, das eine Variable ausgibt,
schreibt sie in ein Log, das andere Projektmitglieder lesen können.

Wenn Sie die Secrets lieber gar nicht selbst vorhalten möchten, bewahren
[externe Secret-Speicher](/user-guide/key-store) die Werte in HashiCorp Vault,
OpenBao, AWS Secrets Manager oder Devolutions Server auf und holen sie pro Lauf ab.

## Nicht vertrauenswürdigen Code ausführen {#executing-untrusted-code}

In der Standardkonfiguration ist ein Task ein Prozess auf dem Semaphore-Server, mit dessen
Dateisystem und dessen Netzwerkzugriff. Das ist angemessen, wenn allen, die ein Template
bearbeiten dürfen, ohnehin der Server anvertraut ist.

Ist das nicht der Fall, verlagern Sie die Ausführung vom Server weg:

- Ein [Runner](/admin-guide/runners) führt Tasks auf einer anderen Maschine aus, sodass die
  Kompromittierung eines Task weder den Webdienst noch die Datenbank kompromittiert.
- Der **Docker**- oder **Kubernetes**-Executor gibt jedem Job einen frischen Container bzw.
  Pod, sodass ein Lauf weder die Dateien eines anderen Laufs noch die des Hosts lesen kann.
- Getrennte Projekte mit getrennten Schlüsseln bedeuten, dass ein Task nur erreichen kann,
  was die Zugangsdaten seines eigenen Projekts erlauben.

:::warning
Ein Repository, das ein Projektmitglied ändern kann, ist Code, der mit den Zugangsdaten
dieses Projekts ausgeführt wird. Schützen Sie den Branch, aus dem ein Template baut, oder
richten Sie Templates auf einen Branch aus, in den nur Reviewer schreiben können.
:::

## Was bei Ihnen liegt {#what-is-left-to-you}

Semaphore wird selbst gehostet, daher müssen Sie Teile des Modells selbst beisteuern:

- TLS vor dem Dienst, entweder integriert oder über einen [Reverse Proxy](/admin-guide/reverse-proxy).
- Netzwerkbeschränkung der Datenbank und der Administrationsoberfläche des Servers.
- Sicherungen der Datenbank und von `access_key_encryption` — das Zweite ist ohne das Erste
  nutzlos, und das Erste ist ohne das Zweite nicht lesbar.
- Die Version aktuell halten. Melden Sie Schwachstellen an `security@semaphoreui.com`.

## Wie es weitergeht {#whats-next}

- [Sicherheit](/admin-guide/security) — die konkreten Einstellungen, Hashing-Parameter und Härtungsschritte.
- [Architektur](/introduction/architecture) — die Komponenten, die diese Grenzen trennen.
- [Teams](/user-guide/team) — Rollen in einem Projekt zuweisen.
