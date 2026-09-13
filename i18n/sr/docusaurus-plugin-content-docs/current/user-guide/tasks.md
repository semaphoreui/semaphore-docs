# Zadaci

Zadatak (Task) je jedno izvršavanje [šablona zadatka](./task-templates) (Task Template): jedno pokretanje Ansible playbook-a, Terraform/OpenTofu/Terragrunt konfiguracije ili Bash, PowerShell ili Python skripte. Svaki zadatak čuva sopstveni log, status i detalje, tako da uvek možete videti šta je pokrenuto, kada, ko je to uradio i sa kojom revizijom repozitorijuma.

## Pokretanje zadatka {#starting-a-task}

Potrebna vam je uloga **Izvršilac zadataka** (Task Runner) ili viša u projektu (pogledajte [Timovi](./team)). Zadatak pokrećete na jednom od dva mesta:

- U odeljku **Šabloni zadataka** (Task Templates) kliknite na dugme **play** u redu šablona.
- Na stranici šablona kliknite na dugme u gornjem desnom uglu. Njegova oznaka zavisi od tipa šablona: **Pokreni** (Run), **Build** ili **Deploy**.

Oba otvaraju dijalog **Novi zadatak** (New Task). Njegov sadržaj zavisi od aplikacije i opcija uključenih u šablonu.

![Dijalog Novi zadatak za Ansible šablon](/assets/task-new-ansible.webp)

| Polje | Prikazuje se za | Opis |
|---|---|---|
| **Poruka** (Message) | sve šablone | Opciona napomena koja se čuva uz zadatak i prikazuje u istoriji i obaveštenjima. |
| **Verzija build-a** (Build Version) | deploy šablone | Koji build se isporučuje. Podrazumevano je izabran poslednji uspešan build. Pogledajte [Build i deploy šabloni](./task-templates/build-deploy). |
| Anketne promenljive | šablone sa [anketnim promenljivama](./task-templates/survey-vars) | Jedno polje po promenljivoj; obavezne promenljive moraju biti popunjene. |
| **Probno pokretanje** (Dry Run) `--check`, **Diff** `--diff` | Ansible | Pokreće playbook u režimu provere ili prikazuje izmene fajlova. Ostali Ansible upiti (Limit, Tags, Skip tags, Debug) pojavljuju se kada su uključeni u šablonu, pogledajte [Upiti](./task-templates/prompts). |
| **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure** | Terraform, OpenTofu, Terragrunt | Pokreće samo `plan`, dodaje `-destroy`, `-auto-approve`, `-upgrade` ili `-reconfigure`. Pogledajte [Terraform/OpenTofu](./apps/terraform). |
| **Grana** (Branch), **Inventar** (Inventory), **CLI argumenti** (CLI args) | bilo koju aplikaciju | Zamenjuju vrednosti šablona za ovo pokretanje. Svaka zamena mora biti dozvoljena u podešavanjima šablona. |

![Dijalog Novi zadatak za Terraform šablon](/assets/task-new-terraform.webp)

Kliknite na **Pokreni** (Run) (ili **Build** / **Deploy**) da biste zadatak stavili u red.

### Red i paralelno izvršavanje {#queue-and-parallel-execution}

Zadaci istog šablona izvršavaju se jedan za drugim, osim ako je u šablonu uključena opcija **Dozvoli paralelne zadatke** (Allow parallel tasks). Projekat takođe može ograničiti ukupan broj pokrenutih zadataka opcijom **Maksimalan broj paralelnih zadataka** (Max number of parallel tasks) u [podešavanjima projekta](./projects/settings). Zadatak koji mora da čeka ostaje u statusu `waiting` i automatski se pokreće kada se oslobodi mesto.

## Prozor zadatka {#task-window}

Klik na zadatak bilo gde u korisničkom interfejsu otvara prozor zadatka. Zaglavlje prikazuje šablon, broj zadatka, poruku commit-a revizije repozitorijuma, oznaku statusa, ko je i kada pokrenuo zadatak, kao i trajanje. Ikona sa strelicama proširuje prozor na ceo ekran.

