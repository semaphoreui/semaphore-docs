# Terragrunt

[Terragrunt](https://terragrunt.gruntwork.io/) ist ein Wrapper für Terraform und OpenTofu, der Konfigurationen DRY hält und Abhängigkeiten zwischen Modulen verwaltet. Semaphore führt es auf die gleiche Weise aus wie [Terraform/OpenTofu](./terraform), mit einigen hier beschriebenen Unterschieden.

## Voraussetzungen {#prerequisites}

1. Installieren Sie die Binärdatei `terragrunt` sowie eine Binärdatei `terraform` oder `tofu` auf dem Semaphore-Server oder auf dem [Runner](/admin-guide/runners), der die Tasks ausführt.
2. Aktivieren Sie die Anwendung **Terragrunt Code**: Sie ist standardmäßig deaktiviert. Öffnen Sie **Applications** über das Kontomenü und schalten Sie den Schalter ein, siehe [Apps](/user-guide/apps).

## Ein Terragrunt-Task-Template erstellen {#creating-a-terragrunt-template}

1. Öffnen Sie **Task Templates** und klicken Sie auf **New Template**.
2. Wählen Sie **Terragrunt Code** als App.
3. Legen Sie das **Repository** und das Unterverzeichnis mit Ihrer `terragrunt.hcl` fest.
4. Wählen oder erstellen Sie im Feld Inventory einen **Workspace**. Terragrunt-Task-Templates verwenden Inventories des Typs `terragrunt-workspace`, siehe [Workspaces](./terraform/workspaces).
5. Klicken Sie auf **Create** und anschließend auf **Run**.

![Terragrunt-Task-Template](/assets/templates-list.webp)

## Tasks ausführen {#running-tasks}

Der Dialog für einen neuen Task bietet dieselben Optionen wie bei Terraform: **Plan**, **Destroy**, **Auto Approve**, **Upgrade** und **Reconfigure**.

Semaphore ruft `terragrunt run -- <terraform arguments>` auf und übergibt die Terraform- oder OpenTofu-Binärdatei mit `--tf-path`, sofern Sie `--tf-path` nicht bereits in den CLI-Argumenten des Task Template gesetzt haben. Die Auswahl des Workspace erfolgt mit `terragrunt run -- workspace select -or-create=true <name>`.

Variablen aus den ausgewählten **Variable Groups** werden als Umgebungsvariablen übergeben; verwenden Sie daher für Eingabevariablen das Präfix `TF_VAR_`. Zusätzliche Variablen und Survey-Variablen werden als Argumente `-var name=value` übergeben.

## Hinweise {#notes}

- `terragrunt` führt vor jedem Befehl automatisch `init` aus.
- Das HTTP-State-Backend und die State-Liste auf dem Tab **Workspaces** funktionieren wie bei Terraform, siehe [HTTP-Backend](./terraform/states).
- Um `run-all` über mehrere Module hinweg zu verwenden, fügen Sie die Argumente in **CLI args** des Task Template hinzu.
