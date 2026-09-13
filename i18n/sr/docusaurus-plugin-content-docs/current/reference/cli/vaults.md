# Vaultovi

Komanda `semaphore vault` upravlja šifrovanjem tajni koje Semaphore
čuva u bazi podataka — **tajni pristupnih ključeva (Access Key)** (SSH ključevi, parovi login/lozinka,
tajni nizovi) i **JWT ključa za potpisivanje**.

```bash
semaphore vault --help
```

> `vault` je alijas za `vaults`.

Ima dve potkomande:

| Komanda | Namena |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | Ponovo šifruje sve sačuvane tajne aktivnim ključem za šifrovanje. |
| [`vault check`](#checking-key-usage-vault-check) | Izveštava koji ID ključa šifruje svaku sačuvanu tajnu (samo čitanje). |

Kako se ključevi za šifrovanje konfigurišu i rotiraju opisano je u
[Ključevi za šifrovanje](/admin-guide/security/encryption).

## Ponovno šifrovanje tajni (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

Ponovo šifruje sve lokalno sačuvane tajne — tajne pristupnih ključeva i JWT ključ za
potpisivanje — **aktivnim** ključem za šifrovanje, upisujući ID tog ključa u svaku
vrednost. Tajne koje se čuvaju u eksternom skladištu tajni se preskaču (one nisu
šifrovane Semaphore keyring-om).

```bash
semaphore vault rekey
```

### Rotacija ključeva bez prekida rada {#zero-downtime-key-rotation}

Aktivni ključ šifruje nove upise; svaki drugi ključ u skupu ključeva i dalje može
da dešifruje stare podatke. Rotacija je stoga: dodajte ključ, prebacite aktivni pokazivač,
ponovo šifrujte u pozadini, a zatim uklonite stari ključ.

1. Dodajte novi ključ u skup ključeva (datoteka u `keys_folder` ili stavka `keys:`) i
   usmerite aktivni pokazivač (`active.secret_key` ili `secret_key_file`) na njega.
   Promena se primenjuje u okviru `keys_poll_interval` (podrazumevano `15s`), ili
   odmah pomoću `kill -HUP <pid>` — restart nije potreban.
2. Pokrenite `semaphore vault rekey` da biste postojeće podatke ponovo šifrovali novim ključem.
3. Pokrenite [`semaphore vault check`](#checking-key-usage-vault-check); kada stari
   ključ pokaže `0 rows`, bezbedno ga je ukloniti iz skupa ključeva.

### Opcije {#options}

| Fleg | Opis |
|------|-------------|
| `--old-key <key>` | Eksplicitni stari ključ za šifrovanje za migraciju sa nasleđenog jednog ključa. Nije potreban kada je stari ključ već u skupu ključeva kao sekundarni. Koristi se za dešifrovanje podataka bez prefiksa (nasleđenih) koji nemaju upisan ID ključa. |
| `--backup <file>` | Upisuje rezervnu kopiju trenutnih šifrata pristupnih ključeva u `<file>` pre ponovnog šifrovanja. |
| `--rollback <file>` | Vraća šifrate pristupnih ključeva iz datoteke rezervne kopije umesto ponovnog šifrovanja. |

### Rezervna kopija i vraćanje {#backup-and-rollback}

Napravite snimak trenutnih šifrata pre ponovnog šifrovanja i vratite ga
ako nešto pođe naopako:

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

Rezervna kopija je datoteka u JSON-lines formatu, sa jednom stavkom po pristupnom ključu (`project_id`,
`key_id`, `secret`). Vraćanje upisuje te šifrate nazad doslovno.

### Migracija sa nasleđenog jednog ključa {#legacy-single-key-migration}

Ako su vaši podaci šifrovani starijom verzijom Semaphore-a koja je koristila jedan
ključ `access_key_encryption` (bez rotacije, bez upisanog ID-a ključa), prosledite taj ključ
eksplicitno da bi podaci mogli da se dešifruju pre ponovnog šifrovanja aktivnim ključem:

```bash
semaphore vault rekey --old-key <base64-old-key>
```

Ovo nije potrebno kada je stari ključ deo skupa ključeva — Semaphore pronalazi svaku
vrednost po njenom upisanom ID-u i automatski je dešifruje odgovarajućim ključem.

## Provera upotrebe ključeva (`vault check`) {#checking-key-usage-vault-check}

Samo čitanje. Izveštava, po ID-u ključa, koliko lokalno sačuvanih tajni pristupnih ključeva (i
JWT ključ za potpisivanje) taj ključ šifruje, kao i status JWT ključa za potpisivanje. Pokrenite je
nakon `vault rekey` da potvrdite da je povučeni ključ bezbedno ukloniti: ključ bez
referenci može se izbrisati iz skupa ključeva.

```bash
semaphore vault check
```

Primer izlaza:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

Svaki ID ključa se prijavljuje sa jednim od sledećih statusa:

| Status | Značenje |
|--------|---------|
| `active` | Ključ trenutno šifruje nove upise. |
| `retired, rekey pending` | Ključ i dalje šifruje neke redove; pokrenite `vault rekey` da ih prebacite na aktivni ključ. |
| `retired, SAFE TO REMOVE` | Nijedan red ne referencira ključ (`0 rows`) — može se ukloniti iz skupa ključeva. |
| `legacy (no id)` | Redovi šifrovani pre nego što su ID-ovi ključeva postojali; pokrenite rekey da upišete ID. |
| `MISSING KEY (cannot decrypt)` | Referencirani ID ključa ne postoji u skupu ključeva. |

Poslednji red prijavljuje koji ključ šifruje JWT ključ za potpisivanje, ili
`JWT signing key: not set` ako još nijedan nije generisan.

Ako bilo koja tajna referencira ID ključa koji nedostaje u skupu ključeva, komanda
označava te redove i **završava sa statusom različitim od nule** — vratite ključ koji nedostaje
u skup ključeva da bi ti podaci mogli da se dešifruju.
