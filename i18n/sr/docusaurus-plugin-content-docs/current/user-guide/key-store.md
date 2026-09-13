# Skladište ključeva

Skladište ključeva (Key Store) u Semaphore-u koristi se za čuvanje pristupnih podataka za pristup udaljenim repozitorijumima (Repositories), pristup udaljenim hostovima, sudo pristupnih podataka i lozinki za Ansible vault.

![Skladište ključeva](/assets/key-store-keys.webp)

Kartica **Ključevi** (Keys) prikazuje pristupne podatke projekta (Project) sa njihovim tipom. Kartica **Skladišta** (Storages) (Pro) prikazuje spoljna skladišta tajni podešena za projekat, pogledajte [Skladišta tajni](#secret-storages).

## Tipovi {#types}

### 1. SSH {#1-ssh}
SSH ključevi se koriste za pristup udaljenim serverima, kao i udaljenim repozitorijumima.

Ako vam je potrebna pomoć da brzo generišete ključ i postavite ga na svoj host, [ovde je kratak vodič.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

Za Git repozitorijume koji koriste SSH autentifikaciju, Git repozitorijum koji pokušavate da klonirate mora imati vaš javni ključ pridružen privatnom ključu.

Ispod su linkovi ka dokumentaciji nekih uobičajenih Git repozitorijuma:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Prijava lozinkom {#2-login-with-password}
Prijava lozinkom (Login With Password) je kombinacija korisničkog imena i lozinke/pristupnog tokena koja se može koristiti za sledeće:
* Autentifikaciju na udaljenim hostovima (mada je ovo manje bezbedno od korišćenja SSH ključeva)
* Sudo pristupne podatke na udaljenim hostovima
* Autentifikaciju na udaljenim Git repozitorijumima preko HTTPS-a (mada je SSH bezbedniji)
* Otključavanje Ansible vault-ova

:::tip
    Ovaj tip tajne može se koristiti kao lični pristupni token (Personal Access Token, PAT) ili tajni string. Jednostavno ostavite polje Prijava (Login) prazno.
:::

### 3. Bez ključa {#3-none}
Ovo se koristi kao zamena za repozitorijume koji ne zahtevaju autentifikaciju, kao što je repozitorijum otvorenog koda na GitLab-u.


## Skladišta tajni {#secret-storages}

Semaphore UI podržava različita skladišta za tajne. Skladište možete izabrati za svaku tajnu pojedinačno pri kreiranju ili izmeni tajne.

Spoljna skladišta kreiraju se na kartici **Skladišta** (Storages) u skladištu ključeva (Pro). Svako skladište ima naziv i tip; ključevi se zatim pozivaju na skladište i putanju tajne unutar njega.

![Skladišta tajni](/assets/key-store-storages.webp)

### Baza podataka {#database}

Tajne se podrazumevano čuvaju u bazi podataka u šifrovanom obliku. Ključ za šifrovanje podešava se konfiguracionom opcijom
`access_key_encryption` ili `SEMAPHORE_ACCESS_KEY_ENCRYPTION` (mora biti generisan pomoću `head -c32 /dev/urandom | base64`).

### Promenljiva okruženja ili fajl {#environment-variable-or-file}

Ključ može čitati svoju vrednost iz promenljive okruženja Semaphore servera ili iz fajla na serveru
(na primer SSH ključ montiran u kontejner). Kartice **Env** i **File** u formularu ključa biraju ovaj režim.

Fajlovi moraju biti unutar podešenog direktorijuma za tajne (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, podrazumevano `/tmp/semaphore`),
a SSH ključevi i ključevi tipa Prijava lozinkom moraju biti umotani u mali JSON dokument.

[Pročitajte više...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

Tajne se mogu čuvati u spoljnoj HashiCorp Vault instanci umesto u bazi podataka.

[Pročitajte više...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

Tajne se mogu čuvati u spoljnoj [OpenBao](https://openbao.org) instanci (API-kompatibilan fork HashiCorp Vault-a otvorenog koda).

[Pročitajte više...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

![Statički bedž](https://img.shields.io/badge/enterprise-yellow)

Tajne se mogu čuvati u AWS Secrets Manager-u. Autentifikujte se pomoću IAM uloge/profila instance ili statičkih pristupnih ključeva.

[Pročitajte više...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

Tajne se mogu čuvati u spoljnoj Devolutions Server instanci umesto u bazi podataka.

[Pročitajte više...](/user-guide/key-store/devolutions-server)

## Sinhronizacija tajni iz udaljenih skladišta {#syncing-secrets-from-remote-storages}

Semaphore može automatski uvoziti tajne iz spoljnog menadžera tajni (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault ili Devolutions Server) i održavati ih sinhronizovanim. Putanje za sinhronizaciju omogućavaju vam da izaberete koje tajne se uvoze i kako se imenuju.

[Pročitajte više...](/user-guide/key-store/secret-sync)
