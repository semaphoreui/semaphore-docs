# 🔐 Bezbednost

## Uvod {#introduction}

Bezbednost je glavni prioritet u Semaphore UI. Bilo da automatizujete kritične infrastrukturne zadatke (Task) ili upravljate pristupom tima (Team) osetljivim sistemima, Semaphore UI je projektovan da odmah po instalaciji obezbedi robustan i bezbedan rad. Ovaj odeljak opisuje kako Semaphore pristupa bezbednosti i šta treba da uzmete u obzir pri uvođenju u produkciju.

## Autentifikacija i autorizacija {#authentication--authorization}

Semaphore podržava bezbednu autentifikaciju i fleksibilne mehanizme autorizacije:

- **Načini prijavljivanja:**
  - **Korisničko ime/lozinka**<br />Podrazumevani način koji koristi kredencijale sačuvane u Semaphore bazi podataka. Lozinke se nikada ne čuvaju u čitljivom obliku; heširaju se algoritmom Argon2id (pogledajte [Heširanje lozinki](#password-hashing)).

  - **LDAP**<br />Omogućava integraciju sa korporativnim servisima direktorijuma. Podržava filtriranje korisnika/grupa i bezbedne veze preko LDAPS-a.

  - **OpenID Connect (OIDC)**<br />Omogućava jedinstveno prijavljivanje (SSO) sa provajderima identiteta kao što su Google, Azure AD ili Keycloak. Podržava prilagođene claim-ove i mapiranje grupa.

- **Dvofaktorska autentifikacija (2FA)**<br />Dostupna je 2FA zasnovana na TOTP-u i preporučuje se za sve korisnike. Može se uključiti po korisniku i podržava opcione kodove za oporavak. Pogledajte konfiguracione opcije `mfa.totp.enabled` i `mfa.totp.allow_recovery`.

- **Kontrola pristupa zasnovana na ulogama**<br />Korisnicima možete dodeliti različite uloge, kao što su Admin, Maintainer ili Viewer, čime se pristup ograničava prema odgovornostima.

- **Upravljanje sesijama**<br />Sesije su zaštićene bezbednim HTTP kolačićima. Mehanizmi isteka sesije i odjavljivanja obezbeđuju minimalnu izloženost.
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

### Heširanje lozinki {#password-hashing}

:::info Od verzije 2.20
Heširanje lozinki algoritmom Argon2id dostupno je od verzije **Semaphore 2.20**. Ranije verzije koriste bcrypt.
:::

Lozinke lokalnih korisnika heširaju se algoritmom **Argon2id**, koji [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) preporučuje za čuvanje lozinki. Semaphore koristi OWASP parametre minimalne jačine:

| Parametar | Vrednost |
|-----------|-------|
| Memorija | 19 MiB (`m=19456`) |
| Iteracije | 2 (`t=2`) |
| Paralelizam | 1 (`p=1`) |
| So (salt) | 16 nasumičnih bajtova po lozinki |
| Dužina heša | 32 bajta |

Heševi se čuvaju u standardnom [PHC string formatu](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md), na primer `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`, tako da su parametri korišćeni za svaki heš zabeleženi uz njega.

Ovo važi za svaki način na koji se lozinka može postaviti: veb interfejs, API i CLI komande `semaphore user add`, `semaphore user change-by-login` i `semaphore setup`.

**Nadogradnja sa verzija starijih od 2.20.** Izdanja pre verzije 2.20 heširala su lozinke algoritmom bcrypt. Nije potreban nikakav korak migracije:

- Postojeći bcrypt heševi se i dalje prihvataju pri prijavljivanju, tako da svi korisnici nastavljaju da rade nakon nadogradnje.
- Pri prvom uspešnom prijavljivanju lozinka se transparentno ponovo hešira algoritmom Argon2id, a bcrypt heš se zamenjuje.
- Ako se Argon2id parametri u Semaphore-u u nekom budućem izdanju ojačaju, heševi kreirani sa starijim parametrima nadograđuju se na isti način pri sledećem prijavljivanju.

Pošto se ponovno heširanje dešava samo pri prijavljivanju, korisnici koji se više nikada ne prijave zadržavaju svoj bcrypt heš. Da biste prinudno nadogradili takve naloge, resetujte njihovu lozinku komandom `semaphore user change-by-login --password ...` ili preko administratorskog interfejsa.

:::note
Kodovi za oporavak dvofaktorske autentifikacije nisu korisničke lozinke i nastavljaju da koriste bcrypt.
:::

## Tajne i kredencijali {#secrets--credentials}

Bezbedno upravljanje tajnama je jedna od osnovnih funkcija:

- **Šifrovano skladište ključeva**<br />Kredencijali i tajne promenljive u skladištu ključeva (Key Store) šifrovani su u stanju mirovanja pomoću AES šifrovanja.

- **Izolacija okruženja**<br />Tajne se poslovima prosleđuju samo u vreme izvršavanja i ne izlažu se direktno okruženju kontejnera.

- **SSH ključevi i tokeni**<br />Korisnici su odgovorni za otpremanje važećih SSH ključeva i tokena. Oni se šifruju i koriste isključivo pri izvršavanju zadataka.
- **Integracija sa HashiCorp Vault (Pro)**<br />Tajne se mogu čuvati u eksternoj Vault instanci. Način skladištenja birate za svaku tajnu pojedinačno prilikom njenog kreiranja ili izmene.

## Šifrovanje podataka {#data-encryption}

Osetljivi podaci se čuvaju u bazi podataka u šifrovanom obliku. Da biste uključili šifrovanje pristupnih ključeva (Access Keys), postavite konfiguracionu opciju `access_key_encryption` u konfiguracionoj datoteci. Njena vrednost mora biti generisana komandom:

```bash
head -c32 /dev/urandom | base64
```

## Izvršavanje nepouzdanog koda / playbook-ova {#running-untrusted-code--playbooks}

Semaphore izvršava playbook-ove i komande koje definišu korisnici, što može biti rizično:

- **Izolacija u kontejnerima**<br />Zadaci se izvršavaju u izolovanim Docker kontejnerima. Ti kontejneri nemaju pristup host sistemu.

- **Izolacija izvršavanja**<br />Podrazumevano je zadatak običan proces na Semaphore serveru, sa njegovim fajl sistemom i mrežnim pristupom. Izolacija je opciona: predajte zadatak [raneru](/admin-guide/runners) podešenom sa `docker` ili `k8s` izvršiocem i svaki zadatak dobija nov kontejner ili Pod koji se briše po završetku.

- **Najmanje privilegije**<br />Sa Docker i Kubernetes izvršiocima sami birate imidž, mrežu i servisni nalog, pa zadatak dobija samo ono što mu je potrebno.

- **Korisnik procesa zadatka**<br />Zadaci se mogu izvršavati pod namenskim sistemskim korisnikom koji nije root (npr. `semaphore`), čime se smanjuje uticaj potencijalnih eksploatacija. Ovo je opciono i može se podesiti u skladu sa sistemskim politikama.
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## Bezbedno uvođenje {#secure-deployment}

Da bi Semaphore bio bezbedno uveden:

- **Koristite HTTPS**<br />
    Semaphore podržava HTTPS i preko **ugrađene TLS podrške** i preko **obrnutog proksija kao što je Nginx**. Strogo se preporučuje da u produkciji uključite HTTPS.

    Da biste uključili ugrađenu HTTPS podršku, dodajte sledeći blok u **config.json**:
    ```json
    {
        ...
        "tls": {
            "enabled": true,
            "cert_file": "/path/to/cert/example.com.cert",
            "key_file": "/path/to/key/example.com.key"
        }
        ...
    }
    ```

- **Radite iza firewall-a**<br />Ograničite pristup Semaphore UI i bazi podataka samo na pouzdane IP adrese.

- **Bezbednost baze podataka**<br />Koristite jake lozinke i ograničite pristup bazi podataka isključivo na Semaphore.

## Ažuriranja i upravljanje zakrpama {#updates--patch-management}

Bezbednosna ažuriranja se objavljuju redovno:

- **Budite ažurni**<br />Uvek koristite najnovije stabilno izdanje.

- **Dnevnik izmena**<br />Pregledajte izmene na GitHub-u pre ažuriranja.

- **Automatska ažuriranja**<br />Ako koristite Docker, razmotrite automatizovane pipeline-ove za redovna ažuriranja.

<!-- ## Audit Logs & Monitoring

Semaphore provides basic audit logging:

- **User Activity**: Logins, failed attempts, and task executions are logged.
- **Configuration Changes**: Changes to settings, projects, and credentials are logged with timestamps.
- **Integration**: Logs can be forwarded to centralized logging systems like ELK or Prometheus exporters. -->

<!-- ## Backups & Disaster Recovery

To protect against data loss:

- **What to Back Up**: Semaphore database, configuration file, and secret storage.
- **How to Restore**: Follow the backup/restore guide in the admin docs.
- **Testing**: Periodically test restoring backups in a staging environment. -->

<!-- ## Common Vulnerabilities & Hardening Tips

- **Disable User Registration** if not needed to prevent unauthorized access.
- **Use Strong Passwords** and enforce complexity rules.
- **Limit Task Concurrency** to avoid resource exhaustion.
- **Restrict Access to Secrets** by managing team permissions carefully. -->

<!-- ## Compliance & Data Privacy

Semaphore collects minimal user data:

- **Data Handling**: Emails, IP logs, and session data are stored securely.
- **User Deletion**: Admins can delete user accounts and associated data upon request.
- **GDPR Compliance**: Self-hosted users are responsible for local compliance. -->

## Prijavljivanje ranjivosti {#reporting-vulnerabilities}

Pronašli ste ranjivost? Pomozite nam da Semaphore ostane bezbedan:

- **Odgovorno obelodanjivanje**<br />Pošaljite nam e-poštu na `security@semaphoreui.com`.
 
### Ciljni rokovi za otklanjanje ranjivosti {#vulnerability-resolution-targets}

Nastojimo da prijavljene ranjivosti otklonimo u sledećim ciljnim rokovima:

- Kritične: u roku od 30 dana
- Visoke: u roku od 60 dana
- Srednje: u roku od 90 dana
- Niske: prema mogućnostima, obično u roku od 180 dana

Vanredne zakrpe mogu biti objavljene za probleme koji se aktivno eksploatišu i pogađaju najnovija stabilna izdanja.

### Alati za bezbednost koda {#code-security-tooling}

Koristimo CodeQL, Codacy, Snyk i Renovate za analizu koda i zavisnosti, kao i za automatizaciju ažuriranja zavisnosti.
- **Bez javnih eksploata**<br />Ne delite ranjivosti javno dok ne budu zakrpljene.

- **Zahvalnice**<br />Istraživači bezbednosti mogu, po želji, biti pomenuti u beleškama o izdanju.

