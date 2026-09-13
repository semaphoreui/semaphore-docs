# Rešavanje problema

## 1. Runner prijavljuje grešku 404 {#1-runner-prints-error-404}

### Kako rešiti {#how-to-fix}

[Runner vraća kod greške 401](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## 2. Problem sa Gathering Facts za localhost {#2-gathering-facts-issue-for-localhost}

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
## 3. panic: pq: SSL is not enabled on the server {#3-panic-pq-ssl-is-not-enabled-on-the-server}

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


## 4. fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#4-fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

Ovo znači da pokušavate da pristupite repozitorijumu (Repository) preko HTTPS-a koji zahteva autentifikaciju.

### Kako ovo rešiti {#how-to-fix-this-2}

* Otvorite ekran **Skladište ključeva** (Key Store).
* Kreirajte novi ključ tipa `Login with password`.
* Navedite svoje korisničko ime za GitHub/BitBucket itd.
* Navedite lozinku. Za GitHub/BitBucket ne možete koristiti lozinku naloga, već umesto nje morate koristiti lični pristupni token (Personal Access Token, PAT). Pročitajte više [ovde](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* Nakon kreiranja ključa otvorite ekran **Repozitorijumi** (Repositories), pronađite svoj repozitorijum i navedite ključ.


---

## 5. Git clone ili pull povremeno ne uspeva {#5-git-clone-or-pull-fails-intermittently}

U logovima zadatka (Task) mogu se pojaviti poruke poput `Git pull failed (...), retrying in 2s`, praćene uspehom ili konačnim neuspehom nakon nekoliko pokušaja.

### Zašto se ovo dešava {#why-this-happens-1}

Git server je privremeno bio nedostupan ili je vratio prolaznu grešku. Semaphore automatski ponavlja operacije clone i pull pre nego što zadatak označi kao neuspešan.

### Kako ovo rešiti {#how-to-fix-this-3}

1. **Prolazni ispadi**: obično se rešavaju sami. Semaphore ponavlja pokušaj do `git_attempts` puta (podrazumevano 4) sa eksponencijalnim odlaganjem.
2. **Česti neuspesi**: povećajte `git_attempts` u konfiguraciji ili podesite `SEMAPHORE_GIT_ATTEMPTS`.
3. **Trenutni, dosledni neuspesi**: proverite URL repozitorijuma, granu, pristupne ključeve i mrežnu povezanost.

Detalje o konfiguraciji potražite u odeljku [Git operacije](/admin-guide/configuration/config-file#git-operations).

---

## 6. unable to read LDAP response packet: unexpected EOF {#6-unable-to-read-ldap-response-packet-unexpected-eof}

Najverovatnije pokušavate da se povežete na LDAP server nebezbednom metodom, iako on očekuje bezbednu vezu (preko TLS-a).

### Kako ovo rešiti {#how-to-fix-this-4}

Uključite TLS u fajlu `config.json`:

```json
...
"ldap_needtls": true
...
```

---

## 7. LDAP Result Code 49 "Invalid Credentials" {#7-ldap-result-code-49-invalid-credentials}

Imate pogrešnu lozinku ili `binddn`.

### Kako ovo rešiti {#how-to-fix-this-5}

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

## 8. LDAP Result Code 32 "No Such Object" {#8-ldap-result-code-32-no-such-object}

Uskoro.
