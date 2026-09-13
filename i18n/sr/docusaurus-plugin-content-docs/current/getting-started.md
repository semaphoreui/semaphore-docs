# Prvi koraci

Ova stranica vas vodi od sveže instalacije do prvog uspešno izvršenog zadatka (Task). Svaki korak sadrži link ka stranici sa detaljima.

## Od nule do prvog zadatka {#from-zero-to-first-task}

1. **Instalirajte Semaphore** metodom koja vam odgovara: [Instalacija](/admin-guide/installation).
2. **Prijavite se** pomoću administratorskog korisnika koji ste kreirali tokom podešavanja ili preko promenljivih `SEMAPHORE_ADMIN_*` u Docker-u.
3. **Kreirajte projekat.** Projekat (Project) međusobno izoluje timove, infrastrukture ili aplikacije: [Projekti](/user-guide/projects).
4. **Povežite ono što je vašoj automatizaciji potrebno:**
   - Izvorni kod sa playbook-ovima, modulima ili skriptama: [Repozitorijumi](/user-guide/repositories).
   - SSH ključevi, tokeni i lozinke: [Skladište ključeva](/user-guide/key-store).
   - Ciljni hostovi i podešavanja konekcije: [Inventar](/user-guide/inventory).
   - Promenljive za ponovnu upotrebu: [Grupe promenljivih](/user-guide/environment).
5. **Kreirajte šablon zadatka i pokrenite ga.** Izaberite vodič za svoj alat: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) ili [Python](/user-guide/apps/python). Zatim ga pokrenite i pratite: [Zadaci](/user-guide/tasks).
6. **Automatizujte i uvedite u svakodnevni rad:**
   - Pokretanje po rasporedu: [Rasporedi](/user-guide/schedules).
   - Kontrola ko šta može da radi: [Timovi i prilagođene uloge](/user-guide/team).
   - Obaveštenja o rezultatima: [Obaveštenja](/admin-guide/notifications).

## Ključni pojmovi {#key-concepts}

Ovi pojmovi se pojavljuju svuda u korisničkom interfejsu.

| Pojam | Značenje |
|------|---------|
| **Projekat** (Project) | Osnovna jedinica razdvajanja. Svaki projekat ima sopstvene repozitorijume, ključeve, inventare, šablone i tim. [Projekti](/user-guide/projects) |
| **Repozitorijum** (Repository) | Git repozitorijum ili lokalna putanja u kojoj se nalaze playbook-ovi, moduli ili skripte. [Repozitorijumi](/user-guide/repositories) |
| **Inventar** (Inventory) | Hostovi, grupe i podešavanja konekcije za pokretanja u Ansible stilu. [Inventar](/user-guide/inventory) |
| **Grupa promenljivih** (Variable Group) | Promenljive za ponovnu upotrebu i konfiguracija okruženja, poznata i kao Environment. [Grupe promenljivih](/user-guide/environment) |
| **Skladište ključeva** (Key Store) | Šifrovani kredencijali kao što su SSH ključevi, tokeni i lozinke. [Skladište ključeva](/user-guide/key-store) |
| **Šablon zadatka** (Task Template) | Definicija pokretanja: aplikacija, repozitorijum, inventar, promenljive i opcije. [Šabloni zadataka](/user-guide/task-templates) |
| **Zadatak** (Task) | Jedno izvršavanje šablona, sa svojim logom i statusom. [Zadaci](/user-guide/tasks) |
| **Tok rada** (Workflow) | Graf šablona sa grananjem, odobrenjima i odlaganjima. Pro funkcionalnost. [Tokovi rada](/user-guide/workflows) |
| **Runner** | Mesto gde se zadaci izvršavaju: sam server ili udaljeni runner. [Runner-i](/admin-guide/runners) |

## Sledeći koraci {#next-steps}

- Postavite Semaphore iza TLS-a pomoću [obrnutog proksija](/admin-guide/reverse-proxy).
- Povežite svog provajdera identiteta: [LDAP](/admin-guide/authentication/ldap) ili [OpenID Connect](/admin-guide/authentication/openid).
- Upravljajte Semaphore-om iz CI-ja ili skripti pomoću [API-ja](/reference/api) i [CLI-ja](/reference/cli).
