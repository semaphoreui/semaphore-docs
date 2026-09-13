# Terragrunt

[Terragrunt](https://terragrunt.gruntwork.io/) je omotač za Terraform i OpenTofu koji održava konfiguracije DRY i upravlja zavisnostima između modula. Semaphore ga pokreće na isti način kao [Terraform/OpenTofu](./terraform), uz nekoliko razlika opisanih ovde.

## Preduslovi {#prerequisites}

1. Instalirajte binarni fajl `terragrunt` i binarni fajl `terraform` ili `tofu` na Semaphore serveru ili na [runner-u](/admin-guide/runners) koji izvršava zadatke.
2. Uključite aplikaciju (App) **Terragrunt Code**: podrazumevano je isključena. Otvorite **Aplikacije** (Applications) iz menija naloga i uključite prekidač, pogledajte [Aplikacije](/user-guide/apps).

## Kreiranje Terragrunt šablona {#creating-a-terragrunt-template}

1. Idite na **Šabloni zadataka** (Task Templates) i kliknite **Novi šablon** (New Template).
2. Izaberite **Terragrunt Code** kao aplikaciju.
3. Podesite **Repozitorijum** (Repository) i poddirektorijum u kom se nalazi vaš `terragrunt.hcl`.
4. Izaberite ili kreirajte **Radni prostor** (Workspace) u polju Inventar (Inventory). Terragrunt šabloni koriste inventare tipa `terragrunt-workspace`, pogledajte [Radni prostori](./terraform/workspaces).
5. Kliknite **Kreiraj** (Create), a zatim **Pokreni** (Run).

![Terragrunt šablon](/assets/templates-list.webp)

## Pokretanje zadataka {#running-tasks}

Dijalog za novi zadatak (New Task) nudi iste opcije kao i za Terraform: **Plan**, **Destroy**, **Auto Approve**, **Upgrade** i **Reconfigure**.

Semaphore poziva `terragrunt run -- <terraform arguments>` i prosleđuje Terraform ili OpenTofu binarni fajl pomoću `--tf-path`, osim ako ste već podesili `--tf-path` u CLI argumentima šablona. Izbor radnog prostora vrši se komandom `terragrunt run -- workspace select -or-create=true <name>`.

Promenljive iz izabranih **grupa promenljivih** (Variable Groups) prosleđuju se kao promenljive okruženja, pa za ulazne promenljive koristite prefiks `TF_VAR_`. Dodatne promenljive i promenljive upitnika prosleđuju se kao argumenti `-var name=value`.

## Napomene {#notes}

- `terragrunt` automatski pokreće `init` pre svake komande.
- HTTP backend za stanje i lista stanja na kartici **Radni prostori** (Workspaces) rade kao i za Terraform, pogledajte [HTTP backend](./terraform/states).
- Da biste koristili `run-all` preko više modula, dodajte argumente u **CLI argumente** (CLI args) šablona.
