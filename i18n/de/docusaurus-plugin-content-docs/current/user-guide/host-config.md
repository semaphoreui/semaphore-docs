---
title: Host config
description: Ordnen Sie einem Git-Host oder einer Repository-URL einen Zugangsschlüssel des Key Store zu, damit Submodule, Galaxy-Rollen, Terraform-Module und anderswo gehostete Inventar-Repositories mit ihrem eigenen Schlüssel erreichbar sind.
---

# Host config

Eine Aufgabe authentifiziert sich bei ihrem Repository mit dem Schlüssel, der im [Repository](/user-guide/repositories) ausgewählt ist. Alles andere, was die Aufgabe aus Git bezieht, erhält keine eigenen Zugangsdaten: ein Submodul auf einem anderen Server, eine Rolle aus `requirements.yml`, ein Terraform-Modul, ein Inventar in einem zweiten Repository. **Host config** (Host-Konfiguration) schließt diese Lücke. Eine Zuordnung bindet einen Git-Host oder eine Repository-URL an einen Zugangsschlüssel des [Key Store](/user-guide/key-store), und jede Git-Operation des Projekts verwendet ihn, sobald sie diesen Host oder diese URL erreicht.

Die Seite befindet sich im Projektmenü unterhalb von **Repositories**. Zum Hinzufügen, Bearbeiten und Löschen von Zuordnungen ist die Berechtigung zum Verwalten von Projektressourcen erforderlich, dieselbe, die auch der Key Store benötigt.

![Seite Host config eines Projekts mit drei Zuordnungen](/assets/host-config-page.webp)

## Zuordnungstypen {#mapping-types}

Klicken Sie auf **Add mapping** (Zuordnung hinzufügen) und wählen Sie aus, worauf die Zuordnung passen soll.

### Host {#host}

Eine Zuordnung vom Typ **Host** passt auf einen SSH-Hostnamen, zum Beispiel `github.com` oder `gitlab.example.com`, und benötigt einen **SSH**-Schlüssel. Immer wenn die Aufgabe eine SSH-Verbindung zu diesem Host öffnet, authentifiziert sie sich mit dem zugeordneten Schlüssel: bei einem über SSH geklonten Repository oder Submodul, bei einer `git@host:group/repo.git`-URL in `requirements.yml` und auch bei den Hosts eines Ansible-Inventars mit diesem Namen. Wenn der Schlüssel einen Login hat, wird dieser als SSH-Benutzer für den Host verwendet.

<div style={{maxWidth: 720}}>

![Dialog Add mapping mit ausgewähltem Typ Host](/assets/host-config-form-host.webp)

</div>

### URL {#url}

Eine Zuordnung vom Typ **URL** passt auf eine `https://`- oder `http://`-Repository-URL. Sie kann ein einzelnes Repository benennen, `https://gitlab.example.com/infra/network.git`, oder mit `/` enden, um alle Repositories einer Gruppe abzudecken, `https://gitlab.example.com/ansible/`. Passen mehrere Zuordnungen, gewinnt die spezifischste URL; eine Zuordnung für ein einzelnes Repository überschreibt also die Zuordnung der Gruppe, die es enthält.

Der Zugangsschlüssel entscheidet, wie die URL erreicht wird:

| Zugangsschlüssel | Was passiert |
|---|---|
| **SSH**-Schlüssel | Die URL wird in ihre SSH-Form umgeschrieben und die Verbindung authentifiziert sich mit dem Schlüssel. Der Login des Schlüssels ist der SSH-Benutzer, `git`, wenn der Schlüssel keinen hat. |
| **Anmeldung mit Passwort** | Login und Passwort werden der URL hinzugefügt und über HTTPS gesendet. Lassen Sie den Login leer, um ein Personal Access Token zu verwenden. Nur eine `https://`-URL akzeptiert diesen Zugangsschlüssel, damit das Secret niemals im Klartext übertragen wird. |

Die URL darf keine eigenen Zugangsdaten, Leerzeichen, Anführungszeichen oder ein `=`-Zeichen enthalten.

<div style={{maxWidth: 720}}>

![Dialog zum Bearbeiten einer URL-Zuordnung mit Anmeldung mit Passwort](/assets/host-config-form-url.webp)

