
# Terraform/OpenTofu

Pomoću Semaphore UI možete da pokrećete Terraform kod. Da biste to uradili, potrebno je da kreirate šablon zadatka (Task Template) tipa **Terraform Code**.

1. Otvorite odeljak **Šabloni zadataka** (Task Templates) i kliknite na dugme **Novi šablon** (New Template).
2. Izaberite **Terraform** kao tip aplikacije.
3. Podesite šablon i kliknite na dugme **Kreiraj** (Create).
4. Kliknite **Pokreni** (Run) da biste izvršili šablon.

## Prosleđivanje promenljivih {#passing-variables}

Promenljive iz izabranih **grupa promenljivih** (Variable Groups) ubacuju se kao promenljive okruženja. Dodajte nazivima prefiks `TF_VAR_` da bi ih Terraform prepoznao kao ulazne promenljive:

| Ključ grupe promenljivih | Terraform promenljiva |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

Za osetljive vrednosti koristite karticu **Tajne** (Secrets) u grupama promenljivih — one se čuvaju šifrovane.

## Radni prostori {#workspaces}

Semaphore nativno podržava Terraform/OpenTofu radne prostore (Workspaces). Pogledajte [Radni prostori](./workspaces) za kreiranje i prebacivanje radnih prostora i korišćenje SSH ključeva za privatne module.

## Zamena backend-a i HTTP backend (Pro) {#backend-override-and-http-backend-pro}

U šablonu možete zameniti backend tako da koristi ugrađeni HTTP backend bez izmene Terraform koda. Detalje potražite u [HTTP backend (Pro)](./states).

## Oznaka destroy i migracija stanja {#destroy-flag-and-state-migration}

Dijalog za pokretanje zadatka (Task) sadrži prekidače za `-destroy` i `-migrate-state`. Koristite ih kada rušite infrastrukturu ili migrirate Terraform stanje.

## Napomene {#notes}

- Semaphore automatski izvršava `terraform init` pre svakog pokretanja.
- Stanjem upravlja backend konfigurisan u vašem Terraform kodu (lokalni, S3, GCS itd.), osim ako koristite ugrađeni HTTP backend (Pro).
