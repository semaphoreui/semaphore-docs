# Upiti

Upiti (Prompts) su unapred definisane zastavice i opcije specifične za svaki tip šablona koje možete uključiti da biste omogućili prilagođavanje u vreme izvršavanja. Za razliku od [anketnih promenljivih](/user-guide/task-templates/survey-vars) (Survey Variables), koje su prilagođena polja koja sami kreirate, upiti su ugrađene opcije koje odgovaraju određenim CLI zastavicama za Ansible, Terraform i druge alate.

Ova funkcionalnost vam omogućava da:
- Zamenite podrazumevane vrednosti šablona u vreme izvršavanja
- Ciljate određene hostove ili resurse
- Kontrolišete ponašanje izvršavanja pomoću CLI zastavica
- Prosleđujete opcije izvršavanja preko API poziva ili rasporeda

## Upiti i anketne promenljive {#prompts-vs-survey-variables}

| Karakteristika | Upiti | Anketne promenljive |
|---------|---------|-----------------|
| **Definicija** | Unapred definisane opcije specifične za šablon | Prilagođena polja koja sami kreirate |
| **Primeri** | Ansible: `--limit`, `--tags`<br/>Terraform: workspace-ovi, `-destroy` | Naziv okruženja, broj verzije, prilagođeni parametri |
| **Podešavanje** | Uključuju se poljima za potvrdu u šablonu | Dodaju se u podešavanjima šablona sa nazivom i tipom |
| **Prosleđuju se kao** | Ugrađene CLI zastavice | Ansible: `--extra-vars`<br/>Terraform: `-var` |

**Upiti** su standardizovane opcije ugrađene u Semaphore za određene alate, dok su **anketne promenljive** fleksibilna prilagođena polja koja sami definišete.

## Ansible upiti {#ansible-prompts}

Za šablone Ansible playbook-a možete uključiti upite za sledeće CLI opcije:

### Limit {#limit}

Uključite upit `--limit` da biste naveli koje hostove treba ciljati pri pokretanju playbook-a.

**CLI ekvivalent**: `ansible-playbook playbook.yml --limit webservers`

**Slučajevi upotrebe**:
- Pokretanje playbook-a na podskupu hostova iz inventara
- Ciljanje određenih servera za isporuku
- Testiranje izmena na jednom hostu pre šireg uvođenja

**Primer**:
- Vaš inventar sadrži 50 veb servera
- Uključite upit Limit
- Pri pokretanju zadatka navedite `web-01.example.com` da biste ciljali samo taj server
- Ili navedite `webservers:&production` da biste ciljali produkcione veb servere

### Tags {#tags}

Uključite upit `--tags` da biste pokretali samo taskove sa određenim tagovima.

**CLI ekvivalent**: `ansible-playbook playbook.yml --tags deploy,restart`

**Slučajevi upotrebe**:
- Izvršavanje samo određenih delova playbook-a
- Pokretanje koraka isporuke bez konfiguracionih taskova
- Brzo ponovno pokretanje servisa bez izvršavanja celog playbook-a

**Primer**:
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Uključite upit Tags i unesite `deploy,restart` da biste preskočili korak instalacije.

### Skip Tags {#skip-tags}

Uključite upit `--skip-tags` da biste preskočili taskove sa određenim tagovima.

**CLI ekvivalent**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**Slučajevi upotrebe**:
- Preskakanje opcionih taskova u produkciji
- Izuzimanje taskova za debagovanje ili testiranje
- Zaobilaženje vremenski zahtevnih taskova kada nisu potrebni

**Primer**: Koristeći gornji playbook, uključite Skip Tags i unesite `install` da biste preskočili instalaciju paketa i pokrenuli samo taskove isporuke i ponovnog pokretanja.

### Preskoči Galaxy instalaciju {#skip-galaxy-install}

Uključite upit da biste korisniku omogućili da pri pokretanju zadatka preskoči korak `ansible-galaxy install` za uloge i kolekcije.

**Slučajevi upotrebe**:
- Zahtevi su već instalirani u image-u runner-a
- Ušteda vremena pri ponovljenim pokretanjima kada se ništa nije promenilo u `requirements.yml`

### Prisilna Galaxy instalacija {#force-galaxy-install}

