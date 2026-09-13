# Projekti

Projekat (Project) je osnovna jedinica razdvajanja u Semaphore UI-ju. Svaki resurs sa kojim radite pripada tačno jednom projektu: šabloni zadataka (Task Templates), zadaci (Tasks), inventari (Inventories), grupe promenljivih (Variable Groups), ključevi, repozitorijumi (Repositories), integracije (Integrations), rasporedi (Schedules), runneri (Runners) i članovi tima (Team).

Projekti su međusobno nezavisni, pa ih možete koristiti za organizovanje nepovezanih sistema unutar jedne Semaphore instalacije: različitih timova, infrastruktura, okruženja ili aplikacija.

## Navigacija po projektu {#project-navigation}

Kada otvorite projekat, leva bočna traka prikazuje birač projekata na vrhu i sve odeljke projekta ispod njega. Pod nazivom projekta vidite svoju ulogu u tom projektu (na primer `task_runner`). Uloga određuje koje odeljke možete da menjate; pogledajte [Timovi](./team).

![Kontrolna tabla projekta sa karticom Istorija](/assets/project-dashboard-history.webp)

| Odeljak | Šta sadrži |
|---|---|
| **Dashboard** | Kartice [Istorija](./projects/history), [Statistika](./projects/stats), [Aktivnost](./projects/activity) i, za vlasnike projekta, [Podešavanja](./projects/settings) |
| **Task Templates** | Definicije šta se pokreće i kako: [Šabloni zadataka](./task-templates) |
| **Workflows** (Pro) | Grafovi šablona sa odobrenjima i grananjem: [Tokovi rada](./workflows) |
| **Schedule** | Rasporedi nalik cron-u za šablone: [Rasporedi](./schedules) |
| **Inventory** | Hostovi i podešavanja veze za Ansible, radni prostori za Terraform: [Inventar](./inventory) |
| **Variable Groups** | Promenljive i tajne za višekratnu upotrebu koje se ubacuju u zadatke: [Grupe promenljivih](./environment) |
| **Key Store** | Šifrovani kredencijali i eksterna skladišta tajni: [Skladište ključeva](./key-store) |
| **Repositories** | Git repozitorijumi ili lokalne putanje sa vašim playbook-ovima i skriptama: [Repozitorijumi](./repositories) |
| **Integrations** | Dolazni webhook-ovi koji pokreću zadatke: [Integracije](./integrations) |
| **Team** | Članovi i njihove uloge: [Timovi](./team) |
| **Runners** (Pro) | Runneri priključeni ovom projektu: [Runneri projekta](./projects/runners) |

Na dnu bočne trake nalaze se prekidač za tamni režim, birač jezika i vaš [meni naloga](./account).

## Kreiranje projekta {#creating-a-project}

Kreiranje projekata je dostupno administratorima. Obični korisnici mogu da kreiraju projekte samo kada je uključena serverska opcija `non_admin_can_create_project` (`SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT`), pogledajte [Konfiguracija](/admin-guide/configuration).

1. Kliknite na naziv projekta na vrhu bočne trake i izaberite **New Project**.
2. Popunite formu:

| Polje | Opis |
|---|---|
| **Project Name** | Prikazni naziv projekta. Kasnije ga možete promeniti u [Podešavanjima](./projects/settings). |
| **Max number of parallel tasks** | Opciono. Koliko zadataka ovog projekta može da se izvršava istovremeno. Ostavite prazno za neograničeno. Zadaci iznad ograničenja čekaju u redu sa statusom `waiting`. |
| **Demo** | Puni novi projekat primerima podataka: javnim demo repozitorijumom, inventarom, ključem i nekoliko šablona zadataka. Koristite ga da probate Semaphore bez ikakvog konfigurisanja. |

3. Kliknite **Create**.

Korisnik koji kreira projekat postaje njegov **Owner** (vlasnik).

## Prebacivanje između projekata {#switching-between-projects}

Kliknite na naziv projekta na vrhu bočne trake da vidite sve projekte čiji ste član i da se prebacite između njih. Poslednji otvoreni projekat se pamti u vašem pregledaču.

## Rezervna kopija i vraćanje {#backup-and-restore}

Projekat se može izvesti u JSON datoteku i uvesti u istu ili drugu Semaphore instancu:

- **Izvoz**: otvorite **Dashboard → Settings** i kliknite **Backup project** (pogledajte [Podešavanja](./projects/settings)).
- **Uvoz**: kliknite na naziv projekta u bočnoj traci, izaberite **Restore project** i otpremite datoteku rezervne kopije.

Obe operacije su dostupne i iz komandne linije, pogledajte [CLI: Projekti](/admin-guide/cli/projects).
