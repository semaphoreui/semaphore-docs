# Aplikacije

Aplikacija (App) je alat koji šablon zadatka (Task Template) pokreće. Semaphore dolazi sa sedam ugrađenih aplikacija; administratori ih mogu uključivati i isključivati, kao i registrovati sopstvene.

| Aplikacija | ID | Šta šablon pokreće | Vodič |
|---|---|---|---|
| Ansible Playbook | `ansible` | `ansible-playbook` sa izabranim inventarom | [Ansible](./ansible) |
| Terraform Code | `terraform` | `terraform` u izabranom poddirektorijumu i radnom prostoru | [Terraform/OpenTofu](./terraform) |
| OpenTofu Code | `tofu` | `tofu`, iste opcije kao Terraform | [Terraform/OpenTofu](./terraform) |
| Terragrunt Code | `terragrunt` | `terragrunt` kao omotač oko Terraform-a ili OpenTofu-a | [Terragrunt](./terragrunt) |
| Bash Script | `bash` | shell skriptu pomoću `/bin/bash` | [Shell](./bash) |
| PowerShell Script | `powershell` | `.ps1` skriptu pomoću `pwsh` | [PowerShell](./powershell) |
| Python Script | `python` | `.py` skriptu pomoću `python3` | [Python](./python) |

Sam alat mora biti instaliran na mašini koja izvršava zadatke: na Semaphore serveru ili na [runner-u](/admin-guide/runners). Zvanični Docker image sadrži Ansible, Terraform, OpenTofu, Bash i Python.

## Upravljanje aplikacijama {#managing-applications}

Administratori otvaraju **Aplikacije** (Applications) iz menija naloga na dnu bočne trake.

![Stranica Aplikacije](/assets/apps-list.webp)

Prekidač u svakom redu uključuje ili isključuje aplikaciju. Isključena aplikacija se ne nudi u formi šablona, a postojeći šabloni nastavljaju da rade. Prilikom kreiranja šablona prikazuju se samo uključene aplikacije, pa isključite alate koji nisu instalirani na vašem serveru.

Kliknite na aplikaciju da biste promenili njen naziv, ikonu, putanju do izvršnog fajla i prioritet (redosled u formi šablona).

## Prilagođene aplikacije {#custom-applications}

**Nova aplikacija** (New App) registruje bilo koji alat komandne linije kao aplikaciju:

| Polje | Opis |
|---|---|
| **ID** | Kratak identifikator koji se koristi u API-ju i u šablonima, na primer `pulumi`. |
| **Ikona** (Icon) | Ikona prikazana pored naziva. |
| **Naziv** (Name) | Naslov prikazan u formi šablona. |
| **Putanja** (Path) | Putanja do izvršnog fajla na serveru ili runner-u. |
| **Prioritet** (Priority) | Pozicija u listi aplikacija. |
| **Aktivna** (Active) | Da li se aplikacija nudi u šablonima. |

Šablon prilagođene aplikacije pokreće izvršni fajl sa fajlom skripte iz repozitorijuma (Repository) kao argumentom i prima grupe promenljivih (Variable Groups) kao promenljive okruženja, na isti način kao [Bash](./bash) šabloni.

Aplikacije se mogu unapred definisati i u konfiguraciji servera, pogledajte odeljak `apps` u [Konfiguraciji](/admin-guide/configuration).