Uključite upit da biste korisniku omogućili da prisilno pokrene `ansible-galaxy install --force` za svaki fajl zahteva, ignorišući kontrolnu sumu zahteva koju Semaphore čuva između pokretanja.

**CLI ekvivalent**: `ansible-galaxy role install -r requirements.yml --force`

**Slučajevi upotrebe**:
- Fajl zahteva referencira granu umesto fiksne verzije i potreban vam je najnoviji commit
- Prethodna instalacija je ostavila uloge ili kolekcije u neispravnom stanju
- Provera da playbook radi sa čistim skupom zavisnosti

Pogledajte [Galaxy zahtevi](../apps/ansible.md#galaxy-requirements) da biste saznali kako rade podrazumevane vrednosti na nivou šablona.

### Uključivanje Ansible upita {#enabling-ansible-prompts}

Da biste uključili Ansible upite:

1. Idite na **Šablone zadataka** (Task Templates) i izaberite svoj Ansible šablon
2. Pronađite odeljak **Ansible upiti** (Ansible Prompts) u podešavanjima šablona
3. Uključite polja za potvrdu za željene upite:
   - ☐ **Limit** - Uključuje zastavicu `--limit`
   - ☐ **Tags** - Uključuje zastavicu `--tags`
   - ☐ **Skip Tags** - Uključuje zastavicu `--skip-tags`
   - ☐ **Debug** - Uključuje izbor nivoa detaljnosti (`-v`)
   - ☐ **Preskoči Galaxy instalaciju** (Skip Galaxy install) - Dozvoljava preskakanje `ansible-galaxy install`
   - ☐ **Prisilna Galaxy instalacija** (Force Galaxy install) - Dozvoljava prisilno izvršavanje `ansible-galaxy install --force`
4. Sačuvajte šablon

![](/assets/ansible_2.png)

Kada su uključena, ova polja se pojavljuju u formi za pokretanje zadatka, API zahtevima i podešavanjima rasporeda.

## Terraform/OpenTofu upiti {#terraformopentofu-prompts}

Za Terraform i OpenTofu šablone Semaphore nudi nekoliko ugrađenih upita:

### Izbor workspace-a {#workspace-selection}

Izaberite koji Terraform workspace će se koristiti za izvršavanje zadatka.

**CLI ekvivalent**: `terraform workspace select staging`

**Slučajevi upotrebe**:
- Upravljanje više okruženja (dev, staging, production)
- Odvojeni state fajlovi za različite konfiguracije
- Izolovano testiranje izmena infrastrukture

**Podešavanje**:
1. Kreirajte workspace-ove na kartici **Workspaces** šablona
2. Birač workspace-a se automatski pojavljuje u formi zadatka
3. Korisnici biraju ciljni workspace pri pokretanju zadataka

Detaljno podešavanje potražite u odeljku [Terraform workspace-ovi](/user-guide/apps/terraform/workspaces).

### Zastavica Destroy {#destroy-flag}

Uključite zastavicu `-destroy` da biste uklonili infrastrukturu.

**CLI ekvivalent**: `terraform apply -destroy`

**Slučajevi upotrebe**:
- Čišćenje privremenih testnih okruženja
- Povlačenje infrastrukture iz upotrebe
- Uklanjanje određenih resursa

**Važno**: Ovo je destruktivna operacija. Koristite je oprezno i razmislite o obaveznoj potvrdi u svojim tokovima rada.

### Zastavica Migrate State {#migrate-state-flag}

Uključite zastavicu `-migrate-state` kada menjate konfiguraciju backend-a.

**CLI ekvivalent**: `terraform init -migrate-state`

**Slučajevi upotrebe**:
- Premeštanje state-a na drugi backend
- Migracija između lokacija skladištenja
- Ažuriranje konfiguracije backend-a

### Uključivanje Terraform upita {#enabling-terraform-prompts}

Terraform upiti su dostupni u podešavanjima šablona:

1. Idite na **Šablone zadataka** (Task Templates) i izaberite svoj Terraform šablon
2. Podesite dostupne upite u podešavanjima šablona:
   - Izbor workspace-a (automatski uključen ako su workspace-ovi podešeni)
   - Opcija zastavice Destroy
   - Opcija Migrate state
3. Sačuvajte šablon

Forma zadatka prikazuje ove opcije pri pokretanju Terraform zadataka.

## Bash, PowerShell i Python upiti {#bash-powershell-and-python-prompts}

Za Bash, PowerShell i Python šablone upiti su minimalni, jer se većina prilagođavanja obavlja preko [anketnih promenljivih](/user-guide/task-templates/survey-vars).

Dostupni upiti su:

- CLI argumenti
- Grana

Ovi tipovi šablona imaju više koristi od prilagođenih anketnih promenljivih za prosleđivanje parametara skriptama.

## Korišćenje upita {#using-prompts}

### Ručno izvršavanje zadatka {#manual-task-execution}

Pri pokretanju zadatka iz šablona sa uključenim upitima:

1. Kliknite na **Pokreni** (Run) na šablonu
2. Pojavljuje se forma sa uključenim poljima upita
3. Popunite vrednosti za upite koje želite da koristite (opciona polja mogu ostati prazna)
4. Kliknite na **Pokreni zadatak** (Run Task)

Zadatak se izvršava sa vrednostima upita koje ste naveli, prosleđenim kao CLI zastavice.

### API pozivi {#api-calls}

Da biste vrednosti upita prosledili preko API-ja, uključite ih u telo zahteva:

**Ansible primer:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**Važno**: Upiti moraju biti uključeni u šablonu da bi vrednosti bile prihvaćene. Ako vrednosti upita prosledite preko API-ja bez da ih uključite, te vrednosti će biti ignorisane.

### Zakazani zadaci {#scheduled-tasks}

Rasporedi (Schedules) mogu sadržati vrednosti upita radi prilagođavanja automatizovanog izvršavanja zadataka:

**Primer**: Raspored sa Ansible upitima
- Dnevni raspored isporuke sa `limit: "production"` i `tags: "deploy"`
- Nedeljni raspored održavanja sa `tags: "updates,cleanup"`

Podesite vrednosti upita u podešavanjima rasporeda tako da svako zakazano pokretanje koristi navedene opcije.

### Integracije i webhook-ovi {#integrations-and-webhooks}

Integracije (Integrations) mogu izdvajati vrednosti iz webhook-ova i mapirati ih na upite:

**Primer**: GitHub webhook pokreće isporuku
- Izdvojite naziv grane iz webhook-a
- Mapirajte ga na upit Limit da biste ciljali određeno okruženje
- Isporučite samo na servere koji odgovaraju okruženju grane

Podešavanje webhook-ova potražite u odeljku [Integracije](../integrations).

## Najbolje prakse {#best-practices}

### Uključite samo neophodne upite {#enable-only-necessary-prompts}

Svaki uključeni upit dodaje polje u formu zadatka. Uključite samo upite koje će korisnici zaista morati da prilagođavaju.

✅ **Dobro**: Uključite Limit za operativne timove koji moraju da ciljaju određene hostove
❌ **Loše**: Uključite sve upite „za svaki slučaj“

### Kombinujte sa anketnim promenljivama {#combine-with-survey-variables}

Koristite upite za CLI opcije specifične za alat, a anketne promenljive za prilagođene parametre:

**Primer Ansible šablona:**
- **Upiti**: Limit (koji hostovi), Tags (koji taskovi)
- **Anketne promenljive**: `app_version` (koja verzija), `enable_rollback` (prilagođena logika)

### Dokumentujte upotrebu API-ja {#document-api-usage}

Ako se šabloni pokreću preko API-ja, dokumentujte koji su upiti dostupni i njihov očekivani format:

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### Koristite Limit za bezbedno testiranje {#use-limit-for-safe-testing}

Potencijalno destruktivne playbook-ove uvek prvo testirajte pomoću upita Limit:

1. Uključite upit Limit u šablonu
2. Prvo pokretanje: Navedite `limit: "test-server-01"` da biste testirali na jednom hostu
3. Proverite da je uspelo
4. Drugo pokretanje: Navedite `limit: "production"` da biste uveli izmene na sve hostove

### Proveravajte kombinacije upita {#validate-prompt-combinations}

Neke kombinacije upita možda nemaju smisla. Dodajte dokumentaciju ili validaciju:

- Korišćenje `--tags deploy` zajedno sa `--skip-tags deploy` je u sukobu
- Navođenje i workspace-a i zastavice destroy zahteva dodatnu opreznost

## Uobičajeni slučajevi upotrebe {#common-use-cases}

### Postepeno uvođenje pomoću Limit {#gradual-rollout-with-limit}

Postepeno isporučujte u produkciju pomoću Ansible upita Limit:

1. Pokretanje 1: `limit: "web-01.example.com"` - Isporuka na jedan server
2. Pratite da li ima problema
3. Pokretanje 2: `limit: "webservers:&canary"` - Isporuka na canary servere
4. Proverite metrike
5. Pokretanje 3: `limit: "webservers:&production"` - Potpuno uvođenje

### Selektivno izvršavanje pomoću Tags {#selective-execution-with-tags}

Koristite Tags da biste pokretali samo određene delove playbook-a:

**Ujutru**: `tags: "deploy"` - Isporuka nove verzije
**Popodne**: `tags: "config"` - Ažuriranje konfiguracije
**Uveče**: `tags: "restart"` - Ponovno pokretanje servisa sa novom konfiguracijom

### Upravljanje okruženjima pomoću workspace-ova {#environment-management-with-workspaces}

Koristite izbor Terraform workspace-a za upravljanje okruženjima:

- **Razvoj**: Izaberite workspace `dev` - jeftiniji resursi, brže iteracije
- **Staging**: Izaberite workspace `staging` - okruženje nalik produkciji za testiranje
- **Produkcija**: Izaberite workspace `prod` - puna produkciona infrastruktura

### Čišćenje pomoću Destroy {#cleanup-with-destroy}

Koristite Terraform destroy za privremenu infrastrukturu:

1. Kreirajte testno okruženje: Pokrenite sa workspace-om `test-branch-123`
2. Pokrenite integracione testove
3. Očistite: Pokrenite sa uključenom zastavicom destroy i workspace-om `test-branch-123`

## Rešavanje problema {#troubleshooting}

### Vrednosti upita se ignorišu {#prompt-values-ignored}

**Problem**: Prosleđujete vrednosti upita, ali nemaju efekta

**Rešenje**: Proverite da li je odgovarajući upit uključen u podešavanjima šablona. Upiti moraju biti eksplicitno uključeni.

### Nije moguće navesti limit {#cannot-specify-limit}

**Problem**: Polje Limit se ne pojavljuje u formi zadatka

**Rešenje**: 
1. Izmenite šablon
2. Pronađite odeljak „Ansible upiti“ (Ansible Prompts)
3. Uključite polje za potvrdu „Limit“
4. Sačuvajte šablon

### API pozivi sa vrednostima upita ne uspevaju {#api-calls-fail-with-prompt-values}

**Problem**: API zahtevi sa vrednostima upita vraćaju greške

**Rešenje**: 
1. Uverite se da su upiti uključeni u šablonu
2. Proverite JSON formatiranje u telu zahteva
3. Proverite da se nazivi polja tačno poklapaju (`limit`, a ne `host_limit`)

### Tagovi ne filtriraju taskove {#tags-not-filtering-tasks}

**Problem**: Navodite tagove, ali se i dalje izvršavaju svi taskovi

**Rešenje**: 
1. Proverite da taskovi u playbook-u imaju pravilno definisane tagove
2. Proverite da li ima grešaka u kucanju u nazivima tagova
3. Uverite se da su tagovi razdvojeni zarezom bez razmaka: `deploy,restart`, a ne `deploy, restart`

## Povezana dokumentacija {#related-documentation}

- [Anketne promenljive](/user-guide/task-templates/survey-vars) - Prilagođena polja za šablone
- [Ansible šabloni](/user-guide/apps/ansible) - Podešavanja specifična za Ansible
- [Terraform šabloni](/user-guide/apps/terraform) - Podešavanja specifična za Terraform
- [Rasporedi](../schedules) - Automatizovano izvršavanje zadataka
- [Integracije](../integrations) - Zadaci pokrenuti webhook-om
- [API dokumentacija](../../reference/api) - API referenca
