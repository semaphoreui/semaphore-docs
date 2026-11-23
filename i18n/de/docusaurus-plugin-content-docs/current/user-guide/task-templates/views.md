# Views

Views gruppieren Task Templates in Tabs über der Liste der Task Templates. Ein Projekt beginnt mit einem einzigen View **All**; Sie können eigene hinzufügen, zum Beispiel **Build**, **Deploy** und **Tools**, damit Benutzer in Projekten mit vielen Task Templates schnell das richtige finden.

![Liste der Task Templates mit View-Tabs](/assets/templates-list.webp)

## Views verwalten {#managing-views}

Benutzer mit der Rolle **Manager** oder höher können Views bearbeiten. Klicken Sie auf das Stiftsymbol neben den View-Tabs, um den Dialog **Edit views** zu öffnen, und erstellen Sie mit **Add view** einen neuen Tab. Jeder View hat die folgenden Einstellungen:

| Einstellung | Beschreibung |
|---|---|
| **Title** | Die Bezeichnung des Tabs. |
| **Type** | **Custom** zeigt nur die Task Templates, die diesem View zugeordnet sind. **All** zeigt alle Task Templates des Projekts. |
| **Sort by** und **Reverse** | Standardmäßige Sortierreihenfolge der Task Templates im Tab. |
| **Hidden** | Den View behalten, den Tab aber ausblenden. |
| **Show task counts** | Auf dem Tab anzeigen, wie viele seiner Task Templates sich in welchem Zustand befinden, siehe [Anzahl der Task Templates auf den Tabs](#template-counts). Standardmäßig aus. |

Ziehen Sie die Views im Dialog, um die Reihenfolge der Tabs zu ändern. Das Löschen eines Views löscht nicht dessen Task Templates, sie bleiben im View **All** sichtbar.

## Ein Task Template einem View zuordnen {#assigning-a-template-to-a-view}

Öffnen Sie das Formular des Task Template und wählen Sie den Tab im Feld **View** aus. Ein Task Template gehört jeweils zu einem benutzerdefinierten View und wird immer in Views des Typs **All** aufgelistet.

## Anzahl der Task Templates auf den Tabs {#template-counts}

Ein View mit eingeschaltetem **Show task counts** zeigt neben dem Titel als ein Chip aus farbigen Segmenten, wie viele seiner Task Templates sich in welchem Zustand befinden. Der Zustand eines Task Templates ist der Status seines letzten Tasks. Ein Segment mit dem Wert null wird ausgeblendet, und die Zahlen folgen den laufenden Tasks. Bei einem neuen View ist die Einstellung aus, und die Zahlen werden nur für die Views berechnet, bei denen sie eingeschaltet ist.

| Farbe | Gezählte Task Templates |
|---|---|
| Grün | Der letzte Task war erfolgreich. |
| Rot | Der letzte Task ist fehlgeschlagen. |
| Grau | Der letzte Task wurde gestoppt oder wird gerade gestoppt, oder das Task Template wurde noch nie gestartet. |
| Orange | Der letzte Task wartet auf eine Bestätigung. |
| Blau | Der letzte Task wartet in der Warteschlange, startet oder läuft. |

Gezählt werden nur die Task Templates, die Sie sehen dürfen.

## Spalten {#columns}

Das Zahnradsymbol in der oberen rechten Ecke der Liste der Task Templates öffnet die Spaltenauswahl. Sie gilt für jeden View und wird in Ihrem Browser gespeichert.

![Spaltenauswahl](/assets/templates-columns.webp)
