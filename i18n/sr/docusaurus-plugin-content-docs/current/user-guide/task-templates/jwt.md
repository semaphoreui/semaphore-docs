# JWT tokeni zadataka

Kada je [izdavanje JWT tokena uključeno na serveru](/admin-guide/security/jwt),
šablon zadatka (Task Template) može da izda kratkotrajni, potpisani token za svaki zadatak (Task) koji pokrene.
Token je dostupan playbook-u ili skripti koja se izvršava kao promenljiva okruženja
`SEMAPHORE_JWT` i može se zameniti za kredencijale
u bilo kom sistemu koji podržava JWT autentifikaciju –
kao što su OpenBao ili HashiCorp Vault.

Prednost u odnosu na dugotrajnu tajnu sačuvanu u
[skladištu ključeva](/user-guide/key-store) (Key Store) je to što svaki zadatak dobija **svež token
koji identifikuje tačno to pokretanje zadatka** (projekat, šablon, id korisnika) i
ističe ubrzo nakon završetka zadatka.

## Uključivanje JWT tokena na šablonu {#enabling-jwts-on-a-template}

U formi šablona pomerite se do odeljka **JWT** (pojavljuje se samo kada je
administrator [uključio izdavanje JWT tokena](/admin-guide/security/jwt)) i
štiklirajte **JWT uključen** (JWT enabled).

Za svaki šablon možete podesiti sledeće opcije:

| Polje | Opis |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Jedan ili više stringova koji se upisuju u `aud` claim. Postavite ovo na identifikator(e) koje očekuje vaš ciljni sistem (na primer URL OpenBao servera). Podržano je do 32 stavke. |
| TTL | Trajanje tokena kao vremenski interval (`30s`, `10m`, `1h`, ...). Ako se ostavi prazno, koristi se globalna vrednost `jwt.default_ttl`. TTL ne sme biti veći od globalne vrednosti `jwt.max_ttl`. |

## Claim-ovi tokena {#token-claims}

Svaki token nosi sledeće claim-ove na koje se možete osloniti prilikom dodele
pristupa u ciljnom sistemu:

| Claim | Primer | Napomene |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Podešava administrator. |
| `aud` | `https://bao.example.com` | Iz liste audience vrednosti šablona. |
| `sub` | `task:1234` | Jedinstven za svako pokretanje zadatka. |
| `iat` / `nbf` / `exp` | | Standardni vremenski claim-ovi. |
| `jti` | | Jedinstveni identifikator tokena. |
| `project_id` | `7` | Projekat (Project) kojem šablon pripada. |
| `template_id` | `42` | Šablon koji je proizveo zadatak. |
| `user_id` | `67` | Korisnik koji je pokrenuo zadatak (izostavlja se za zakazana pokretanja i pokretanja iz integracija) |

Koristite ove claim-ove da **ograničite** pristup na strani potrošača. Na primer,
OpenBao uloga koja prihvata samo tokene sa `project_id = 7` i određenim
`template_id`.

## Korišćenje tokena unutar zadatka {#using-the-token-inside-a-task}

Semaphore izvozi token kao `SEMAPHORE_JWT` u okruženju
procesa zadatka.

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## Primer: OpenBao {#example-openbao}

Sledeće uputstvo podešava OpenBao tako da veruje JWT tokenima Semaphore-a i
zamenjuje ih za demo lozinku.
Zamenite `semaphore.example.com` i `bao.example.com` sopstvenim nazivima hostova.

### 1. Podesite JWT metod autentifikacije {#1-configure-the-jwt-auth-method}

Uključite JWT metod autentifikacije i usmerite ga na JWKS endpoint vaše
Semaphore instance. OpenBao koristi javni ključ koji odatle preuzima da bi proverio
svaki token.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Definišite politiku {#2-define-a-policy}

Dodelite dozvole koje su zadatku potrebne. Primer ispod dozvoljava čitanje
demo kredencijala koji se nalazi pod `kv/data/semaphore/demo`:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Definišite OpenBao ulogu vezanu za šablon {#3-define-an-openbao-role-bound-to-a-template}

OpenBao uloga odlučuje **koji Semaphore zadaci** smeju da preuzmu koju
politiku. Koristite claim-ove specifične za Semaphore (`project_id`, `template_id`, ...)
kao `bound_claims` da bi samo željeni šablon mogao da koristi ulogu:

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

Uvek ograničite svaku ulogu bar claim-om `project_id` ili `template_id`.
Bez takvog vezivanja **bilo koji** JWT koji izda vaša Semaphore instanca
mogao bi da preuzme ulogu.

Potpuna lista podržanih konfiguracionih parametara nalazi se [ovde](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Podesite šablon {#4-configure-the-template}

Na Semaphore šablonu koji pokreće deploy playbook:

- Štiklirajte **JWT uključen** (JWT enabled).
- Postavite **Audience** na `https://bao.example.com` – to odgovara vrednosti
  `bound_audiences` u OpenBao ulozi.
- Opciono postavite **TTL** na `15m` da bi token istekao ubrzo nakon
  završetka zadatka.

### 5. Koristite token u zadatku {#5-use-the-token-in-the-task}

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

Zadatak se sada autentifikuje prema OpenBao-u bez ikakve unapred deljene tajne :tada:
