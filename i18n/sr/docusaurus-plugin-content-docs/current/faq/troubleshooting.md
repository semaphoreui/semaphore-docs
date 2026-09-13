---
title: Rešavanje problema
description: "Rešenja za najčešće probleme: greška 404 kod runner-a, Gathering Facts u Ansible-u, SSL u Postgres-u, git klonovi, izostao ispis skripte i LDAP greške."
---

# Rešavanje problema

## Runner prijavljuje grešku 404 {#runner-prints-error-404}

### Kako rešiti {#how-to-fix}

[Runner vraća kod greške 401](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## Problem sa Gathering Facts za localhost {#gathering-facts-issue-for-localhost}

Problem se može pojaviti kod Semaphore UI instaliranog preko [Snap](https://snapcraft.io/semaphore) ili [Docker](https://hub.docker.com/r/semaphoreui/semaphore) paketa.

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Zašto se ovo dešava {#why-this-happens}

Više informacija o korišćenju localhost-a u Ansible-u potražite u članku [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible pokušava da prikupi činjenice (facts) lokalno, ali se nalazi u ograničenom izolovanom kontejneru koji to ne dozvoljava.

### Kako ovo rešiti {#how-to-fix-this}

Postoje dva načina:

1. Isključite prikupljanje činjenica:

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Eksplicitno podesite tip konekcije na **ssh**:
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```
---
## panic: pq: SSL is not enabled on the server {#panic-pq-ssl-is-not-enabled-on-the-server}

Ovo znači da vaš Postgres ne radi preko SSL-a.

### Kako ovo rešiti {#how-to-fix-this-1}

Dodajte opciju `sslmode=disable` u konfiguracioni fajl:

```json
	"postgres": {
		"host": "localhost",
		"user": "postgres",
		"pass": "pwd",
		"name": "semaphore",
		"options": {
			"sslmode": "disable"
		}
	},
```
---
## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

Ovo znači da pokušavate da preko HTTPS-a pristupite repozitorijumu koji zahteva autentifikaciju.

### Kako ovo rešiti {#how-to-fix-this-2}

* Otvorite ekran **Skladište ključeva**.
* Kreirajte novi ključ tipa `Login with password`.
* Navedite svoje korisničko ime za GitHub/BitBucket itd.
* Navedite lozinku. Za GitHub/BitBucket ne možete koristiti lozinku naloga, već umesto nje morate koristiti Personal Access Token (PAT). Pročitajte više [ovde](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* Nakon kreiranja ključa otvorite ekran **Repozitorijumi**, pronađite svoj repozitorijum i navedite ključ.

---

## Git clone ili pull povremeno ne uspeva {#git-clone-or-pull-fails-intermittently}

U logovima zadatka mogu se pojaviti poruke poput `Git pull failed (...), retrying in 2s`, praćene uspehom ili konačnim neuspehom nakon nekoliko pokušaja.

### Zašto se ovo dešava {#why-this-happens-1}

Git server (GitHub, GitLab, Bitbucket ili self-hosted instanca) bio je privremeno nedostupan, vratio je prolaznu HTTP grešku, ili je mreža između Semaphore-a i servera imala kratak prekid. Semaphore automatski ponavlja operacije clone i pull pre nego što zadatak označi kao neuspešan.

### Kako ovo rešiti {#how-to-fix-this-3}

1. **Prolazni ispadi**: obično se rešavaju sami. Semaphore ponavlja pokušaj do `git_attempts` puta (podrazumevano 4), sa eksponencijalnim odlaganjem između pokušaja.
2. **Česti neuspesi**: povećajte broj pokušaja u konfiguraciji:

```json
{
  "git_attempts": 8
}
```

Ili pomoću promenljive okruženja:

```bash
export SEMAPHORE_GIT_ATTEMPTS=8
```

3. **Trenutni, dosledni neuspesi**: ponovni pokušaji neće pomoći. Proverite URL repozitorijuma, ime grane, pristupne ključeve i mrežnu povezanost sa Semaphore servera ili sa hosta na kom radi runner.

Detalje o `git_client` i `git_attempts` potražite u odeljku [Git operacije](/admin-guide/configuration/config-file#git-operations).

---

## Ispis Bash skripte nedostaje ili je nepotpun {#bash-script-output-is-missing-or-incomplete}

Bash zadatak se uspešno završava, ali log prikazuje malo ili nimalo ispisa iz `echo`, `printf` ili drugih komandi — naročito kada se skripta brzo završi.

### Zašto se ovo dešava {#why-this-happens-2}

Semaphore hvata stdout i stderr shell komandi dok se one izvršavaju. Veoma kratke skripte mogu da se završe pre nego što se pročita sav baferovani ispis, pa poslednje linije mogu da izostanu iz loga zadatka.

### Kako ovo rešiti {#how-to-fix-this-4}

1. **Nadogradite**: novije verzije Semaphore-a do kraja pročitaju ispis procesa pre nego što zadatak označe kao završen. Ažurirajte server i runner-e ako koristite stariju verziju.
2. **Ispraznite bafer ispisa u skripti** kada vam je potrebna zagarantovana isporuka:

```bash
#!/bin/bash
echo "Starting deploy"
echo "Done" >&2
```

Za kritičnu dijagnostiku upisujte podatke u fajl unutar radnog prostora repozitorijuma i ispišite ga komandom `cat` na kraju skripte.
3. **Izbegavajte tihi rani izlazak**: koristite `set -euo pipefail` i eksplicitne poruke o greškama kako bi neuspesi bili vidljivi i kada je ispis kratak.

---

## unable to read LDAP response packet: unexpected EOF {#unable-to-read-ldap-response-packet-unexpected-eof}

Najverovatnije pokušavate da se povežete na LDAP server nebezbednom metodom, iako on očekuje bezbednu vezu (preko TLS-a).

### Kako ovo rešiti {#how-to-fix-this-5}

Uključite TLS u fajlu `config.json`:

```json
...
"ldap_needtls": true
...
```

---

## LDAP Result Code 49 "Invalid Credentials" {#ldap-result-code-49-invalid-credentials}

Imate pogrešnu lozinku ili `binddn`.

### Kako ovo rešiti {#how-to-fix-this-6}

Upotrebite alat `ldapwhoami` i proverite da li vaš binddn radi:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

Alat će interaktivno zatražiti lozinku i trebalo bi da vrati kod **0** i ispiše **DN** kako je naveden.

Možete pročitati i sledeće članke: 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/semaphoreui/semaphore/issues/906](https://github.com/semaphoreui/semaphore/issues/906)

---

## LDAP Result Code 32 "No Such Object" {#ldap-result-code-32-no-such-object}

Direktorijum nema unos pod distinguished name-om o kom je Semaphore pitao. Gotovo uvek
je u pitanju pogrešan `ldap_searchdn`, ređe pogrešan `ldap_binddn`.

### Kako ovo rešiti {#how-to-fix-this-7}

Proverite da li osnova pretrage postoji, koristeći iste akreditive koje koristi i Semaphore:

```bash
ldapsearch\
  -H ldap://ldap.example.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -b "/your/ldap_searchdn/value/in/config/file"\
  -x\
  -W\
  -s base
```

- Kod rezultata **32** kod ove komande znači da sama osnova ne postoji.
  Ispravite `ldap_searchdn` u fajlu `config.json`; uobičajen uzrok je greška u kucanju
  nekog dela, na primer `OU=Users` umesto stvarnog `OU=People`.
- Kod rezultata **0** znači da je osnova ispravna i da je problem u
  `ldap_searchfilter`: on ne pronalazi nijedan unos ispod te osnove.

Značenje svake opcije potražite u odeljku [LDAP i AD](/admin-guide/authentication/ldap).
