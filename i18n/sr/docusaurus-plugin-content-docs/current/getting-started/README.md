---
title: Prvi koraci
description: Instalirajte Semaphore UI, pokrenite prvi Ansible zadatak, proverite rezultat i podesite raspored izvršavanja.
sidebar_label: Prvi koraci
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prvi koraci

Semaphore UI je veb interfejs i API za ponovljivu automatizaciju pomoću alata Ansible, Terraform/OpenTofu, Bash, PowerShell i Python. Objedinjuje automatizaciju iz Git-a, akreditive, promenljive, rasporede, tokove rada i izvršna okruženja, a zatim čuva status i dnevnik svakog izvršavanja.

Ovaj vodič koristi Ansible za prvi funkcionalni primer. Koristite playbook iz svog repozitorijuma ili ponovite primer sa snimaka ekrana pomoću javnog repozitorijuma [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo).

## 1. Instalirajte Semaphore

Izaberite način instalacije prema okruženju u kome će Semaphore raditi. Podrazumevano je izabran nativni paket.

<Tabs groupId="installation-method">
  <TabItem value="package" label="Nativni paket" default className="InstallationMethod">

Za Debian ili Ubuntu na `amd64`:

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

Za RHEL, Fedora, Rocky Linux, AlmaLinux ili CentOS Stream na `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

Podesite bazu podataka i prvog administratora, a zatim pokrenite Semaphore pomoću generisane konfiguracije:

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

Za lokalno isprobavanje izaberite SQLite, prihvatite ili podesite putanje baze podataka i playbook-ova, unesite javni URL i napravite prvog administratora kada se to zatraži.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

Napravite `compose.yaml`:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

Generišite ključ za šifrovanje i sa jakom administratorskom lozinkom ga stavite u datoteku `.env` pored `compose.yaml`:

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

Izostavite `.env` iz kontrole verzija i pokrenite kontejner:

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="Binarna arhiva" className="InstallationMethod">

Preuzmite arhivu za svoj operativni sistem i arhitekturu procesora sa stranice [GitHub Releases](https://github.com/semaphoreui/semaphore/releases). Primer za Linux `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

Za lokalno isprobavanje izaberite SQLite, prihvatite ili podesite putanje baze podataka i playbook-ova, unesite javni URL i napravite prvog administratora kada se to zatraži.

Za macOS izaberite arhivu `darwin`, a za Windows `.zip`. Ansible postupak u nastavku ovog vodiča i dalje zahteva Linux, macOS, WSL, kontejner ili Linux runner kao izvršno okruženje sa instaliranim Ansible-om.

  </TabItem>
  <TabItem value="helm" label="Kubernetes pomoću Helm-a" className="InstallationMethod">

Dodajte zvanični chart i pregledajte podrazumevane vrednosti pre instalacije:

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

Polje `appVersion` chart-a označava verziju Semaphore-a. Pre produkcione upotrebe podesite trajno skladište, bazu podataka, administratorske akreditive, ključ za šifrovanje pristupnih ključeva i ingress/TLS u `values.yaml`.

  </TabItem>
</Tabs>

