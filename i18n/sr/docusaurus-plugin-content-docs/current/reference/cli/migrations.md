# Migracije baze podataka

Komanda `semaphore migrate` ažurira ili vraća šemu Semaphore baze podataka
tako da odgovara zadatoj verziji Semaphore-a. Koristite je za nadogradnje i vraćanje na starije verzije.

```bash
semaphore migrate --help
```

:::info
Retko je potrebno da ručno pokrećete `migrate`. `semaphore server`, `semaphore setup`
i svaka druga CLI komanda koja pristupa bazi podataka automatski primenjuju neprimenjene
migracije pre pokretanja. `migrate` služi za primenu migracija bez
pokretanja servera ili za vraćanje migracija.
:::

:::warning
Uvek napravite rezervnu kopiju baze podataka pre primene ili vraćanja migracija.
:::

## Primena migracija {#applying-migrations}

Primenite sve neprimenjene migracije i ažurirajte bazu podataka na najnovije stanje:

```bash
semaphore migrate --config /path/to/config.json
```

Primenite migracije samo do određene verzije:

```bash
semaphore migrate --apply-to 2.15.1
```

## Vraćanje migracija {#rolling-back-migrations}

Poništite migracije do prethodne verzije:

```bash
semaphore migrate --undo-to 2.13
```

Navedite verziju Semaphore-a na koju se vraćate. Binarni fajl kojim pokrećete `migrate`
mora poznavati svaku migraciju koja se poništava, zato ga pokrenite **novijim**
binarnim fajlom pre nego što instalirate stariji.

## Opcije {#options}

| Zastavica | Opis |
|-----------|------|
| `--apply-to <version>` | Primenjuje migracije do ove verzije, uključujući i nju (npr. `2.15` ili `2.14.4`). |
| `--undo-to <version>` | Vraća migracije do ove verzije. |

`--apply-to` i `--undo-to` se međusobno isključuju; prosleđivanje obe je greška.
Bez ijedne zastavice primenjuju se sve neprimenjene migracije.

Po završetku komanda ispisuje konekciju ka bazi podataka koju je koristila.

:::note
`semaphore migrate` i dalje prihvata `--err-log-size`, `--skip-task-output` i
`--merge-existing-users` radi kompatibilnosti sa starijim verzijama, ali u 2.19 i novijim
one nemaju efekta. Pripadale su BoltDB uvozu opisanom ispod.
:::

## Migracija sa BoltDB na SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*Dostupno samo u verzijama 2.17 i 2.18*

BoltDB je zastareo počev od verzije 2.16, a **podrška je uklonjena u
verziji 2.19**. Zastavica `--from-boltdb` i promenljiva okruženja `SEMAPHORE_MIGRATE_FROM_BOLTDB`
više ne postoje u 2.19+, a `semaphore setup` odbija da
konfiguriše BoltDB bazu podataka.

:::warning
Ako i dalje koristite BoltDB, migrirajte **pre** nadogradnje na 2.19 ili noviju verziju.
Instalirajte Semaphore **2.17 ili 2.18**, obavite migraciju opisanu ispod i tek onda
nadogradite na noviju verziju.
:::

Da biste migrirali, prvo instalirajte Semaphore verzije 2.17 ili 2.18, a zatim konfigurišite
ciljnu bazu podataka (SQLite, MySQL ili PostgreSQL) u svom `config.json`. Nakon
toga pokrenite sledeću komandu da biste uvezli sve podatke iz starog BoltDB fajla
u novu bazu podataka:

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

Komanda čita sve projekte (Project), šablone, inventare (Inventory), repozitorijume (Repository), ključeve,
korisnike i istoriju zadataka (Task) iz BoltDB i upisuje ih u bazu podataka navedenu
u trenutnoj Semaphore konfiguraciji. Originalni BoltDB fajl se ne
menja.

Dodatni argumenti (samo 2.17 i 2.18):

| Zastavica | Opis |
|-----------|------|
| `--err-log-size <n>` | Maksimalan broj linija grešaka prikazanih u izlazu. |
| `--skip-task-output` | Ne uvozi izlaze zadataka. |
| `--merge-existing-users` | Ponovo koristi postojeće korisnike uparene po korisničkom imenu umesto da prijavi grešku pri konfliktu. |

Ako koristite Semaphore UI Docker kontejner, možete postaviti promenljivu okruženja
`SEMAPHORE_MIGRATE_FROM_BOLTDB` da bi se postojeća BoltDB baza podataka automatski
uvezla. Uvoz se izvršava samo jednom, pri prvom pokretanju
kontejnera. Primer:

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## Rešavanje problema {#troubleshooting}

- Ako migracija ne uspe, proverite logove za detalje i uverite se da je CLI binarni fajl
  iste verzije kao Semaphore server.
- Uverite se da CLI koristi isti konfiguracioni fajl (a time i istu
  bazu podataka) kao server. Pogledajte
  [Kako se pronalazi konfiguracioni fajl](/reference/cli#how-the-configuration-file-is-found).
