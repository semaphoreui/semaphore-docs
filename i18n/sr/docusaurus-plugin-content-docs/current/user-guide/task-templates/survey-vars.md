# Anketne promenljive

Anketne promenljive (Survey Variables) su prilagođena polja za unos koja možete dodati šablonima zadataka (Task Templates) da biste od korisnika prikupili podatke pri pokretanju zadataka. Umesto da vrednosti fiksno upisujete u playbook-ove ili skripte, možete definisati prilagođene promenljive koje od korisnika traže vrednosti u vreme izvršavanja.

Ova funkcionalnost je korisna za:
- Pokretanje istog šablona sa različitim parametrima (npr. konfiguracionim vrednostima)
- Prihvatanje dinamičkog unosa preko API poziva
- Prosleđivanje prilagođenih parametara u zakazanim zadacima
- Pokretanje zadataka iz integracija sa podacima izdvojenim iz webhook-a

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## Anketne promenljive i upiti {#survey-variables-vs-prompts}

Važno je razumeti razliku između anketnih promenljivih i upita (Prompts):

| Karakteristika | Anketne promenljive | Upiti |
|---------|-----------------|---------|
| **Definicija** | Prilagođena polja koja sami kreirate | Unapred definisane opcije specifične za šablon |
| **Primeri** | Naziv okruženja, broj verzije, API endpoint | Ansible: `--limit`, `--tags`<br/>Terraform: workspace-ovi |
| **Podešavanje** | Dodaju se u podešavanjima šablona sa nazivom i tipom | Uključuju se poljima za potvrdu u šablonu |
| **Prosleđuju se kao** | Ansible: `--extra-vars`<br/>Terraform: `-var` | Ugrađene CLI zastavice |

**Anketne promenljive** su fleksibilna prilagođena polja koja sami definišete, dok su **upiti** ugrađene opcije specifične za svaki tip šablona (kao što su Ansible zastavice `--limit` ili `--tags`).

## Dodavanje anketnih promenljivih u šablon {#adding-survey-variables-to-a-template}

Anketne promenljive se podešavaju u podešavanjima šablona:

1. Idite na **Šablone zadataka** (Task Templates) i izaberite svoj šablon
2. Pronađite odeljak **Anketne promenljive** (Survey Variables) u podešavanjima šablona
3. Kliknite na **Dodaj anketnu promenljivu** (Add Survey Variable)
4. Podesite promenljivu:
   - **Naziv** (Name): Naziv promenljive (koristi se u vašem kodu)
   - **Naslov** (Title): Oznaka koja se prikazuje u formi
   - **Tip** (Type): Izaberite tip polja
   - **Prosledi promenljivu kao** (Pass variable as): Dodatna promenljiva (podrazumevano) ili promenljiva okruženja
   - **Podrazumevana vrednost** (Default value): Opciona unapred popunjena vrednost koja se prikazuje kada se otvori forma zadatka
   - **Obavezno** (Required): Da li polje mora biti popunjeno
5. Sačuvajte šablon

Kada korisnici pokrenu zadatak iz ovog šablona, videće formu sa vašim prilagođenim anketnim promenljivama.

## Tipovi promenljivih {#variable-types}

Anketne promenljive podržavaju šest tipova:

### String {#string}

Tekstualno polje za unos string vrednosti.

**Slučajevi upotrebe**: Nazivi okruženja, nazivi grana, nazivi hostova, putanje fajlova

**Primer**: Promenljiva pod nazivom `environment` traži od korisnika da unese „production“, „staging“ ili „development“

### Integer {#integer}

Numeričko polje za unos celobrojnih vrednosti.

**Slučajevi upotrebe**: Brojevi portova, broj ponovnih pokušaja, vremenska ograničenja, ograničenja resursa

**Primer**: Promenljiva pod nazivom `timeout_seconds` traži od korisnika da unese „300“ ili „600“

### Text {#text}

Višelinijsko tekstualno polje za duže string vrednosti.

**Slučajevi upotrebe**: Poruke commit-a, JSON isečci, slobodne beleške, višelinijska konfiguracija

**Primer**: Promenljiva pod nazivom `changelog` u koju korisnici nalepe beleške o izdanju pre isporuke

### Enum (jednostruki izbor) {#enum-single-select}

Padajući meni u kojem korisnik bira tačno jednu opciju sa unapred definisane liste.

**Slučajevi upotrebe**: Tip okruženja, strategija isporuke, izbori nalik logičkim vrednostima

**Primer**: Promenljiva pod nazivom `deployment_type` sa opcijama: „rolling“, „blue-green“, „canary“

Prilikom kreiranja enum promenljive dodajte svaku opciju sa prikaznom oznakom i vrednošću u editoru promenljive.

### Select (višestruki izbor) {#select-multi-select}

Padajući meni u kojem korisnik može izabrati jednu ili više opcija sa unapred definisane liste. Izabrane vrednosti se prosleđuju kao JSON niz (na primer `["staging","production"]`), a ne kao jedan string.

**Slučajevi upotrebe**: Ciljni regioni, feature flag-ovi, više grupa hostova, liste tagova

**Primer**: Promenljiva pod nazivom `target_regions` sa opcijama `us-east-1`, `eu-west-1`, `ap-southeast-1`

**Ograničenja**:
- Podrazumevane vrednosti moraju biti izabrane sa liste opcija i mogu obuhvatati više izbora
- U Bash, PowerShell i Python šablonima parsirajte JSON niz iz argumenta ili vrednosti promenljive okruženja (pogledajte primere ispod)

### Secret {#secret}

Polje za unos lozinke u kojem je vrednost sakrivena.

**Slučajevi upotrebe**: API ključevi, lozinke, tokeni, osetljiva konfiguracija

**Primer**: Promenljiva pod nazivom `api_token` u kojoj se uneta vrednost radi bezbednosti prikazuje kao tačkice

## Podrazumevane vrednosti {#default-values}

Za većinu tipova promenljivih možete postaviti opcionu podrazumevanu vrednost. Kada korisnik otvori dijalog za pokretanje zadatka, polja su unapred popunjena tim vrednostima.

- **String, integer, text, secret**: jedna podrazumevana vrednost
- **Enum**: jedna opcija sa liste
- **Select**: jedna ili više opcija sa liste

Podrazumevane vrednosti su korisne za rasporede i integracije, gde se isti šablon pokreće više puta sa predvidivim parametrima. Korisnici i dalje mogu promeniti vrednosti pre pokretanja zadatka.

## Prosledi promenljivu kao (cilj) {#pass-variable-as-target}

Svaka anketna promenljiva može se isporučiti na jedan od dva načina:

| Podešavanje | Ponašanje |
|---------|----------|
| **Dodatna promenljiva** (Extra variable, podrazumevano) | Prosleđuje se na način specifičan za aplikaciju: Ansible `--extra-vars`, Terraform `-var` ili CLI argumenti `name=value` za shell aplikacije |
| **Promenljiva okruženja** (Environment variable) | Postavlja se kao promenljiva okruženja procesa čiji naziv odgovara nazivu anketne promenljive |

Koristite **Promenljiva okruženja** (Environment variable) kada vaša skripta ili alat čita iz okruženja umesto iz CLI zastavica. Za Terraform promenljive koje moraju pratiti konvenciju `TF_VAR_` nazovite anketnu promenljivu `TF_VAR_instance_type` i postavite cilj na promenljivu okruženja.

Promenljive sa ciljem okruženja se **ne** dupliraju u extra-vars, `-var` ili CLI argumentima. Svaka vrednost se isporučuje tačno jednom.

## Kako se anketne promenljive prosleđuju zadacima {#how-survey-variables-are-passed-to-tasks}

Anketne promenljive se prosleđuju različito u zavisnosti od tipa šablona i podešavanja **Prosledi promenljivu kao** (Pass variable as).

**Vrednosti višestrukog izbora (tip `select`)** su JSON-kodirani nizovi u svakom načinu isporuke (extra-vars JSON, `-var`, CLI argumenti i promenljive okruženja). Izbor opcija `1` i `2` postaje `["1","2"]`, a ne string razdvojen razmacima.

### Ansible šabloni {#ansible-templates}

Anketne promenljive se prosleđuju kao Ansible dodatne promenljive pomoću zastavice `--extra-vars`.

**Primer**: Ako definišete anketnu promenljivu pod nazivom `app_version`:

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