Za vođeno podešavanje koristite zvaničnu [stranicu za instalaciju Semaphore-a](https://semaphoreui.com/install) da izaberete izdanje, napravite konfiguraciju i dobijete odgovarajuće komande za preuzimanje ili pokretanje.

<details>
<summary>Niste sigurni koji način instalacije da izaberete?</summary>

| Način instalacije | Kada ga izabrati | Detaljan vodič |
| --- | --- | --- |
| **Nativni paket** | Podržan Linux server | [Instalacija pomoću upravljača paketima](/admin-guide/installation/package-manager) |
| **Docker Compose** | Brza izolovana instalacija ili host za kontejnere | [Docker instalacija](/admin-guide/installation/docker) |
| **Binarna arhiva** | macOS, Windows, FreeBSD ili Linux bez odgovarajućeg paketa | [Instalacija binarne datoteke](/admin-guide/installation/binary-file) |
| **Kubernetes pomoću Helm-a** | Postojeći Kubernetes klaster | [Kubernetes instalacija](/admin-guide/installation/k8s) |

Detaljni vodiči obuhvataju produkcione baze podataka, servise, tajne, skladište, ingress i nadogradnje.

</details>

Za ovaj Ansible postupak, `git --version` i `ansible-playbook --version` moraju raditi na Semaphore serveru ili runner-u. Ako neka komanda nije dostupna, instalirajte [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) i [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) pre nastavka.

:::tip Produkciona instalacija
Pre korišćenja Semaphore-a u produkciji pregledajte [Konfiguraciju](/admin-guide/configuration), [Bezbednost](/admin-guide/security), [Runner-e](/admin-guide/runners), [Visoku dostupnost](/admin-guide/ha) i [Nadogradnju](/admin-guide/upgrading).
:::

## 2. Prijavite se

1. Otvorite Semaphore u pregledaču. Lokalna instalacija obično koristi [http://localhost:3000](http://localhost:3000).
2. Unesite administratorsko korisničko ime i lozinku definisane pomoću `semaphore setup` ili Docker administratorskih promenljivih.
3. Izaberite **Sign In**.

![Ekran za prijavu u Semaphore](/assets/getting-started/sign-in.jpg)

Za početno podešavanje koristite administratorski nalog jer može da pravi projekte i korisnike. Obični korisnici se prijavljuju na istoj stranici nakon što administrator napravi njihove naloge i odobri pristup projektu. Pogledajte [Upravljanje korisnicima](/user-guide/admin/users).

## 3. Napravite projekat

Nakon prijavljivanja u praznu Semaphore instancu, stranica **New Project** otvara se automatski. Ako projekti već postoje, otvorite birač projekata i izaberite **New Project...**. Popunite obrazac:

| Polje | Šta uneti |
| --- | --- |
| **Project Name** | Prepoznatljivo ime radnog prostora, na primer `Production infrastructure` ili ime aplikacije. |
| **Max number of parallel tasks** | Opciono. Ograničava istovremene zadatke u projektu; ostavite prazno da biste koristili ograničenje servera. |
| **Telegram Chat ID** | Opciono. Koristi se kada su za projekat podešena Telegram obaveštenja. |
| **Allow alerts for this project** | Opciono. Uključuje podešena obaveštenja projekta. |
Izaberite **Create**.

Nemojte birati **Create Demo Project**: ta opcija dodaje primere resursa, dok ovaj vodič pravi prazan projekat. Kada kasnije pravite drugi projekat, ista opcija pojavljuje se kao prekidač **Demo** u dijalogu New Project.

![Prazan obrazac New Project sa svim dostupnim poljima](/assets/getting-started/new-project-empty.jpg)

Novi projekat sadrži odeljke **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store** i **Repositories**. Pogledajte [Projekte](/user-guide/projects) za podešavanja projekta, pristup tima, aktivnosti i istoriju.

<details>
<summary>Pogledajte ovaj korak</summary>

![Pravljenje prvog projekta u praznoj Semaphore instanci](/assets/getting-started/create-first-project.gif)

</details>

## 4. Razumite osnovne pojmove

Novi projekat otvara prazan Dashboard. Bočna traka je glavna navigacija projekta:

![Interfejs praznog Semaphore projekta pre dodavanja resursa i zadataka](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** prikazuje istoriju izvršavanja, statistiku, aktivnosti i podešavanja projekta.
- **Task Templates**, **Workflows** i **Schedule** definišu šta se izvršava i kada.
- **Repositories**, **Inventory**, **Variable Groups** i **Key Store** obezbeđuju kod, ciljeve, promenljive i akreditive.
- **Integrations**, **Team** i **Runners** povezuju spoljne sisteme, korisnike i izvršne hostove.

Dijagram pokazuje kako ovi resursi dovode do izvršavanja:

<div class="BlockSchema">
  ![Kako Semaphore resursi i okidači dovode do izvršavanja zadatka](/assets/getting-started/core-concepts.svg)
</div>

Radnja u interfejsu, API zahtev ili raspored mogu direktno pokrenuti **Task Template** ili pokrenuti **Workflow** koji koristi šablone zadataka. Semaphore pravi izvršavanje, prikazano kao **Task** u interfejsu, i šalje ga Semaphore serveru ili odgovarajućem udaljenom runner-u. Za Ansible, taj izvršni host pokreće `ansible-playbook`; Inventory navodi sisteme kojima Ansible upravlja.

| Pojam | Uloga |
| --- | --- |
| [**Project**](/user-guide/projects) | Izolovan radni prostor sa resursima automatizacije, dozvolama i istorijom izvršavanja. |
| [**Repository**](/user-guide/repositories) | Upućuje na Git granu ili oznaku sa datotekama automatizacije koje zadatak koristi. |
| [**Key Store**](/user-guide/key-store) | Čuva višekratne SSH ključeve, akreditive, tokene i Ansible Vault lozinke izvan Git-a i ulaznih podataka zadataka. |
| [**Inventory**](/user-guide/inventory) | Govori Ansible-u kojim hostovima i grupama da upravlja i koje akreditive da koristi. |
| [**Variable Group**](/user-guide/environment) | Čuva višekratne Ansible promenljive, promenljive okruženja i tajne za jedan ili više šablona. |
| [**Task Template**](/user-guide/task-templates/) | Čuva šta treba izvršiti: tip automatizacije, datoteku, repozitorijum, inventar, promenljive, tražene parametre i opcije izvršavanja. |
| [**Task (task run)**](/user-guide/tasks) | Jedno izvršavanje sa sopstvenim ulazima, statusom, vremenskim oznakama, dnevnikom, detaljima i rezultatom. |
| **Workflow** | Povezuje šablone zadataka u putanju sa više koraka i granama za uspeh, neuspeh, odobrenje i beleške. |
| [**Schedule**](/user-guide/schedules) | Pokreće šablon zadatka ili tok rada jednom ili ponavljano prema cron izrazu. |
| [**Runner**](/admin-guide/runners) | Izvršava zadatke iz reda izvan glavnog Semaphore servera, na primer u drugoj mreži ili bezbednosnoj zoni. |

## 5. Povežite repozitorijum

Repository povezuje Semaphore sa automatizacijom u Git-u; Semaphore ne čuva sam playbook. Povežite svoj repozitorijum ili koristite vrednosti javnog demonstracionog primera ispod da biste ga tačno ponovili. [Integracije](/user-guide/integrations) su zasebna funkcija za pokretanje automatizacije iz GitHub-a, GitLab-a ili drugih webhook izvora.

1. Otvorite **Repositories** i izaberite **New Repository**.
2. Unesite ime, URL, granu i akreditive repozitorijuma. Za javni demonstracioni primer koristite:

   | Polje | Vrednost |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None`, jer je ovaj repozitorijum javan |

3. Izaberite **Create**.

![Obrazac repozitorijuma popunjen javnim Semaphore demonstracionim repozitorijumom](/assets/getting-started/repository-settings.jpg)

Repozitorijum bi sada trebalo da se pojavi na listi. Semaphore ga klonira ili ažurira na izvršnom hostu kada zadatak počne, a ne kada napravite Repository zapis. Snimak ekrana prikazuje demonstracione vrednosti iz ovog vodiča.

![Povezan Demo repozitorijum na listi repozitorijuma projekta](/assets/getting-started/connected-repository.jpg)

Za privatni repozitorijum izaberite odgovarajuće Key Store akreditive umesto `None`. Pogledajte [Repozitorijume](/user-guide/repositories) za lokalne putanje, HTTPS, SSH, grane, akreditive i datoteke zavisnosti.

## 6. Dodajte SSH ključ za udaljeni upravljani host

Ovi SSH akreditivi omogućavaju Ansible-u da se poveže sa Semaphore servera ili runner-a na udaljeni host iz Inventory-ja. Za demonstracioni primer sa `localhost` nije potreban SSH ključ; nastavite na korak 7.

Primer koristi `localhost` sa `ansible_connection=local`, pa ne otvara SSH vezu. Kada vaš playbook upravlja udaljenim hostom, dodajte njegov ključ:

1. Dodajte javni deo ključa u `~/.ssh/authorized_keys` na upravljanom hostu.
2. Otvorite **Key Store** i izaberite **New Key**.
3. Unesite prepoznatljivo ime, na primer `Production hosts`, ostavite **Local** izabrano i izaberite **SSH Key**.
4. Unesite nalog koji Ansible treba da koristi na hostu, na primer `ubuntu` ili `ec2-user`.
5. Nalepite ceo privatni ključ, uključujući redove `BEGIN` i `END`, i dodajte pristupnu frazu ako je potrebna.
6. Izaberite **Create**. U sledećem koraku izaberite ovaj ključ pod **Inventory → User Credentials**.

![Obrazac New SSH Key za nalog koji se koristi na upravljanim hostovima](/assets/getting-started/add-managed-host-ssh-key.jpg)

Snimak ekrana sadrži zamensku vrednost, a ne važeću tajnu. Nikada ne objavljujte privatni ključ u dokumentaciji, snimcima ekrana, argumentima zadataka ili kontroli verzija.

Semaphore može da čuva tajne lokalno ili da se integriše sa spoljnim skladištima kao što su [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) i [Devolutions Server](/user-guide/key-store/devolutions-server). Pogledajte [Skladište ključeva](/user-guide/key-store) za sve podržane tipove akreditiva i opcije čuvanja.

## 7. Napravite Ansible inventar

Svakom Ansible zadatku potreban je inventar. Za prvo lokalno izvršavanje dodajte u repozitorijum datoteku kao što je `inventory.ini`:

```ini
[local]
localhost ansible_connection=local
```

Ovde `localhost` označava izvršni host, odnosno Semaphore server, kontejner ili runner, a ne nužno računar sa otvorenim pregledačem. `ansible_connection=local` govori Ansible-u da ne koristi SSH. Demonstracioni repozitorijum koristi ekvivalentnu datoteku `invs/prod/hosts` sa grupom `site`.

Ako ste napravili `inventory.ini` u svom repozitorijumu, napravite commit i pošaljite ga na granu povezanu sa Semaphore-om pre nastavka.

1. Otvorite **Inventory** i izaberite **New Inventory → Ansible Inventory**.
2. Unesite vrednosti koje odgovaraju vašem inventaru. Na primer:

   | Polje | Vrednost |
   | --- | --- |
   | **Name** | `Local` (`Prod` u demonstracionom primeru) |
   | **User Credentials** | `None` za `localhost`; za udaljeni inventar koristite SSH akreditive hosta |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini` (`invs/prod/hosts` u demonstracionom primeru) |

3. Ostavite **Runner tag**, **Sudo Credentials** i **Repository** prazno, pa izaberite **Create**.

![Ansible inventar iz datoteke podešen vrednostima demonstracionog repozitorijuma](/assets/getting-started/ansible-inventory-settings.jpg)

Ako je **Repository** prazno, Semaphore razrešava relativnu putanju inventara iz repozitorijuma izabranog u šablonu zadatka. Ovde birajte repozitorijum samo ako je inventar na drugom mestu. Za udaljeni host koristite SSH ključ iz koraka 6 kao **User Credentials**.

Pogledajte [Inventar](/user-guide/inventory) za statičke, datotečne i dinamičke inventare.

## 8. Dodajte grupu promenljivih (opciono)

**Variable Group** je višekratni skup vrednosti koji možete pridružiti jednom ili više šablona zadataka. Koristite **Extra variables** za Ansible promenljive, **Environment variables** za vrednosti izvezene procesu i **Secrets** za osetljive vrednosti koje treba šifrovati i maskirati. Tako konfiguracija specifična za okruženje ostaje izvan playbook-a i ne morate ponavljati iste vrednosti u svakom šablonu.

Prvi zadatak radi i bez grupe promenljivih. Kao primer, napravite grupu koja postavlja `ansible_python_interpreter=auto_silent`; Ansible će i dalje automatski pronaći Python, ali neće ispisivati informativno upozorenje o otkrivanju.

1. Otvorite **Variable Groups** i izaberite **New Group**.
2. Postavite **Group Name** na opisno ime, na primer `Ansible defaults`.
3. Pod **Variables → Extra variables** ostavite **Table** izabrano i izaberite **+**.
4. Unesite:

   | Ime | Tip | Vrednost |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. Izaberite **Save**.

![Grupa promenljivih podešena u tabelarnom uređivaču](/assets/getting-started/variable-group-table.jpg)

Pogledajte [Grupe promenljivih](/user-guide/environment) za pravila prioriteta i opcije čuvanja tajni.

## 9. Napravite šablon Ansible zadatka

### Pregledajte playbook u Git-u

Ako povezani repozitorijum već sadrži Ansible playbook, koristite ga. U suprotnom dodajte mali primer kao što je `get-started.yml`:

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

Ako pratite demonstracioni primer, koristite njegov [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml). On cilja grupu `site` iz demonstracionog inventara i izvršava uključenu ulogu `ping`.

Primer preuzima tu ulogu iz Git podmodula i šalje jedan ICMP zahtev na `semaphoreui.com`, pa izvršni host mora imati pristup GitHub-u i odlazni ICMP. Ako je ICMP blokiran, koristite lokalni primer `get-started.yml`.

![ping.yml u povezanom GitHub repozitorijumu](/assets/getting-started/demo-playbook-github.jpg)

Snimak ekrana prikazuje playbook u javnom demonstracionom repozitorijumu. Čuvanje automatizacije u Git-u omogućava pregled izmena i Semaphore-u da zabeleži tačan commit korišćen za svako izvršavanje.

Ako ste napravili `get-started.yml` u svom repozitorijumu, napravite commit i pošaljite ga na granu povezanu sa Semaphore-om pre nastavka.

### Podesite šablon

1. Otvorite **Task Templates** i izaberite **New template → Applications**.
2. Uključite **Ansible Playbook**, pa se vratite na **Task Templates**.
3. Izaberite **New template → Ansible Playbook**.
4. Ostavite karticu **Task** izabranu. **Build** i **Deploy** su verzionisani CI/CD tipovi šablona i nisu potrebni za ovo nezavisno izvršavanje.
5. Podesite šablon vrednostima koje odgovaraju vašim datotekama. Na primer:

   | Polje | Vrednost | Uloga |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | Identifikuje višekratni šablon i njegovu istoriju zadataka. |
   | **Repository** | Vaš repozitorijum (`Demo` u primeru) | Obezbeđuje playbook i povezane datoteke. |
   | **Path to playbook file** | `get-started.yml` (`ping.yml` u demonstracionom primeru) | Razrešava se od korena repozitorijuma. |
   | **Inventory** | `Local` (`Prod` u demonstracionom primeru) | Obezbeđuje lokalni cilj za prvo izvršavanje. |
   | **Variable Groups** | `Ansible defaults`, ako je napravljena | Dodaje opciono višekratno Ansible podešavanje. |
   | **Runner tag** | Ostavite prazno | Koristi lokalno izvršavanje ili podrazumevani runner, u zavisnosti od konfiguracije servera. |

6. Pod **Ansible options** uključite **Skip Galaxy install** za mali playbook iznad ili javni demonstracioni primer: nijednom nisu potrebne Galaxy zavisnosti za ovaj zadatak. Ostavite isključeno ako vaš repozitorijum zahteva uloge ili kolekcije iz datoteke `requirements.yml`.
7. Izaberite **Create**.

![Šablon Ansible zadatka sa repozitorijumom, inventarom i grupom promenljivih](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>Pogledajte ovaj korak</summary>

![Uključivanje Ansible-a i pravljenje prvog šablona Ansible zadatka](/assets/getting-started/create-ansible-template.gif)

</details>

Ostala korisna polja:

- **Vaults** bira Key Store lozinke za šifrovani Ansible sadržaj.
- **Limit**, **Tags** i **Skip tags** sužavaju obim izvršavanja playbook-a.
- **Prompts** omogućavaju korisniku interfejsa, rasporedu ili API zahtevu da zamene dozvoljene vrednosti za određeno izvršavanje.
- **Runner tag** određuje gde se zadatak izvršava; ne bira Ansible cilj.

Pogledajte [Ansible šablone](/user-guide/apps/ansible) i [Šablone zadataka](/user-guide/task-templates/) za sva polja i opcije izvršavanja.

## 10. Pokrenite šablon i pregledajte zadatak

1. Otvorite napravljeni šablon zadatka i izaberite **Run**.
2. Opciono dodajte poruku kao što je `First Semaphore run`.
3. Ostavite **Dry Run** i **Diff** isključeno, pa izaberite **Run**.

![Dijalog New Task bez dodatnih opcija za Ansible playbook](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore stavlja zadatak u red, priprema repozitorijum, primenjuje inventar i opcionu grupu promenljivih, pa izvršava izabrani playbook. Status prolazi kroz **Waiting** i **Running**, a završava se kao **Success** ili **Failed**.

### Dnevnik

**Log** sadrži stvarni izlaz komandi. Pročitajte završni `PLAY RECAP`, a ne samo zeleni indikator statusa.

![Dnevnik uspešnog Ansible zadatka sa ping izlazom i PLAY RECAP rezimeom](/assets/getting-started/ansible-task-log-variable-group.jpg)

Tačni brojači zavise od vašeg playbook-a. Uspešno prvo izvršavanje treba da se završi sa `unreachable=0` i `failed=0` za `localhost`. Ako demonstracioni dnevnik prikazuje `changed=1`, njegov ping korak preko shell-a je izvršen i prijavio je izmenu; to nije greška.

### Detalji i rezime

| Kartica | Šta proveriti |
| --- | --- |
| **Log** | Faze izvršavanja uživo, izlaz modula, greške i završni `PLAY RECAP`. |
| **Details** | Tip šablona, Git commit, poruka izvršavanja, autor, vremenske oznake i trajanje. |
| **Summary** | Ansible rezultati i greške po hostu nakon završetka, kada je funkcija rezimea zadataka dostupna. |

![Detalji zadatka sa šablonom, commit-om i vremenskim podacima](/assets/getting-started/ansible-task-details.jpg)

![Rezime zadatka sa brojem OK i Not OK hostova](/assets/getting-started/ansible-task-summary.jpg)

Ako **Summary** nije dostupan, proverite izvršavanje u **Log**; `PLAY RECAP` ostaje merodavan Ansible rezultat.

<details>
<summary>Pogledajte izvršavanje i rezultat</summary>

![Pokretanje Ansible zadatka i pregled njegovog dnevnika i detalja](/assets/getting-started/run-and-inspect-task.gif)

</details>

### Pronađite prethodna izvršavanja

Zatvorite prozor zadatka da biste se vratili na karticu **Tasks** šablona. Svako izvršavanje ima sopstveni broj zadatka, status, korisnika, vreme početka, trajanje i sačuvani dnevnik. **Dashboard → History** prikazuje izvršavanja svih šablona u projektu. Pogledajte [Zadatke](/user-guide/tasks) i [Istoriju projekta](/user-guide/projects/history) za više detalja.

![Istorija Ansible šablona sa uspešnim izvršavanjima zadataka](/assets/getting-started/ansible-template-history.jpg)

Ako zadatak ne uspe, na osnovu poslednjeg smislenog reda dnevnika izaberite sledeću proveru:

- Greška kloniranja ukazuje na URL repozitorijuma, granu, Access Key ili mrežni pristup sa izvršnog hosta.
- `ansible-playbook: command not found` znači da Ansible nedostaje na Semaphore serveru ili izabranom runner-u.
- `UNREACHABLE` ukazuje na adrese u inventaru, akreditive hosta, SSH dostupnost ili proveru ključa hosta.
- Neuspešan Ansible korak obično navodi ime zadatka, host i grešku modula neposredno iznad `PLAY RECAP`.

## 11. Pokrenite zadatak po rasporedu

Nakon uspešnog izvršavanja iz interfejsa, zadatak možete pokretati automatski. Na primer, cron izraz `0 3 * * *` pokreće ga svakog dana u 03:00 u vremenskoj zoni koju prikazuje Semaphore.

1. Otvorite **Schedule** i izaberite **New Schedule → Cron**.
2. Unesite opisno ime, na primer `Nightly playbook`.
3. Izaberite šablon zadatka koji želite da pokrenete.
4. Ostavite **Show cron format** uključeno i unesite cron izraz, na primer `0 3 * * *`.
5. Ostavite **Enabled** izabrano i izaberite **Save**.

![Cron raspored za svakodnevno izvršavanje primera zadatka u 03:00](/assets/getting-started/create-cron-schedule.jpg)

Semaphore prikazuje podešenu vremensku zonu i računa sledeće izvršavanje pre čuvanja. Zakazano izvršavanje koristi isti repozitorijum, inventar, grupe promenljivih i podešavanja izvršavanja kao šablon. Ako šablon izlaže tražene parametre, raspored može da zada njihove vrednosti. Pogledajte [Rasporede](/user-guide/schedules) za cron sintaksu, vremenske zone, jednokratna izvršavanja i zakazane parametre.

Nakon čuvanja proverite da je raspored **Enabled** i da **Next run** pokazuje očekivano vreme. Zakazani zadaci pojavljuju se na kartici **Tasks** šablona i u **Dashboard → History**.

## Šta isprobati dalje

Kada prvi Ansible zadatak uspe:

- Dodajte odgovarajuće privatne akreditive u [Skladište ključeva](/user-guide/key-store) ako repozitorijum zahteva autentifikaciju.
- Napravite **Workflow** kada je za više šablona potreban uređen tok uspeha, neuspeha, odobrenja ili beleški.
- Koristite [Integracije](/user-guide/integrations) za autentifikovane webhook okidače iz GitHub-a, GitLab-a ili drugog sistema.
- Koristite [API](/reference/api) za programsko upravljanje resursima i pokretanje šablona.
- Dodajte [udaljeni runner](/admin-guide/runners) kada izvršavanje mora biti u drugoj mreži, operativnom sistemu ili bezbednosnoj zoni.

Za produkciju postavite Semaphore iza HTTPS-a, zajedno pravite rezervne kopije baze podataka i tajne za šifrovanje pristupnih ključeva, podesite centralizovanu autentifikaciju i pregledajte [Bezbednost](/admin-guide/security), [Dnevnike](/admin-guide/logs) i [Nadogradnju](/admin-guide/upgrading).