</div>

## Wo Zuordnungen gelten {#where-mappings-apply}

Die Zuordnungen eines Projekts werden vor dem ersten Git-Befehl einer Aufgabe eingerichtet und bleiben bis zu deren Ende wirksam. Sie gelten für:

- das Klonen und Aktualisieren des Repositories der Vorlage, einschließlich seiner Submodule;
- Rollen und Collections, die aus `requirements.yml` installiert werden, siehe [Galaxy-Anforderungen](/user-guide/apps/ansible#galaxy-requirements);
- Module, die `terraform init` oder `tofu init` herunterladen;
- Git-Befehle, die vom Playbook oder Skript selbst gestartet werden, zum Beispiel das Ansible-Modul `git`;
- das Repository eines in Git gespeicherten Inventars;
- die Hosts des Inventars, wenn eine **Host**-Zuordnung auf ihren Namen passt;
- das Durchsuchen von Branches und Playbooks eines Repositories im Vorlagenformular sowie das Polling von Zeitplänen, die bei einem neuen Commit starten.

Aufgaben, die an einen [entfernten Runner](/admin-guide/runners) gesendet werden, erhalten die Zuordnungen zusammen mit der Aufgabe und verhalten sich dort daher genauso.

Eine Zuordnung überschreibt den Eintrag für denselben Host in der serverweiten SSH-Konfiguration (`ssh.config_path` in der [Konfiguration](/reference/configuration)); alle anderen Einträge dieser Datei funktionieren weiterhin. Zuordnungen benötigen den Git-Client der Befehlszeile, also den Standard `git_client: cmd_git`; mit dem eingebauten Client `go_git` schlägt eine Aufgabe eines Projekts mit Zuordnungen mit einer erklärenden Fehlermeldung fehl, statt die falschen Zugangsdaten zu verwenden.

## Zugangsdaten {#credentials}

Private Schlüssel gelangen nie auf die Festplatte: Jede SSH-Zuordnung hält ihren Schlüssel in einem SSH-Agenten, der so lange lebt wie die Aufgabe, und die erzeugte SSH-Konfiguration verweist nur auf den Agenten. Eine Anmeldung mit Passwort wird Git über dessen Konfigurationsumgebung übergeben, nicht auf der Befehlszeile, und Git meldet im Aufgabenprotokoll die ursprüngliche URL, sodass das Secret an keiner der beiden Stellen erscheint.

Ein Schlüssel, auf den eine Zuordnung verweist, kann nicht gelöscht werden; der Bestätigungsdialog listet die Zuordnungen auf, die ihn verwenden. Auch das Ändern des Typs eines solchen Schlüssels in einen, den die Zuordnung nicht verwenden kann, zum Beispiel das Umwandeln des SSH-Schlüssels einer Host-Zuordnung in eine Anmeldung mit Passwort, wird abgelehnt.

## Beispiel {#example}

Ein Playbook liegt auf GitHub, verwendet ein Submodul aus einem selbst gehosteten GitLab und installiert über `requirements.yml` eine Rolle aus einer zweiten GitLab-Gruppe:

```yaml
# requirements.yml
- src: https://gitlab.example.com/ansible/role-nginx.git
  version: v2.1.0
```

Drei Zuordnungen lassen die Aufgabe ohne jede Änderung am Repository laufen:

| Typ | Host oder URL | Zugangsschlüssel |
|---|---|---|
| Host | `github.com` | Der Deploy-Key des GitHub-Repositories |
| URL | `https://gitlab.example.com/ansible/` | Ein GitLab-Access-Token als Anmeldung mit Passwort |
| URL | `https://gitlab.example.com/infra/network.git` | Der SSH-Schlüssel, der nur für dieses eine Repository zugelassen ist |

## Sicherungen {#backups}

Zuordnungen sind Teil der [Projektsicherung](./projects/settings#danger-zone). Sie verweisen über den Namen auf ihren Zugangsschlüssel, sodass ein wiederhergestelltes Projekt sie an die wiederhergestellten Schlüssel gebunden behält. Wie bei jedem Schlüssel wird der geheime Wert selbst nicht exportiert.
