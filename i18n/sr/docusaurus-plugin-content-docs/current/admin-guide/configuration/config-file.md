
# Konfiguracioni fajl

## Kreiranje konfiguracionog fajla {#creating-configuration-file}

Semaphore koristi fajl `config.json` za svoju osnovnu konfiguraciju. Ovaj fajl možete generisati interaktivno pomoću ugrađenih alata ili preko veb konfiguratora.

### Generisanje preko CLI-ja {#generate-via-cli}

Koristite sledeće komande da biste interaktivno generisali konfiguracioni fajl:

* Za Semaphore server:
  ```
  semaphore setup
  ```
* Za Semaphore runner (Runner):
  ```
  semaphore runner setup
  ```
  
  :::tip
    Više detalja o konfiguraciji runnera potražite u odeljku <a href="./../runners">Runneri</a>.
  :::

### Generisanje na veb-sajtu {#generate-on-the-website}

Alternativno, možete koristiti interaktivni veb konfigurator:
* [Konfigurator servera](https://semaphoreui.com/install/binary/2_13/config)
* [Konfigurator runnera](https://semaphoreui.com/install/binary/2_13/runner)

## Primer konfiguracionog fajla {#configuration-file-example}

Semaphore koristi konfiguracioni fajl `config.json` sa sledećim sadržajem:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Upotreba konfiguracionog fajla {#configuration-file-usage}

* Za Semaphore server:

```bash
semaphore server --config ./config.json
```

* Za Semaphore runner:

```bash
semaphore runner start --config ./config.json
```

## Direktorijum za tajne {#secrets-directory}

Semaphore čita fajlove sa tajnama (na primer [stavke skladišta ključeva (Key Store) zasnovane na fajlovima](/user-guide/key-store/env-and-file-sources) ili tokene za HashiCorp Vault i OpenBao koji se čitaju sa diska) isključivo iz konfigurabilnog direktorijuma.

| Opcija | Promenljiva okruženja | Opis |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Direktorijum za fajlove sa tajnama. Podrazumevano: `/tmp/semaphore`. |
| `secrets_path` (zastarelo) | `SEMAPHORE_SECRETS_PATH` | Podešavanje najvišeg nivoa zadržano radi kompatibilnosti sa starijim verzijama. Koristi se samo kada `dirs.secrets` nije postavljen ili je još uvek na podrazumevanoj putanji. |

**Prioritet**: `dirs.secrets` sa vrednošću različitom od podrazumevane ima prednost nad zastarelim `secrets_path`. Kada postavite `SEMAPHORE_SECRETS_PATH`, Semaphore ga primenjuje na oba polja.

Primer sa aktuelnom strukturom:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Starije instalacije i dalje mogu koristiti:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

Fajlovi ključeva izabrani na kartici **Fajl** (File) u formi skladišta ključeva, kao i fajlovi tokena na koje se pozivaju spoljna skladišta tajni, moraju se nalaziti unutar ovog direktorijuma. Putanje izvan njega se odbijaju uz poruku `file path must be inside secrets path`. Pogledajte [Ključevi iz promenljivih okruženja i fajlova](/user-guide/key-store/env-and-file-sources).

## Git operacije {#git-operations}

Semaphore klonira i ažurira repozitorijume (Repository) zadataka pre svakog pokretanja. Ovo ponašanje kontrolišu dve opcije:

| Opcija | Promenljiva okruženja | Opis |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Implementacija Git klijenta: `cmd_git` (podrazumevano, koristi sistemski `git` binarni fajl) ili `go_git` (klijent napisan isključivo u jeziku Go). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Broj pokušaja operacija kloniranja i preuzimanja (pull) pre nego što zadatak bude označen kao neuspešan. Podrazumevano: `4`. Postavite na `1` za jedan pokušaj bez ponavljanja. |

Kada kloniranje ili pull ne uspe, a preostali su pokušaji, Semaphore čeka uz eksponencijalno produžavanje pauze (počinje od 1 sekunde, udvostručuje se pri svakom pokušaju, sa gornjom granicom od 60 sekundi) i upisuje u log poruku poput `Git pull failed (...), retrying in 2s`. Ponavljanja se odnose samo na mrežne operacije; neuspešan checkout ili greška autentifikacije i dalje dovode do neuspeha zadatka nakon što se iscrpe svi pokušaji.

Ako je vaš Git server povremeno nedostupan, povećajte `git_attempts`. Ako su greške trenutne i trajne (pogrešni kredencijali, nepostojeći repozitorijum), otklonite osnovni problem — ponavljanja neće pomoći.
