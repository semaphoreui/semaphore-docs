---
id: encryption
title: Ključevi za šifrovanje
sidebar_label: Ključevi za šifrovanje
description: Kako Semaphore šifruje tajne, kako se konfigurišu ključevi za šifrovanje i kako se rotiraju bez prekida rada.
---

# Ključevi za šifrovanje

Semaphore šifruje najosetljivije podatke koje čuva — **tajne pristupnih ključeva**
(privatne SSH ključeve, parove korisničko ime/lozinka, tajne nizove) iz skladišta
ključeva (Key Store) i **ključ za potpisivanje JWT-a** — koristeći AES‑256‑GCM. Ova
stranica objašnjava kako da konfigurišete te ključeve, kako radi rotacija i kako
da njome bezbedno upravljate.

:::info Dva ključa, dve namene

| Ključ | Štiti | Aktivni pokazivač |
|-----|----------|----------------|
| **Ključ za tajne** | Tajne pristupnih ključeva sačuvane u bazi podataka | `active.secret_key` |
| **Ključ za opcije** | Šifrovane opcije u bazi (ključ za potpisivanje JWT-a) | `active.option_key` |

Ako ključ za opcije nije konfigurisan, opcije koriste ključ za tajne.
:::

---

## Brzi početak {#quick-start}

Najjednostavnije podešavanje je jedan ključ zadat u glavnoj konfiguraciji:

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

Generišite ključ pomoću:

```bash
openssl rand -base64 32
```

To je sve — Semaphore sada šifruje tajne ključem `key1`. Isti ključ se koristi i za
ključ za potpisivanje JWT-a (opcije koriste ključ za tajne ako nije zadat poseban).

:::tip Produkcija
Umesto inline vrednosti `value:` koristite **`file:` reference** ili **`keys_folder`**
(videti ispod), tako da materijal ključa bude u montiranoj tajni, a ne u konfiguraciji.
:::

---

## Kako se ključevi identifikuju {#how-keys-are-identified}

Svaki ključ ima **id ključa** izveden iz samog materijala ključa — otisak,
`base64url(sha256(key))[:8]`. Uz svaku šifrovanu vrednost čuva se id (ne ključ), pa
je dešifrovanje direktno pronalaženje upravo onog ključa koji je vrednost zapisao.

To znači:

- **Oznake se mogu slobodno preimenovati.** `key1`, `secrets_key_primary.txt` — one
  su namenjene ljudima. Baza podataka ih nikada ne čuva, već samo otisak.
- **Ključ nikada ne može da pokazuje na pogrešne podatke.** Promenite bajtove ključa i
  on postaje *novi* id; stari podaci i dalje referenciraju stari id.
- **Uklanjanje ključa ne prolazi nečujno** — nedostajući id ključa je eksplicitna
  greška, nikada besmislen izlaz.

Id-ove nikada ne zadajete ručno; Semaphore ih izračunava.

---

## Datoteka sa ključevima {#the-keys-file}

`encryption.keys_file` pokazuje na datoteku čiji je sadržaj **registar ključeva**
plus **pokazivači** na aktivni ključ po nameni. Parsira se kao **YAML ili JSON,
bez obzira na ekstenziju datoteke**.

Registar se može zadati na dva načina — kao inline mapa, kao folder sa datotekama ili
kombinovano.

### Inline mapa {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

