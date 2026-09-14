# Teams

In Semaphore UI ist jedes Projekt mit einem **Team** verknüpft. Nur Teammitglieder und Administratoren können auf das Projekt zugreifen. Jedem Mitglied des Teams wird eine von vier integrierten Rollen zugewiesen, die seine Zugriffsebene und die Aktionen bestimmt, die es ausführen darf.

In der **Enterprise**-Edition können die integrierten Rollen um [benutzerdefinierte Rollen](#extended-rbac-enterprise) erweitert werden, die zusätzliche, fein abgestufte Berechtigungen für bestimmte Task Templates gewähren.

:::tip
Damit Sie den Zugriff auf ein Projekt nicht verlieren, empfiehlt es sich, mindestens zwei Teammitglieder mit der Rolle <b>Owner</b> zu haben.
:::

Der Bereich **Team** eines Projekts hat zwei Tabs: **Members** mit den Benutzern und ihren Rollen und **Roles** mit den benutzerdefinierten Rollen (Enterprise).

![Teammitglieder](/assets/team-members.webp)

## Integrierte Rollen {#built-in-roles}

Jedes Teammitglied hat genau eine dieser vier Rollen:

- **Owner**
- **Manager**
- **Task Runner**
- **Guest**

Nachfolgend finden Sie detaillierte Beschreibungen jeder Rolle und ihrer Berechtigungen.

### Owner {#owner}

- **Alle Berechtigungen**<br />
  Owner können innerhalb des Projekts alles tun, einschließlich der Verwaltung von Rollen, dem Hinzufügen und Entfernen von Mitgliedern und dem Konfigurieren beliebiger Projekteinstellungen.

- **Mehrere Owner**<br />
  Ein Projekt kann mehrere Owner haben, sodass mehr als eine Person über alle Rechte verfügt.

- **Einschränkungen beim Selbstentfernen**<br />
  Ein Owner kann sich nicht selbst entfernen, wenn er der einzige Owner des Projekts ist. Das verhindert, dass das Projekt ohne Owner zurückbleibt.

- **Andere Owner verwalten**<br />
  Owner können alle Teammitglieder verwalten (einschließlich Entfernen oder Ändern ihrer Rollen), auch andere Owner.

### Manager {#manager}

- **Weitreichende Projektkontrolle:** Manager haben nahezu die gleichen Berechtigungen wie Owner und können damit die meisten alltäglichen Aufgaben erledigen und die Projektumgebung verwalten.

- Manager können **nicht**:
  - Das Projekt löschen.
  - Owner entfernen oder deren Rollen ändern.

- **Typischer Anwendungsfall:** Weisen Sie die Rolle Manager erfahrenen Teammitgliedern zu, die umfangreichen Zugriff benötigen, aber nicht die Befugnis haben müssen, das Projekt zu löschen oder Owner zu verwalten.

### Task Runner {#task-runner}

- **Tasks ausführen:** Task Runner können jedes Task Template ausführen, das im Projekt vorhanden ist.

- **Nur Lesezugriff auf andere Ressourcen:** Sie können Tasks ausführen, haben auf andere Ressourcen wie Inventory, Variablen, Repositories usw. jedoch nur Lesezugriff.

- **Typischer Anwendungsfall:** Entwickler oder QA-Ingenieure, die Tasks auslösen und überwachen müssen, aber keine Projekteinstellungen ändern oder die Teammitgliedschaft verwalten müssen.

### Guest {#guest}

- **Nur Lesezugriff:** Guests haben Lesezugriff auf alle Projektressourcen (zum Beispiel Logs, Inventories, Dashboards ansehen).

- **Keine Schreibberechtigungen:** Sie können keine Einstellungen ändern, keine Tasks ausführen und keine Rollen ändern.

- **Typischer Anwendungsfall:** Stakeholder oder andere Beteiligte, die nur den Projektstatus und Details einsehen müssen, ohne Änderungen vorzunehmen.

---

## Erweitertes RBAC <Enterprise /> {#extended-rbac-enterprise}

:::info
Erweitertes RBAC ist in der Edition **Semaphore Enterprise** ab [Semaphore v2.17](https://semaphoreui.com/releases/semaphore-v2_17) verfügbar.
:::

Erweitertes RBAC ergänzt die vier integrierten Rollen um zusätzliche Berechtigungen. Die integrierten Rollen selbst bleiben unverändert. Wenn Sie keine benutzerdefinierten Rollen definieren, verhält sich jedes Projekt genau so wie in der Community-Edition.

Mit erweitertem RBAC können benutzerdefinierte Rollen einzelne projektweite Berechtigungen gewähren. Sie können einer Rolle außerdem Berechtigungen für ausgewählte Task Templates geben. So können Sie einem Teammitglied Zugriff auf die Task Templates geben, die es benötigt, ohne es in eine höhere integrierte Rolle zu befördern.

### Benutzerdefinierte Rollen {#custom-roles}

Eine benutzerdefinierte Rolle ist ein benannter Satz von Berechtigungen, der die integrierte Projektrolle eines Mitglieds ergänzt. Jedes Teammitglied behält seine integrierte Rolle. Benutzerdefinierte Rollen fügen ihr Berechtigungen hinzu.

Benutzerdefinierte Rollen sind in zwei Gültigkeitsbereichen verfügbar:

- **Globale Rollen** werden auf Instanzebene definiert und können in jedem Projekt verwendet werden.
- **Projektrollen** werden innerhalb eines einzelnen Projekts definiert und sind nur in diesem Projekt verfügbar.

### Berechtigungsebenen {#permission-levels}

Benutzerdefinierte Rollen gewähren Berechtigungen auf zwei Ebenen:

- **Projektweite Berechtigungen** erweitern den Zugriff eines Benutzers im gesamten Projekt. Sie wählen sie beim Erstellen der Rolle aus.
- **Task-Template-Berechtigungen** steuern Aktionen für ein einzelnes Task Template. Sie wählen sie im Tab **Permissions** dieses Task Template aus, nachdem Sie die Rolle dem Task Template hinzugefügt haben.

### Eine benutzerdefinierte Rolle erstellen {#create-a-custom-role}

Wählen Sie den Gültigkeitsbereich, bevor Sie das Rollenformular öffnen.

#### Globale Rolle {#global-role}

Globale Rollen werden einmal erstellt und können Benutzern in jedem Projekt zugewiesen werden. Nur ein Instanzadministrator kann eine globale Rolle erstellen.

Öffnen Sie das Administratormenü unten links und wählen Sie **Roles**.

Wählen Sie in der instanzweiten Liste der Rollen **New Role**.

![Öffnen Sie Roles über das Administratormenü und wählen Sie dann New Role](/assets/custom-roles-navigation-to-new-role-annotated-v4.png)

#### Projektrolle {#project-role}

Projektrollen sind nur in dem Projekt verfügbar, in dem sie erstellt wurden. Owner und Manager des Projekts können sie erstellen.

1. Öffnen Sie das Projekt und gehen Sie zu **Team** > **Roles**.
2. Wählen Sie **New Role**.

Der Tab **Roles** ist leer, bis die erste Projektrolle erstellt wurde. Er listet alle Projektrollen auf und enthält die Schaltfläche **New Role**.

![](https://www.semaphoreui.com/uploads/v2.17/roles1.webp)

### Eine benutzerdefinierte Rolle konfigurieren {#configure-a-custom-role}

Beide Wege öffnen dasselbe Rollenformular. Konfigurieren Sie die Rolle so, dass sie dem Zugriff entspricht, den Ihr Teammitglied benötigt.

![Dialog New Role mit Feldern und Berechtigungs-Checkboxen](/assets/custom-roles-global-role-form.jpg)

| Feld | Beschreibung |
| --- | --- |
| **Name** | Eine für Menschen lesbare Bezeichnung der Rolle. |
| **Slug** | Ein eindeutiger technischer Identifikator, über den die Rolle referenziert wird. Verwenden Sie Kleinbuchstaben, Zahlen, Unterstriche oder Bindestriche, zum Beispiel `release_operator`. |
| **Permissions** | Die projektweiten Berechtigungen, die die Rolle gewährt. |

#### Projektweite Berechtigungen {#project-wide-permissions}

Wählen Sie nur die projektweiten Berechtigungen aus, die die Rolle benötigt:

| Berechtigung | Beschreibung |
| --- | --- |
| **Can run project tasks** | Projekt-Tasks ausführen. |
| **Can update project** | Grundlegende Projektinformationen unter **Dashboard** > **Settings** bearbeiten. |
| **Can manage project resources** | Projektressourcen verwalten, zum Beispiel Task Templates, Repositories, Inventory, Environments, Einträge im Key Store, Schedules, Integrationen und Runner. Das ist ein projektweiter Zugriff. Er kann nicht auf einzelne Ressourcen außerhalb von Task Templates eingeschränkt werden. |
| **Can manage project users** | Projektmitgliedschaft und Rollenzuweisungen verwalten. |

Projektweite Berechtigungen können nicht auf ein einzelnes Inventory, Repository, Environment oder einen einzelnen Key-Store-Eintrag eingeschränkt werden. Task Templates sind der einzige Ressourcentyp, der granulare Rollenzuweisungen unterstützt.

:::tip Zugriff nur auf Task Templates
Um eine granulare Rolle zu erstellen, die nur Zugriff auf ausgewählte Task Templates hinzufügt, lassen Sie alle projektweiten Berechtigungen deaktiviert. Die Rolle fügt dann selbst keine projektweiten Berechtigungen hinzu. Fügen Sie sie den benötigten Task Templates hinzu und wählen Sie dort nur die Aktionen aus, die diese Rolle benötigt.
:::

Wählen Sie **Save**, wenn die Rollenkonfiguration fertig ist.

### Zugriff auf bestimmte Task Templates konfigurieren {#configure-access-to-specific-task-templates}

Task-Template-Berechtigungen fügen Zugriff auf ausgewählte Task Templates hinzu. Das folgende Beispiel verwendet eine benutzerdefinierte Rolle ohne projektweite Berechtigungen. Diese Konfiguration nach dem Prinzip der geringsten Rechte ist nützlich, wenn ein Teammitglied nur ausgewählte Aktionen für Task Templates benötigt. Sie können Task-Template-Berechtigungen auch einer Rolle hinzufügen, die bereits projektweiten Zugriff gewährt.

**Das benötigte Task Template öffnen**

1. Öffnen Sie **Task Templates** und wählen Sie das gewünschte Task Template.
2. Öffnen Sie den Tab **Permissions**.

Der Tab **Permissions** listet die Rollen auf, die dem Task Template bereits hinzugefügt wurden.

![](https://www.semaphoreui.com/uploads/v2.17/roles2.webp)

**Die Rolle hinzufügen und Task-Template-Berechtigungen gewähren**

1. Wählen Sie **Add Role** und wählen Sie die benutzerdefinierte Rolle aus, die diesem Task Template hinzugefügt werden soll.
2. Wählen Sie nur die Task-Template-Berechtigungen aus, die die Rolle benötigt, zum Beispiel **Can run tasks** oder **Can update the template**.

Dieses Beispiel verwendet eine zuvor erstellte Rolle ohne projektweite Berechtigungen. Sie können jede benutzerdefinierte Rolle wählen, die im Projekt verfügbar ist.

![Dialog für Task-Template-Berechtigungen mit hervorgehobenen Bedienelementen](/assets/custom-roles-template-permissions-annotated.png)

Um derselben Rolle Zugriff auf weitere Task Templates zu gewähren, wiederholen Sie diese Schritte für jedes Task Template.

:::note Bestehender Projektzugriff
Task-Template-Berechtigungen sind additiv. Sie fügen Zugriff hinzu, ohne den Zugriff aus der integrierten Rolle eines Benutzers oder aus anderen benutzerdefinierten Rollen zu ersetzen oder zu verringern. Wenn ein Benutzer bereits alle Task Templates ausführen oder bearbeiten kann, schränkt das Hinzufügen einer Task-Template-spezifischen Rolle diesen Zugriff nicht ein.
:::

### Eine benutzerdefinierte Rolle in einem Projekt zuweisen {#assign-a-custom-role-in-a-project}

Nachdem Sie eine globale oder eine Projektrolle erstellt und konfiguriert haben, weisen Sie sie dem gewünschten Teammitglied zu:

1. Öffnen Sie das Projekt und gehen Sie zu **Team**.
2. Klappen Sie **Roles** neben dem gewünschten Benutzer auf.
3. Wählen Sie die benutzerdefinierte Rolle aus.

### Derzeit nicht unterstützt {#not-currently-supported}

- **Gruppenzuordnung über LDAP / OIDC.** Benutzerdefinierte Rollen werden pro Benutzer zugewiesen. Das Zuordnen von Gruppen aus externen Verzeichnissen zu benutzerdefinierten Rollen wird nicht unterstützt.
- **Granulare Berechtigungen für Ressourcen außerhalb von Task Templates.** Derzeit können nur Task Templates durch benutzerdefinierte Rollen auf der Ebene einzelner Ressourcen gesteuert werden.

---

## Teammitglieder verwalten {#managing-team-members}

- **Neue Mitglieder einladen:** **Owner** und **Manager** können neue Benutzer in das Team einladen und ihnen eine erste Rolle zuweisen.

- **Rollen ändern:** Owner können die Rollen jedes Teammitglieds jederzeit ändern. Manager können die Rollen von **Task Runners** und **Guests** ändern, aber **nicht** die von anderen Managern oder Ownern.

- **Mitglieder entfernen:** Owner und Manager können Teammitglieder mit niedrigeren Rollen entfernen.
  - Ein Owner kann jeden entfernen (auch andere Owner), sich selbst jedoch nicht, wenn er der einzige Owner ist.
  - Ein Manager kann **Task Runners** und **Guests** entfernen, aber **nicht** andere Manager oder Owner.

---

## Bewährte Vorgehensweisen {#best-practices}

1. **Redundanz sicherstellen:** Weisen Sie die Rolle **Owner** mindestens zwei Personen zu, um dauerhaften Zugriff zu gewährleisten und einen Single Point of Failure zu vermeiden.
2. **Das Prinzip der geringsten Rechte befolgen:**
   - Geben Sie Teammitgliedern die minimal notwendige Rolle für ihre Aufgaben.
   - Verwenden Sie die Rollen **Task Runner** oder **Guest** für Personen, die nur eingeschränkte Berechtigungen benötigen.
   - Verwenden Sie in Enterprise bevorzugt [benutzerdefinierte Rollen](#extended-rbac-enterprise), um Zugriff auf bestimmte Task Templates zu gewähren, anstatt die integrierte Rolle eines Mitglieds hochzusetzen.
3. **Mitgliedschaften regelmäßig überprüfen:**
   - Bewerten Sie Rollen neu, wenn sich Teamstrukturen ändern.
   - Entziehen Sie Benutzern den Zugriff oder setzen Sie ihre Rolle herab, wenn sie keine weitreichenden Rechte mehr benötigen.
4. **Manager für die alltägliche Administration einsetzen:**
   - Behalten Sie die Rolle Owner einer kleineren Gruppe mit letzter Entscheidungsbefugnis vor.
   - Delegieren Sie routinemäßige Projektverwaltungsaufgaben an Manager, um das Risiko versehentlicher großer Änderungen oder Projektlöschungen zu verringern.

---

## Häufig gestellte Fragen {#frequently-asked-questions}

### 1. Kann ein Owner einen anderen Owner entfernen? {#1-can-an-owner-remove-another-owner}
Ja, ein Owner kann die Rolle jedes anderen Owners entfernen oder ändern, es sei denn, er ist der einzige verbleibende Owner im Projekt.

### 2. Wer kann das Projekt löschen? {#2-who-can-delete-the-project}
Nur **Owner** können ein Projekt löschen.

### 3. Können Manager andere Manager hinzufügen oder entfernen? {#3-can-managers-add-or-remove-other-managers}
Nein. Manager können nur Benutzer mit den Rollen **Task Runner** oder **Guest** hinzufügen oder entfernen. Um Owner oder andere Manager zu verwalten, müssen Sie Owner sein.

### 4. Was passiert, wenn ich versehentlich alle Owner entferne? {#4-what-happens-if-i-remove-all-owners-by-accident}
Semaphore UI verhindert das Entfernen eines Owners, wenn das Projekt dadurch ganz ohne Owner zurückbliebe. Es muss jederzeit mindestens einen Owner geben.

### 5. Können Guests Tasks ausführen? {#5-can-guests-run-tasks}
Nein. Guests haben nur Lesezugriff und können Tasks weder auslösen noch verwalten. In der Enterprise-Edition können Sie einem Guest über eine [benutzerdefinierte Rolle](#extended-rbac-enterprise) die Berechtigung geben, einzelne Task Templates auszuführen.

### 6. Ersetzen benutzerdefinierte Rollen die integrierten Rollen? {#6-do-custom-roles-replace-the-built-in-roles}
Nein. Benutzerdefinierte Rollen erweitern die integrierten Rollen um zusätzliche Berechtigungen auf Projekt- und Task-Template-Ebene. Jedes Teammitglied hat weiterhin genau eine integrierte Rolle.

### 7. Ist erweitertes RBAC in der Community-Edition verfügbar? {#7-is-extended-rbac-available-in-the-community-edition}
Nein. Erweitertes RBAC erfordert ein Abonnement für **Semaphore Enterprise**.
