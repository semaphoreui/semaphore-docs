---
title: Key Store
description: Sveobuhvatan vodič za akreditive u Semaphore Key Store-u, generisanje SSH parova ključeva, lozinke za prijavu, tajne tokene i spoljna skladišta.
---

# Key Store

**Key Store** služi kao centralizovano skladište akreditiva u Semaphore-u. On upravlja autentifikacionim materijalima neophodnim za kloniranje udaljenih Git repozitorijuma, povezivanje sa ciljnim čvorovima infrastrukture, podizanje privilegija (`sudo`/`become`) i dešifrovanje Ansible Vault tajni.

![Key Store](/assets/key-store-keys.webp)

Key Store je podeljen na dva glavna prikaza:
* **Kartica Keys**: Prikazuje sve akreditive konfigurisane za trenutni projekat sa imenom, tipom skladišta, vrstom i statusom sinhronizacije.
* **Kartica Storages (Pro)**: Konfiguriše eksterna skladišta tajni (kao što su HashiCorp Vault, OpenBao, AWS Secrets Manager ili CyberArk) radi dinamičkog razrešavanja i automatizovane sinhronizacije.

---

## Tipovi akreditiva {#types}

Semaphore klasifikuje sačuvane akreditive u četiri osnovna tipa:

### 1. SSH ključevi {#1-ssh}
SSH ključevi pružaju asimetričnu kriptografsku autentifikaciju za povezivanje sa Linux/UNIX čvorovima i kloniranje Git repozitorijuma preko SSH-a (`git@github.com:...`).

Prilikom konfigurisanja SSH ključa možete navesti:
* **Naziv ključa**: Opisnu oznaku za akreditiv u inventarima i šablonima projekta.
* **Korisničko ime (Opciono)**: Podrazumevani udaljeni korisnički nalog za uspostavljanje SSH veze (na primer `ansible` ili `ubuntu`).
* **Lozinka ključa (Opciono)**: Lozinka neophodna za dešifrovanje zaštićenih privatnih ključeva. Polja za lozinku sadrže ikonu za prikaz (`oko`) i podrazumevano su maskirana.
* **Privatni ključ**: Izvorni tekst PEM/OpenSSH privatnog ključa.

#### Ugrađeni generator SSH ključeva {#built-in-ssh-key-generator}

Umesto ručnog pokretanja komande `ssh-keygen` na eksternim mašinama, Semaphore sadrži **ugrađeni generator SSH parova ključeva na jedan klik** direktno u modalnom prozoru:

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. Izaberite **SSH Key** iz padajućeg menija **Type**.
2. Označite polje **Generate SSH Key**.
3. Tekstualno polje za ručni unos **privatnog ključa** automatski se onemogućava i zaključava.
4. Kliknite na **Create**. Semaphore automatski generiše kriptografski bezbedan par ključeva (ED25519/RSA), šifruje privatni ključ u bazi i prikazuje javni ključ u namenskom dijalogu:

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

Iskoristite dugme **Copy to Clipboard** da kopirate javni ključ i unesite ga u deploy keys vašeg Git provajdera ili u fajl `~/.ssh/authorized_keys` na vašim ciljnim serverima.

#### Naknadno preuzimanje javnih ključeva (Fioka javnog ključa) {#extracting-public-keys-later}

Ako zatvorite prozor ili vam javni ključ zatreba kasnije, ne morate ponovo generisati par ključeva. Prilikom izmene bilo kog ključa kreiranog generatorom, Semaphore nudi fioku **Public key**:

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* Kliknite na **Show** / **Hide** da pregledate javni ključ.
* Kliknite na ikonu spajalice da trenutno kopirate javni ključ.

#### Povezivanje deploy ključeva na popularnim Git servisima

