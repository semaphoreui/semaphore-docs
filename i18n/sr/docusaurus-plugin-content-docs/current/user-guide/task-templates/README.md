# Šabloni zadataka

Šablon zadatka (Task Template) definiše šta se pokreće i kako: aplikaciju, repozitorijum i fajl koji se izvršava, inventar, grupe promenljivih, kredencijale i opcije koje korisnik može da promeni prilikom pokretanja zadatka. Svaki [zadatak](../tasks) (Task) kreira se iz šablona.

Šabloni podržavaju sledeće aplikacije:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) i [Terragrunt](/user-guide/apps/terragrunt)
* [Shell](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

Administratori mogu da uključe ili isključe aplikacije i dodaju sopstvene, pogledajte [Aplikacije](/user-guide/apps).

## Lista šablona {#template-list}

Odeljak **Šabloni zadataka** (Task Templates) prikazuje sve šablone projekta.

![Lista šablona](/assets/templates-list.webp)

| Kolona | Sadržaj |
|---|---|
| **Naziv** (Name) | Naziv šablona sa ikonom aplikacije. Dugme **play** pokreće novi zadatak. |
| **Verzija** (Version) | Najnovija verzija build-a za build i deploy šablone, a u ostalim slučajevima ikona rezultata poslednjeg zadatka. |
| **Status** | Bedž statusa poslednjeg zadatka ili *Nije pokrenuto* (Not launched). |
| **Poslednji zadatak** (Last Task) | Broj poslednjeg zadatka i ko ga je pokrenuo. |
| **Playbook** | Fajl koji šablon izvršava. |
| **Inventar** (Inventory), **Grupe promenljivih** (Variable Groups), **Repozitorijum** (Repository) | Resursi priloženi šablonu. |

Kartice iznad liste su [prikazi](./views) (Views): imenovane grupe šablona. Ikona zupčanika u gornjem desnom uglu omogućava izbor kolona koje se prikazuju. Kliknite na strelicu levo od reda da biste raširili poslednje zadatke tog šablona.

![Rašireni red šablona](/assets/templates-list-expanded.webp)

## Stranica šablona {#template-page}

Kliknite na naziv šablona da biste otvorili njegovu stranicu. Dugme u gornjem desnom uglu pokreće zadatak (**Pokreni** (Run), **Build** ili **Deploy**, u zavisnosti od tipa), a **Zaustavi sve** (Stop all) zaustavlja sve zadatke šablona koji se izvršavaju ili čekaju u redu.

| Kartica | Sadržaj |
|---|---|
| **Zadaci** (Tasks) | Zadaci ovog šablona sa dugmetom **ponovo pokreni** (rerun) u svakom redu. |
| **Detalji** (Details) | Playbook, tip, inventar, grupe promenljivih i repozitorijum, kao i grafikon statusa zadataka sa istim filterima kao u [Statistici](../projects/stats). |
| **Radni prostori** (Workspaces) | Samo za Terraform, OpenTofu i Terragrunt šablone: lista radnih prostora, pogledajte [Radni prostori](../apps/terraform/workspaces). |

![Detalji šablona](/assets/template-details.webp)

## Tipovi šablona {#template-types}

| Tip | Namena |
|---|---|
| **Zadatak** (Task) | Obično pokretanje. Podrazumevani tip. |
| **Build** | Proizvodi artefakt i dodeljuje mu automatski uvećanu verziju. |
| **Deploy** | Isporučuje verziju koju je proizveo build šablon. |

Build i deploy šabloni i `semaphore_vars` koje prosleđuju playbook-ovima opisani su u članku [Build i deploy šabloni](./build-deploy).

## Forma šablona {#template-form}

Korisnici sa ulogom **Menadžer** (Manager) ili višom mogu da kreiraju i uređuju šablone pomoću dugmeta **Novi šablon** (New Template) i ikone olovke. Forma je organizovana u sledeće grupe. Polja označena nazivom aplikacije pojavljuju se samo za tu aplikaciju.

### Zajednička polja {#common-fields}

| Polje | Opis |
|---|---|
| **Naziv** (Name) | Obavezno. Naziv šablona. |
| **Opis** (Description) | Opcioni tekst prikazan ispod naziva. |
| **Aplikacija** (App) | Aplikacija koja se pokreće. |
| **Repozitorijum** (Repository) | Repozitorijum sa playbook-om ili skriptom, pogledajte [Repozitorijumi](../repositories). |
| **Grana** (Branch) | Git grana koja se preuzima. Prazno znači granu podešenu u repozitorijumu. |
| **Playbook / Naziv fajla skripte** (Playbook / Script filename) | Putanja do fajla relativna u odnosu na koren repozitorijuma. Za Terraform aplikacije: poddirektorijum sa konfiguracijom. |
| **Drugi radni direktorijum** (Different working directory) | Pokretanje alata iz drugog direktorijuma repozitorijuma. |
| **Inventar** (Inventory) | Ansible inventar ili radni prostor za Terraform aplikacije. |
| **Grupe promenljivih** (Variable Groups) | Jedna ili više grupa promenljivih čije se promenljive i tajne ubacuju u zadatak, pogledajte [Grupe promenljivih](../environment). |
| **Vault lozinka** (Vault password) (Ansible) | Ključevi koji se koriste za otključavanje Ansible Vault-a, pogledajte [Više vault lozinki](../apps/ansible#multiple-vault-passwords). |
| **Prikaz** (View) | Kartica [prikaza](./views) u kojoj se šablon prikazuje. |
| **CLI argumenti** (CLI args) | Dodatni argumenti komandne linije kao JSON niz, na primer `["-vvv"]`. |

### Polja specifična za tip {#type-specific-fields}

| Polje | Tip | Opis |
|---|---|---|
| **Početna verzija** (Start Version) | Build | Prva verzija koja se dodeljuje, na primer `1.0.0`. |
| **Build šablon** (Build Template) | Deploy | Build šablon čije artefakte ovaj šablon isporučuje. |
| **Automatsko pokretanje** (Autorun) | Deploy | Automatsko pokretanje deploy-a nakon svakog uspešnog build-a. |

### Napredne opcije {#advanced-options}

| Polje | Opis |
|---|---|
| **Dozvoli paralelne zadatke** (Allow parallel tasks) | Dozvoljava istovremeno izvršavanje više zadataka ovog šablona, pogledajte [Paralelni zadaci](#parallel-tasks). |
| **Obaveštenja** (Alerts), **Šalji pri uspehu** (Send on success), **Šalji pri grešci** (Send on error) | Da li se šalju obaveštenja za zadatke ovog šablona i za koje rezultate. Obaveštenja takođe zahtevaju opciju **Dozvoli obaveštenja za ovaj projekat** (Allow alerts for this project) u [podešavanjima projekta](../projects/settings). |
| **Oznaka runner-a** (Runner tag) (Pro) | Izvršavanje zadataka samo na runner-ima (Runner) sa ovom oznakom, pogledajte [Runner-i projekta](../projects/runners). |
| **Executor image** | Image kontejnera za Docker i Kubernetes runner-e, pogledajte [Executor image](#executor-image-docker-and-kubernetes-runners). |
| **Izdaj JWT runner-u zadatka** (Issue JWT to task runner), **JWT audience**, **JWT TTL** | Dodeljuje zadatku potpisani token, pogledajte [JWT tokeni zadataka](./jwt). |
| **Automatski pokreni zadatak ako je pronađen novi git commit** (Auto-run task if new git commit have been found) | Proverava repozitorijum u zadatom intervalu i pokreće zadatak kada se grana pomeri. |
| **Promenljive ankete** (Survey variables) | Unosi koje korisnik popunjava prilikom pokretanja zadatka, pogledajte [Promenljive ankete](./survey-vars). |

### Upiti {#prompts}

Upiti (Prompts) su polja za potvrdu koja korisniku omogućavaju da promeni ugrađene opcije u dijalogu Novi zadatak (New Task): granu, inventar, CLI argumente i, za Ansible, limit, tagove, preskočene tagove, nivo otklanjanja grešaka i Galaxy instalaciju. Pogledajte [Upiti](./prompts).

### Opcije aplikacija {#application-options}

- **Ansible**: opcije za limit, tagove, preskočene tagove i Galaxy instalaciju, pogledajte [Ansible](../apps/ansible).
- **Terraform/OpenTofu/Terragrunt**: automatsko odobravanje i zamena backend-a, pogledajte [Terraform/OpenTofu](../apps/terraform) i [HTTP backend](../apps/terraform/states).

---

## Paralelni zadaci {#parallel-tasks}

Zadaci iz istog šablona podrazumevano se izvršavaju sekvencijalno. Da biste dozvolili istovremeno izvršavanje istog šablona, uključite opciju „Dozvoli paralelne zadatke" (Allow parallel tasks) u podešavanjima šablona.

## Executor image (Docker i Kubernetes runner-i) {#executor-image-docker-and-kubernetes-runners}

Kada runner projekta koristi **Docker** (Pro) ili **Kubernetes** (Enterprise) executor, svaki zadatak se obično izvršava u podrazumevanom job image-u podešenom na runner-u (na primer `semaphoreui/job:latest`). Taj image možete zameniti za svaki šablon posebno.

1. Otvorite podešavanja šablona
2. U polje **Executor image** unesite referencu na image kontejnera (na primer `my-registry/ansible:2.16` ili `semaphoreui/job:latest`)
3. Sačuvajte šablon

**Ponašanje**:
- Ovo polje poštuju samo **Docker** i **Kubernetes** executor-i runner-a; lokalni executor ga ignoriše
- Ostavite polje prazno da bi se koristio podrazumevani image runner-a iz `runner.executor.docker.image` ili `runner.executor.k8s.image`
- Brisanje sadržaja polja u interfejsu uklanja zamenu

**Primeri upotrebe**:
- Šabloni kojima je potreban drugačiji skup alata (stariji Ansible, određena verzija Terraform-a, dodatni OS paketi ugrađeni u prilagođeni image)
- Izolovani image-i za bezbednosno osetljive šablone bez promene podrazumevane vrednosti za ceo runner

Pogledajte [Podešavanje runner-a](/admin-guide/configuration) za podešavanja podrazumevanog image-a i [Runner-i projekta](/user-guide/projects/runners) za podešavanje executor-a.
