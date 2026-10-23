---
title: CyberArk skladište tajni
description: Enterprise opcija za čitanje i čuvanje tajni iz Key Store-a u CyberArk Privileged Access Manager-u putem PVWA REST API-ja.
sidebar_custom_props:
  edition: pro
---

# CyberArk skladište tajni <Enterprise />

Semaphore UI Enterprise može da koristi **CyberArk Privileged Access Manager** (PAM Self-Hosted ili Privilege Cloud) kao eksterno skladište za tajne Key Store-a umesto baze podataka. Semaphore komunicira sa Password Vault Web Access (PVWA) REST API-jem: svaki Semaphore ključ se mapira na CyberArk **nalog** unutar **Safe**-a.

## Opcije konfiguracije {#configuration-options}

Kada kreirate **CyberArk** skladište pod **Key Store → Storages**, konfigurišite:

| Polje | Opis |
|-------|------|
| **Server URL** | Osnovna adresa PVWA, na primer `https://pvwa.example.com`. Prihvata se i završni `/PasswordVault`. Obavezno. |
| **Preskoči verifikaciju TLS sertifikata** | Onemogućava validaciju sertifikata. Samo za test okruženja. |
| **Metod autentifikacije** | Metod prijave na PVWA za Semaphore korisnika: `CyberArk` (podrazumevano), `LDAP`, `RADIUS` ili `Windows`. |
| **Korisničko ime** | PVWA korisnik kojim se Semaphore prijavljuje. Obavezno. |
| **Lozinka** | Lozinka tog korisnika. Može se čuvati u bazi podataka, čitati iz promenljive okruženja ili učitati iz fajla. |
| **Podrazumevani Safe** | Safe koji se koristi kada ključ referencira nalog bez Safe prefiksa, kao i podrazumevana putanja sinhronizacije. |
| **ID platforme za nove naloge** | Platforma dodeljena nalozima koje Semaphore kreira (na primer `UnixSSH`). Obavezno samo kada skladište nije samo za čitanje i kreirate ključeve iz Semaphore-a. |
| **Adresa za nove naloge** | Opciono svojstvo adrese za naloge koje Semaphore kreira. Neke platforme to zahtevaju. |

Skladište može raditi u režimu samo za čitanje. U tom režimu Semaphore samo čita i sinhronizuje naloge i nikada ne kreira, ne ažurira niti briše bilo šta u Vault-u.

### Zahtevane PVWA dozvole {#required-pvwa-permissions}

Dodelite Semaphore korisniku sledeće dozvole za svaki Safe koji koristite:

| Operacija | Dozvole za Safe |
|-----------|-----------------|
| Čitanje ključa, sinhronizacija | **Prikaz liste naloga**, **Preuzimanje naloga** |
| Kreiranje ključa iz Semaphore-a | **Dodavanje naloga** |
| Ažuriranje ključa iz Semaphore-a | **Ažuriranje vrednosti lozinke**, **Ažuriranje svojstava naloga** |
| Brisanje ključa iz Semaphore-a | **Brisanje naloga** |

Semaphore uvek zahteva konkurentnu PVWA sesiju (`concurrentSession`), tako da više Semaphore čvorova ili pokrenut zadatak i planirana sinhronizacija mogu deliti istog korisnika bez međusobnog odjavljivanja. Ovo zahteva PVWA 11.3 ili noviji.

:::warning
Nemojte omogućavati "zahtevaj razlog" ili integraciju sa tiket sistemima za Safe-ove koje koristi Semaphore. Semaphore šalje fiksni razlog, ali ne može pružiti brojeve tiketa.
:::

## Kako se koristi {#how-to-use}

1. U svom projektu otvorite **Key Store → Storages** i kreirajte **CyberArk** skladište.
2. Prilikom kreiranja ili izmene ključa, izaberite to skladište i unesite nalog kao `Safe/AccountName`. Ime naloga je ime objekta prikazano u PVWA. Ako skladište ima podrazumevani Safe, dovoljno je navesti samo `AccountName`.
3. Opciono konfigurišite [putanje sinhronizacije](/user-guide/key-store/secret-sync) za automatski uvoz celih Safe-ova po rasporedu.

### Mapiranje tipova ključeva {#key-type-mapping}

| Tip ključa Semaphore | CyberArk nalog |
|----------------------|----------------|
| **Prijava lozinkom** | Nalog sa lozinkom: `userName` postaje korisničko ime, tajna naloga postaje lozinka. |
| **SSH** | Nalog sa ključem (`secretType: key`): `userName` postaje korisničko ime, tajna naloga je privatni ključ. SSH ključevi sa lozinkom se ne mogu čuvati u CyberArk-u. |
| **Tajna / tekst** | Nalog sa lozinkom bez korisničkog imena. Tajna naloga se koristi u izvornom obliku. |

Kada Semaphore kreira nalog, automatsko upravljanje putem Central Policy Manager-a (CPM) je onemogućeno kako CyberArk ne bi rotirao tajnu koju je Semaphore upravo upisao. Ako želite da CyberArk rotira akreditive, upravljajte nalogom iz PVWA i označite skladište u Semaphore-u kao samo za čitanje.

## Sinhronizacija tajni {#syncing-secrets}

Putanja sinhronizacije je naziv Safe-a. Semaphore uvozi svaki nalog iz Safe-a kao ključ nazvan po nalogu (sa opcionim prefiksom). Tip ključa se detektuje na osnovu naloga: nalozi sa ključem postaju SSH ključevi, nalozi sa lozinkom i korisničkim imenom postaju ključevi za prijavu lozinkom, a nalozi bez korisničkog imena postaju obične tajne. Pogledajte [Sinhronizacija tajni sa udaljenih skladišta](/user-guide/key-store/secret-sync).