![Log zadatka](/assets/task-log.webp)

| Kartica | Sadržaj |
|---|---|
| **Log** | Izlaz zadatka uživo sa vremenskim oznakama. Log se prenosi dok se zadatak izvršava. **Sirovi log** (Raw log) otvara neobrađeni izlaz u novoj kartici pregledača. |
| **Detalji** (Details) | Informacije o šablonu (aplikacija, šablon), informacije o commit-u (poruka i heš) i informacije o izvršavanju: poruka, vreme kreiranja, početka i završetka, trajanje i, kada su postavljeni, runner, grana, limit i promenljive korišćene za pokretanje. |
| **Rezime** (Summary) (Pro) | Za Ansible zadatke: koliko je hostova završilo uspešno, a koliko neuspešno, sa tabelom neuspelih taskova po serveru. |

![Detalji zadatka](/assets/task-details.webp)

![Rezime zadatka](/assets/task-summary.webp)

## Statusi zadatka {#task-statuses}

| Status | Značenje |
|---|---|
| `waiting` | Zadatak je u redu: izvršava se drugi zadatak istog šablona, dostignuto je ograničenje projekta ili još nema dostupnog runner-a. |
| `starting` | Runner je preuzeo zadatak i priprema repozitorijum i okruženje. |
| `waiting_confirmation` | Alat je postavio pitanje i čeka korisnika, na primer `terraform apply` bez opcije **Auto Approve** ili skripta koja čita unos. Koristite **Potvrdi** (Confirm) ili **Odbij** (Reject) u prozoru zadatka. |
| `confirmed` | Korisnik je potvrdio pitanje; zadatak se nastavlja. |
| `rejected` | Korisnik je odbio pitanje; zadatak se završava. |
| `running` | Playbook ili skripta se izvršava. |
| `stopping` | Zatraženo je zaustavljanje i proces se prekida. |
| `stopped` | Korisnik je zaustavio zadatak. |
| `success` | Završen sa izlaznim kodom 0. |
| `error` | Završen sa izlaznim kodom različitim od nule ili nije uspeo da se pokrene. U korisničkom interfejsu se prikazuje kao **Neuspešno** (Failed). |

## Zaustavljanje zadataka {#stopping-tasks}

Otvorite prozor pokrenutog zadatka i kliknite na **Zaustavi** (Stop). Semaphore šalje signal za prekid i zadatak prelazi u status `stopping` dok se proces završava. Ako proces ne reaguje, dugme se menja u **Prisilno zaustavi** (Force Stop); kliknite na njega da biste odmah ubili proces.

Da biste zaustavili sve pokrenute zadatke i zadatke u redu jednog šablona, otvorite stranicu šablona i koristite **Zaustavi sve** (Stop all). Padajući meni nudi i **Zaustavi** (Stop) i **Prisilno zaustavi** (Force stop).

<div style={{maxWidth: 200}}>

![Meni Zaustavi sve](/assets/task-stop-all-menu.webp)

</div>

## Ponovno pokretanje zadatka {#running-a-task-again}

Na kartici **Zadaci** (Tasks) šablona svaki red ima dugme **ponovo pokreni** (rerun). Ono otvara dijalog Novi zadatak sa popunjenom porukom i parametrima tog zadatka.

![Zadaci šablona sa dugmadima za ponovno pokretanje](/assets/template-tasks.webp)

## Gde su zadaci navedeni {#where-tasks-are-listed}

- **Kontrolna tabla → Istorija** (Dashboard → History): svi zadaci projekta, pogledajte [Istorija](./projects/history).
- **Stranica šablona → Zadaci** (Tasks): zadaci jednog šablona.
- **Šabloni zadataka** (Task Templates): proširite red strelicom sa leve strane da biste videli najnovije zadatke šablona bez napuštanja liste.

## Čuvanje logova {#log-retention}

Zadaci i logovi se podrazumevano čuvaju zauvek. Koristite `max_tasks_per_template` da biste zadržali samo najnovije zadatke svakog šablona, pogledajte [Istorija](./projects/history#task-retention).