Svaka stavka je [`KeySource`](#keysource): ili `value` (inline base64) **ili**
`file` (putanja do datoteke koja sadrži base64 ključ) — nikada oba.

### Folder sa datotekama ključeva {#folder-of-key-files}

Usmerite `keys_folder` na direktorijum; **svaka regularna datoteka je jedan ključ**,
označen imenom datoteke. Idealno za montirane Docker/Kubernetes tajne.

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Prilagođeno Kubernetes-u
`keys_folder` preskače stavke koje počinju tačkom (`..data`, `..2024_*`) i prati
simboličke veze, tako da radi direktno sa načinom na koji Kubernetes montira
`Secret`/`ConfigMap` volumene.
:::

### Kombinovano {#combined}

`keys` i `keys_folder` se spajaju u jedan registar; `active` može pokazivati po oznaci
*ili* po imenu datoteke:

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## Rotacija (bez prekida rada) {#rotation-zero-downtime}

Aktivni ključ šifruje **nove** upise; svaki drugi ključ u registru i dalje može da
**dešifruje** stare podatke. Rotacija je, dakle: dodajte ključ, prebacite pokazivač,
ponovo šifrujte u pozadini, a zatim uklonite stari ključ.

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

Ni u jednom koraku nije potrebno ponovno pokretanje procesa.

### Primena izmena bez ponovnog pokretanja {#applying-changes-without-a-restart}

Semaphore ponovo čita datoteku sa ključevima (i datoteke ključeva na koje ona
referencira) i atomski zamenjuje ključeve u memoriji. Postoje dva pokretača:

| Pokretač | Ponašanje |
|---------|-----------|
| **Nadzor datoteke** | Proverava svakih `encryption.keys_poll_interval` (podrazumevano `15s`). Postavite na `"0"` da biste isključili. |
| **`SIGHUP`** | `kill -HUP <pid>` prisiljava trenutno ponovno učitavanje (samo Unix). |

:::caution Windows
Windows nema `SIGHUP`. Oslonite se na **periodičnu proveru** (podrazumevano) — radi
na svakoj platformi — ili ponovo pokrenite servis.
:::

Ponovno učitavanje prvo proverava nove ključeve i, u slučaju bilo kakve greške,
ostavlja trenutno aktivne ključeve netaknutim.

---

## CLI komande {#cli-commands}

### `vault check` {#vault-check}

Samo za čitanje. Za svaki id ključa prijavljuje koliko sačuvanih tajni njime šifruje,
tako da možete videti šta je na aktivnom ključu i šta je bezbedno ukloniti.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

Statusi: `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)` i `MISSING KEY` (referencirani ključ ne postoji — izlazni kod 1).

### `vault rekey` {#vault-rekey}

Ponovo šifruje sve sačuvane tajne (i ključ za potpisivanje JWT-a) aktivnim ključem.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## Kompatibilnost sa starijim verzijama {#backward-compatibility}

Nadogradnja je bezbedna i **ne zahteva migraciju podataka**:

- Postojeće instalacije koje koriste **`access_key_encryption`** (ili promenljivu
  okruženja `SEMAPHORE_ACCESS_KEY_ENCRYPTION`) nastavljaju da rade bez izmena — taj
  jednostavni ključ postaje aktivni ključ za tajne.
- Podaci koje je zapisao stariji Semaphore (bez id-a ključa) i dalje se dešifruju. Pri
  sledećem upisu, ili nakon `vault rekey`, dobijaju oznaku sa id-om ključa.
- **Bez šifrovanja** (nijedan ključ nije konfigurisan) tajne se i dalje čuvaju kao
  običan base64 i na isti način dešifruju.

Da biste staru instalaciju sa jednim ključem prebacili na datoteku sa ključevima,
jednostavno uključite stari ključ u registar:

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

Stari podaci se dešifruju pomoću `old`; pokrenite `vault rekey` da biste sve prebacili
na `new`.

---

## Kubernetes i Docker {#kubernetes--docker}

Montirajte ključeve kao `Secret` volumen i usmerite `keys_folder` na njega:

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

Kada ažurirate `Secret`, Kubernetes osvežava montirane datoteke, a periodična provera
primenjuje izmenu u roku od `keys_poll_interval` — bez ponovnog pokretanja poda.

---

## Najbolje bezbednosne prakse {#security-best-practices}

:::danger Zaštitite datoteku sa ključevima
- Ograničite dozvole: `chmod 0400`, vlasnik je servisni korisnik Semaphore-a.
- **Nikada ne komitujte prave ključeve** u sistem za kontrolu verzija — dodajte
  datoteku u `.gitignore`.
- Bezbedno je čuvajte u rezervnoj kopiji. **Gubitak svih ključeva znači gubitak svih
  šifrovanih podataka.**
- Umesto inline vrednosti `value:` koristite montirane tajne (`file:` / `keys_folder`),
  a promenljive okruženja umesto ničega — `value:` drži ključ u konfiguracionoj datoteci.
:::

---

## Referenca {#reference}

### `encryption` (glavna konfiguracija) {#encryption-main-config}

| Polje | Promenljiva okruženja | Podrazumevano | Opis |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | Putanja do datoteke sa ključevima (YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | Koliko često se proverava datoteka sa ključevima. `"0"` isključuje proveru. |

### Nasleđeni jednostavni ključevi (glavna konfiguracija) {#legacy-flat-keys-main-config}

| Polje | Promenljiva okruženja | Opis |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | Jedan ključ za tajne, bez rotacije. Koristi se kada `keys_file` nije postavljen. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | Jedan ključ za opcije, bez rotacije. Ako nije zadat, koristi se ključ za tajne. |

### Datoteka sa ključevima {#keys-file}

| Polje | Opis |
|-------|-------------|
| `keys` | Mapa `oznaka → KeySource` (inline registar). |
| `keys_folder` | Direktorijum sa datotekama ključeva (jedna regularna datoteka po ključu, označena imenom datoteke). |
| `active.secret_key` | Oznaka (u `keys`) aktivnog ključa za tajne. |
| `active.option_key` | Oznaka aktivnog ključa za opcije. |
| `active.secret_key_file` | Ime datoteke u `keys_folder` aktivnog ključa za tajne (relativno). |
| `active.option_key_file` | Ime datoteke u `keys_folder` aktivnog ključa za opcije (relativno). |

### KeySource {#keysource}

| Polje | Opis |
|-------|-------------|
| `value` | Inline base64 materijal ključa. |
| `file` | Putanja do datoteke koja sadrži base64 ključ. |

`value` i `file` se međusobno isključuju. Ključevi moraju biti base64 od **16, 24 ili
32 bajta** (AES‑128/192/256).

---

## Rešavanje problema {#troubleshooting}

| Simptom | Uzrok / rešenje |
|---------|-------------|
| Panika pri pokretanju: `encryption_keys… not found` / `invalid` | Datoteka sa ključevima ili referencirana datoteka ključa nedostaje ili je neispravna, ili ključ nije validan base64 od 16/24/32 bajta. Popravite datoteku; pokretanje namerno odmah otkazuje. |
| `vault check` prikazuje `MISSING KEY <id>` (izlazni kod 1) | Podaci su šifrovani ključem koji više nije u registru. Vratite taj ključ da bi se podaci mogli dešifrovati. |
| `cannot decrypt access key, perhaps encryption key was changed` | Nasleđenu vrednost (bez prefiksa) ne može da dešifruje nijedan konfigurisani ključ. Proverite da je originalni ključ prisutan (u registru ili u `access_key_encryption`). |
| Rotacija nije primenjena | Proverite `keys_poll_interval` (da nije `"0"`) i da se datoteka sa ključevima zaista promenila; ili pošaljite `SIGHUP`. |
| `active.secret_key: no key labelled "…"` | Aktivni pokazivač imenuje oznaku/ime datoteke koje ne postoji u `keys`/`keys_folder`. |
