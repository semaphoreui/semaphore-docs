# Ključevi iz promenljivih okruženja i datoteka

Pored čuvanja tajne u bazi podataka, stavka skladišta ključeva (Key Store) može da pročita svoju vrednost u trenutku izvršavanja zadatka iz
**datoteke** na Semaphore serveru ili iz **promenljive okruženja** procesa Semaphore servera.
Ovo je korisno kada je kredencijal već obezbeđen izvan Semaphore-a, na primer:

* SSH ključ montiran u Semaphore kontejner kao Docker ili Kubernetes secret;
* token koji agent (HashiCorp Vault Agent, cert-manager itd.) upisuje na disk i redovno rotira;
* lozinka koju vaš orkestrator ubacuje u okruženje kontejnera.

Semaphore ne kopira vrednost u svoju bazu podataka. Svaki put kada je zadatku (Task) potreban ključ, server
ponovo čita datoteku ili promenljivu, tako da rotacija kredencijala na disku stupa na snagu pri sledećem zadatku.

:::info
Datoteku ili promenljivu čita **Semaphore server**, a ne runner. Kada koristite udaljene runnere (Runner),
montirajte datoteku na host servera; server razrešava tajnu i prosleđuje je runneru.
:::

## Izbor izvora {#choosing-the-source}

Kada kreirate ili menjate ključ (**Key Store → New Key**), na vrhu forme nalaze se kartice izvora:

| Kartica | Odakle dolazi vrednost | Šta uneti |
|-----|---------------------------|---------------|
| **Local** | Semaphore baza podataka (šifrovano) | Korisničko ime, lozinku ili privatni ključ u formi |
| **Storage** <Pro /> | Eksterno skladište tajni kao što je [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) | Skladište i putanju tajne |
| **Env** | Promenljiva okruženja procesa Semaphore servera | Naziv promenljive, na primer `PROD_SSH_KEY` |
| **File** | Datoteka na Semaphore serveru | **Apsolutnu** putanju do datoteke, na primer `/var/lib/semaphore/secrets/prod.json` |

Kada je izabrano **Env** ili **File**, polja za korisničko ime, lozinku i privatni ključ nestaju. Ceo
kredencijal, uključujući korisničko ime za SSH i Login With Password ključeve, mora biti u datoteci ili promenljivoj.

## 1. Dozvolite direktorijum {#allow-the-directory}

Iz bezbednosnih razloga Semaphore čita samo datoteke ključeva koje se nalaze unutar njegovog **direktorijuma za tajne**. Svaka druga
putanja se odbija pri pokretanju zadatka:

```
Failed to install inventory: file path must be inside secrets path
```

Podrazumevani direktorijum za tajne je `/tmp/semaphore`. Usmerite ga na direktorijum u kome se nalaze vaše datoteke ključeva
pomoću `dirs.secrets` u `config.json` ili promenljive okruženja `SEMAPHORE_SECRETS_PATH`.
Pogledajte [Direktorijum za tajne](/admin-guide/configuration/config-file#secrets-directory) za pravila prioriteta.

Primer za Docker Compose koji montira direktorijum hosta i dozvoljava ga:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

Ekvivalentan fragment `config.json`:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Pravila za putanju unetu u kartici **File**:

* mora biti apsolutna (`/var/lib/semaphore/secrets/prod.json`, a ne `prod.json`);
* ne sme da sadrži segmente `..`;
* mora da se razreši na lokaciju unutar direktorijuma za tajne (poddirektorijumi su dozvoljeni);
* datoteka mora biti čitljiva za korisnika pod kojim se Semaphore izvršava (u zvaničnoj Docker slici to je `semaphore`, UID 1001).

Promenljive okruženja nemaju takvo ograničenje; server jednostavno čita navedenu promenljivu iz sopstvenog okruženja.

## 2. Formatirajte vrednost {#format-the-value}

Sadržaj datoteke (ili vrednost promenljive) zavisi od tipa ključa. Jedan završni
prelom reda na kraju datoteke se ignoriše; sve ostalo se koristi doslovno.

### SSH ključ {#ssh-key}

Semaphore očekuje **JSON dokument**, a ne sirovu PEM ili OpenSSH datoteku privatnog ključa:

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — SSH korisničko ime, koje se prosleđuje Ansible-u kao `--user`. Ostavite ga prazno da bi inventar (Inventory) odlučio (`ansible_user`). Za Git repozitorijume prazno korisničko ime podrazumevano je `git`.
* `passphrase` — lozinka privatnog ključa ili prazan string.
* `private_key` — privatni ključ sa prelomima redova kodiranim kao `\n`.

Generišite omotač iz postojećeg ključa pomoću `jq`, koji se brine o escape-ovanju:

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

Zatim kreirajte ključ tipa **SSH**, otvorite karticu **File** i unesite `/var/lib/semaphore/secrets/prod_ssh.json`
(putanju kako se vidi **unutar** kontejnera).

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
Usmeravanje kartice **File** na sirovi privatni ključ kao što je `~/.ssh/id_ed25519` ne radi.
Datoteka se parsira kao JSON i zadatak ne uspeva da učita inventar.
:::

### Login With Password {#login-with-password}

Takođe JSON dokument:

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

Ostavite `login` prazno da biste ključ koristili kao običan token ili lozinku, na primer kao lozinku za Ansible vault.

## Primer promenljive okruženja {#environment-variable-example}

Isti JSON format važi i za karticu **Env**. U Docker Compose-u:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

Kreirajte **SSH** ključ, izaberite karticu **Env** i unesite `PROD_SSH_KEY` kao naziv promenljive.

:::tip
Promenljive okruženja su vidljive svakom procesu u kontejneru i često završavaju u
metapodacima i logovima orkestratora. Kada možete, radije koristite karticu **File** sa montiranim secret-om.
:::

## Rešavanje problema {#troubleshooting}

| Greška | Uzrok | Rešenje |
|-------|-------|-----|
| `file path must be absolute` | Uneta je relativna putanja | Unesite punu putanju koja počinje sa `/` |
| `file path must not contain traversal segments` | Putanja sadrži `..` | Unesite razrešenu putanju |
| `file path must be inside secrets path` | Datoteka je izvan `dirs.secrets` | Postavite `SEMAPHORE_SECRETS_PATH` na direktorijum datoteke ili premestite datoteku |
| `no such file or directory` | Putanja je pogrešna ili nije montirana u kontejner | Proverite montiranje volume-a i koristite putanju unutar kontejnera |
| `permission denied` | Semaphore proces ne može da pročita datoteku | Ispravite vlasništvo ili prava pristupa datoteke |
| `invalid character '-' looking for beginning of value` | Umesto JSON omotača dat je sirovi privatni ključ | Umotajte ključ kao što je prikazano iznad |