Pri pokretanju zadatka korisnik u anketnoj formi unosi „2.5.0“, a Ansible je prima kao:

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Terraform/OpenTofu šabloni {#terraformopentofu-templates}

Anketne promenljive se prosleđuju kao Terraform promenljive pomoću zastavice `-var`.

**Primer**: Ako definišete anketnu promenljivu pod nazivom `instance_count`:

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

Pri pokretanju zadatka korisnik u anketnoj formi unosi „3“, a Terraform je prima kao:

```bash
terraform apply -var="instance_count=3"
```

### Shell/Bash šabloni {#shellbash-templates}

Anketne promenljive se Bash skripti prosleđuju kao argumenti komandne linije:

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

Sledeći kod u skripti možete iskoristiti da argumente parsirate u niz:

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

Za promenljive **višestrukog izbora** vrednost je string sa JSON nizom. Parsirajte ga pomoću `jq` (uverite se da je `jq` dostupan u image-u vašeg izvršioca):

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### PowerShell šabloni {#powershell-templates}

Anketne promenljive se pokrenutoj PowerShell skripti prosleđuju kao argumenti komandne linije:

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


Da biste parsirali argumente, u pokrenutoj skripti koristite sledeći kod:

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

Za promenljive **višestrukog izbora** parsirajte JSON niz iz vrednosti argumenta:

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Python šabloni {#python-templates}

Anketne promenljive se pokrenutoj Python skripti prosleđuju kao argumenti komandne linije:

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

Da biste parsirali argumente, u pokrenutoj skripti koristite sledeći kod:

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

Za promenljive **višestrukog izbora** parsirajte JSON niz:

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## Korišćenje anketnih promenljivih {#using-survey-variables}

### Ručno izvršavanje zadatka {#manual-task-execution}

Pri pokretanju zadatka iz šablona sa anketnim promenljivama:

1. Kliknite na **Pokreni** (Run) na šablonu
2. Pojavljuje se forma sa svim definisanim anketnim promenljivama
3. Popunite vrednosti za svako polje
4. Kliknite na **Pokreni zadatak** (Run Task)

Zadatak se izvršava sa vrednostima koje ste uneli, prosleđenim playbook-u ili skripti.
<!-- 
### API pozivi {#api-calls}

Da biste vrednosti anketnih promenljivih prosledili preko API-ja:

**Primer API zahteva:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

Vrednosti anketnih promenljivih prosleđuju se u objektu `environment` tela zahteva.

**Važno**: Kada se pokrene preko API-ja, zadatak se izvršava bez nadzora — ne pojavljuje se nikakav interaktivni upit. -->

### Zakazani zadaci {#scheduled-tasks}

Rasporedi (Schedules) mogu sadržati vrednosti anketnih promenljivih, tako da se isti šablon pokreće sa različitim parametrima po različitim rasporedima.

**Podešavanje:**

1. Dodajte anketne promenljive u svoj šablon
2. Kreirajte raspored za taj šablon
3. U podešavanjima rasporeda definišite vrednosti anketnih promenljivih
4. Svako zakazano pokretanje koristi te unapred definisane vrednosti

**Primer slučaja upotrebe**: Pokretanje playbook-a za bekap sa različitim politikama čuvanja:
- Dnevni raspored sa `retention_days=7`
- Nedeljni raspored sa `retention_days=30`
- Mesečni raspored sa `retention_days=365`

Više detalja potražite u dokumentaciji [Rasporedi](../schedules).

### Integracije i webhook-ovi {#integrations-and-webhooks}

Integracije (Integrations) mogu izdvajati vrednosti iz dolaznih webhook-ova i mapirati ih na anketne promenljive.

**Podešavanje:**

1. Dodajte anketne promenljive u svoj šablon
2. Kreirajte integraciju koja pokreće ovaj šablon
3. Podesite izdvajače vrednosti koji uzimaju podatke iz tela webhook-a
4. Mapirajte izdvojene vrednosti na svoje anketne promenljive

**Primer**: Pokretanje isporuke kada se kreira GitHub izdanje:
- Izdvojite tag izdanja iz tela webhook-a
- Mapirajte ga na anketnu promenljivu pod nazivom `release_version`
- Playbook za isporuku prima broj verzije

Više detalja potražite u dokumentaciji [Integracije](../integrations).

## Najbolje prakse {#best-practices}

### Koristite opisne nazive {#use-descriptive-names}

Birajte jasne, opisne nazive anketnih promenljivih koji ukazuju na njihovu svrhu:
- ✅ Dobro: `target_environment`, `app_version`, `backup_retention_days`
- ❌ Loše: `env`, `ver`, `days`

### Dajte korisne naslove {#provide-helpful-titles}

Naslov se prikazuje u formi, pa ga učinite razumljivim za korisnika:
- Naziv promenljive: `db_host`
- Naslov: „Naziv hosta ili IP adresa baze podataka“

### Koristite enum ili select za poznate opcije {#use-enum-or-select-for-known-options}

Kada korisnici treba da biraju iz ograničenog skupa opcija, koristite enum ili select umesto stringa:
- ✅ **Enum** za tačno jedan izbor: production, staging ili development
- ✅ **Select** kada je važeće više izbora: nekoliko regiona ili feature flag-ova
- ❌ String polje sa napomenom „unesite production ili staging“

### Cilj promenljive okruženja koristite promišljeno {#use-environment-variable-target-deliberately}

Dajte prednost podrazumevanoj isporuci kao dodatne promenljive, osim ako vaš playbook, skripta ili alat eksplicitno čita iz okruženja procesa. Promenljive sa ciljem okruženja nazovite tačno onako kako to očekuje alat koji ih koristi (na primer `TF_VAR_region`).

### Obavezna polja označavajte s merom {#mark-required-fields-appropriately}

Polja označite kao obavezna samo ako su zaista neophodna. Razmislite o razumnim podrazumevanim vrednostima u playbook-ovima za opciona polja.

### Validirajte u svom kodu {#validate-in-your-code}

Ne pretpostavljajte da su vrednosti anketnih promenljivih uvek važeće. Dodajte logiku validacije u playbook-ove ili skripte:

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### Koristite secret za osetljive podatke {#use-secrets-for-sensitive-data}

Za osetljive vrednosti kao što su API ključevi, lozinke ili tokeni uvek koristite tip secret. Tako su vrednosti sakrivene u korisničkom interfejsu i logovima.

### Kombinujte sa grupama promenljivih {#combine-with-variable-groups}

Anketne promenljive dobro funkcionišu uz [grupe promenljivih](../environment) (Variable Groups):
- Koristite **grupe promenljivih** za statičku konfiguraciju koja se deli između zadataka
- Koristite **anketne promenljive** za vrednosti koje se menjaju pri svakom pokretanju zadatka

**Primer**:
- Grupa promenljivih: Podaci za povezivanje sa bazom podataka, API endpoint-i
- Anketne promenljive: Okruženje isporuke, broj verzije, feature flag-ovi

## Uobičajeni slučajevi upotrebe {#common-use-cases}

### Isporuke specifične za okruženje {#environment-specific-deployments}

Kreirajte anketne promenljive za:
- `environment`: enum sa opcijama „production, staging, development“
- `app_version`: string za verziju koja se isporučuje
- `enable_debug`: enum sa opcijama „true, false“

### Operacije nad bazom podataka {#database-operations}

Kreirajte anketne promenljive za:
- `db_name`: string za naziv baze podataka
- `backup_retention_days`: integer za politiku čuvanja
- `maintenance_window`: string za vremenski prozor

### Obezbeđivanje infrastrukture {#infrastructure-provisioning}

Kreirajte anketne promenljive za:
- `instance_count`: integer za broj instanci
- `instance_type`: enum sa opcijama „t2.micro, t2.small, t2.medium“
- `region`: enum sa AWS regionima

### CI/CD pipeline-i {#cicd-pipelines}

Kreirajte anketne promenljive za:
- `git_branch`: string za granu koja se gradi
- `build_type`: enum sa opcijama „debug, release“
- `run_tests`: enum sa opcijama „true, false“

## Razlike u odnosu na grupe promenljivih {#differences-from-variable-groups}

| Karakteristika | Anketne promenljive | Grupe promenljivih |
|---------|-----------------|-----------------|
| **Svrha** | Unos u vreme izvršavanja po zadatku | Višekratna statička konfiguracija |
| **Kada se definišu** | U trenutku izvršavanja zadatka | Unapred podešene u projektu |
| **Slučaj upotrebe** | Vrednosti koje se menjaju pri svakom pokretanju | Zajednička podešavanja za više zadataka |
| **Format** | Pojedinačna tipizirana polja | JSON format sa ugnežđenim objektima |
| **Opseg** | Jedno pokretanje zadatka | Više šablona/inventara |
| **Bezbednost** | Tip secret sakriva osetljive vrednosti | Kartica Tajne za osetljive podatke |

Koristite anketne promenljive kada vam je potrebna fleksibilnost u vreme izvršavanja, a grupe promenljivih kada želite doslednu konfiguraciju kroz više izvršavanja zadataka.