Za Git repozitorijume koji zahtevaju SSH autentifikaciju dodajte generisani javni ključ kao read-only deploy key:
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. Prijava lozinkom {#2-login-with-password}

Tip akreditiva **Prijava lozinkom** podržava i tradicionalnu autentifikaciju korisničkim imenom i lozinkom, kao i izolovane tajne tekstualne nizove:

* **Autentifikacija servera i sudo**: Pruža SSH pristup zasnovan na lozinci i podizanje `sudo` privilegija na ciljnim hostovima.
* **HTTPS Git autentifikacija**: Autentifikuje na udaljenim repozitorijumima preko HTTPS-a pomoću korisničkog imena i ličnih pristupnih tokena (PAT).
* **Lozinke za Ansible Vault**: Otključava šifrovane Ansible Vault fajlove i promenljive prilikom izvršavanja.

:::tip Tajni stringovi i lični pristupni tokeni (PAT)
Za čuvanje čistog tajnog stringa, kao što je API bearer token ili tajna webhook-a, koristite tip **String** ispod. Tip **Prijava lozinkom** sa praznim korisničkim imenom i dalje je potreban za lozinke Ansible Vault-a i HTTPS Git tokene, jer ti potrošači prihvataju samo taj tip.
:::

#### Maskiranje tajni i zaštita od prepisivanja {#secret-masking-and-override-protection}

Za zaštitu akreditiva od neovlašćenog pristupa i slučajnih izmena:
* Polja za unos lozinki i pristupnih fraza maskirana su u interfejsu uz mogućnost privremenog prikaza.
* Prilikom izmene postojećeg akreditiva, osetljiva polja su podrazumevano onemogućena.
* Da biste ažurirali postojeću tajnu, morate eksplicitno označiti polje **Override** na dnu forme. Ovaj zaštitni mehanizam sprečava slučajno prepisivanje tajni tokom rutinskih izmena.

---

### 3. Nema {#3-none}

Akreditiv **Nema** služi kao prazan autentifikacioni čuvar mesta. Koristi se za javne open-source Git repozitorijume (na GitHub-u ili GitLab-u) i lokalna izvršavanja plejbook-a koja ne zahtevaju SSH ključeve niti lozinke.

---

### 4. String {#4-string}

Akreditiv tipa **String** čuva jednu tajnu vrednost bez korisničkog imena: API token, tajnu webhook-a, samu lozinku. Čuva se šifrovano kao i svaki drugi akreditiv, API ga nikada ne vraća niti se ponovo prikazuje u formi, a može se zameniti samo označavanjem polja **Override**.

Gde se koristi:
* **Integracije**: kao *Auth secret* metoda autentifikacije Token, HMAC, GitHub i Bitbucket, pogledajte [Integracije](/user-guide/integrations#hmac-authentication).

Tamo gde ne odgovara, birači akreditiva ga jednostavno ne nude: SSH ključ repozitorijuma ili inventara, sudo akreditivi i lozinka Ansible Vault-a zahtevaju SSH ključ ili korisničko ime/lozinku.

Preko API-ja isti akreditiv se kreira sa `"type": "string"`:

```bash
curl -X POST "https://semaphore.example.com/api/project/1/keys" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "name": "webhook-secret", "type": "string", "string": "s3cr3t"}'
```

---

## Skladišta tajni {#secret-storages}

Semaphore podržava razdvojene arhitekture skladištenja tajni. Prilikom kreiranja ili izmene možete izabrati gde se nalazi tajni materijal putem kartica:

| Kartica skladišta | Dostupnost | Opis |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | Tajna se čuva direktno u bazi podataka Semaphore-a uz zaštitu envelope enkripcijom. |
| **Storage** | Pro | Tajna referencira spoljni endžin tajni (npr. HashiCorp Vault, AWS Secrets Manager). |
| **Env** | Open Source & Pro | Tajna se dinamički očitava u trenutku izvršavanja iz promenljive okruženja servera. |
| **File** | Open Source & Pro | Tajna se čita iz zaštićenog fajla u konfigurisanom direktorijumu tajni na serveru. |

![Skladišta tajni](/assets/key-store-storages.webp)

### Skladište u bazi podataka (Local) {#database}

Podrazumevano se tajne čuvaju u bazi podataka u šifrovanom formatu korišćenjem simetrične AES enkripcije. Glavni ključ se podešava u konfiguraciji servera:
* Konfiguracioni ključ: `access_key_encryption`
* Promenljiva okruženja: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning Generisanje glavnog ključa za enkripciju
Generišite kriptografski bezbedan 32-bajtni base64 ključ pre pokretanja produkcionih instanci:
```bash
head -c32 /dev/urandom | base64
```
Obavezno bezbedno sačuvajte kopiju ovog ključa. Ukoliko se ključ izgubi, postojeće tajne iz baze podataka se ne mogu povratiti.
:::

### Promenljive okruženja i fajl izvori (Samo za čitanje) {#environment-variable-or-file}

Kada izaberete karticu **Env** ili **File**, Semaphore tretira skladište kao eksterni izvor samo za čitanje. U interfejsu se prikazuje obaveštenje:

> **Read-only secret storage chosen.**

![Skladište samo za čitanje](/assets/key-store-env-readonly-storage.webp)

* **Env izvor**: Navedite tačan naziv promenljive okruženja izvezene na serveru (na primer `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **File izvor**: Navedite relativnu putanju do konfigurisanog direktorijuma tajni (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, podrazumevano `/tmp/semaphore`).

Za struktuirane ključeve, sadržaj fajlova i promenljivih mora biti formatiran kao validan JSON objekat. Za detalje pogledajte [Izvori iz okruženja i fajlova](/user-guide/key-store/env-and-file-sources).

### Eksterni enterprise endžini za tajne (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro i Enterprise proširuju Key Store izvornim konektorima za vodeće sisteme upravljanja tajnama:

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: Povezivanje putem AppRole ili Token autentifikacije za čitanje i pisanje KV v1/v2 tajni.
* **[OpenBao](/user-guide/key-store/openbao)**: Open-source fork kompatibilan sa API-jem HashiCorp Vault-a.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />: Integracija sa AWS IAM ulogama ili statičkim pristupnim ključevima.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: Integracija sa centralizovanim upravljanjem privilegovanim pristupom.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />: Čitanje i pisanje tajni putem CyberArk PVWA REST API-ja.

---

## Sinhronizacija tajni sa udaljenih skladišta {#syncing-secrets-from-remote-storages}

Umesto ručnog unosa akreditiva jednog po jednog, Semaphore podržava automatizovanu sinhronizaciju iz eksternih skladišta tajni.

Kada se tajna održava putem sinhronizacije:
* Označena je aktivnom **synchronized** oznakom u tabeli Key Store-a.
* Ručna izmena tajne u interfejsu je onemogućena kako bi spoljni trezor ostao jedini izvor istine.
* Bilo kakve izmene ili rotacije tajni automatski se prenose u Semaphore na osnovu podešenog intervala.

Za kompletne korake konfiguracije pogledajte [Sinhronizacija tajni](/user-guide/key-store/secret-sync).
