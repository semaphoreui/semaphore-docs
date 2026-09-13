# JWT dei task

Quando [l'emissione di JWT è abilitata sul server](/admin-guide/security/jwt),
un template può generare un token firmato di breve durata per ogni task che avvia.
Il token viene esposto al playbook o allo script in esecuzione tramite la
variabile d'ambiente `SEMAPHORE_JWT` e può essere scambiato con credenziali
presso qualsiasi sistema che supporti l'autenticazione JWT,
come OpenBao o HashiCorp Vault.

Il vantaggio rispetto a un segreto di lunga durata memorizzato nel
[Key Store](/user-guide/key-store) è che ogni task riceve un **token nuovo
che identifica esattamente l'esecuzione del task** (progetto, template, id utente) e
scade poco dopo il termine del task.

## Abilitazione dei JWT su un template {#enabling-jwts-on-a-template}

Nel modulo del template, scorrere fino alla sezione **JWT** (compare solo quando
l'amministratore ha [abilitato l'emissione di JWT](/admin-guide/security/jwt)) e
selezionare **JWT abilitato**.

È possibile configurare le seguenti opzioni per ciascun template:

| Campo | Descrizione |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Una o più stringhe emesse nel claim `aud`. Impostare qui l'identificatore o gli identificatori attesi dal sistema a valle (ad esempio l'URL del server OpenBao). Sono supportate fino a 32 voci. |
| TTL | Durata del token espressa come intervallo (`30s`, `10m`, `1h`, ...). Se lasciato vuoto, viene utilizzato il valore globale `jwt.default_ttl`. Il TTL non deve superare il valore globale `jwt.max_ttl`. |

## Claim del token {#token-claims}

Ogni token contiene i seguenti claim, sui quali è possibile fare affidamento per concedere
l'accesso nel sistema a valle:

| Claim | Esempio | Note |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Configurato dall'amministratore. |
| `aud` | `https://bao.example.com` | Dall'elenco audience del template. |
| `sub` | `task:1234` | Univoco per ogni esecuzione del task. |
| `iat` / `nbf` / `exp` | | Claim temporali standard. |
| `jti` | | Identificatore univoco del token. |
| `project_id` | `7` | Progetto a cui appartiene il template. |
| `template_id` | `42` | Il template che ha generato il task. |
| `user_id` | `67` | Utente che ha avviato il task (omesso per le esecuzioni pianificate / da integrazione) |

Utilizzare questi claim per **limitare** l'accesso sul lato consumatore. Ad esempio un
ruolo OpenBao che accetta solo token con `project_id = 7` e un
`template_id` specifico.

## Utilizzo del token all'interno di un task {#using-the-token-inside-a-task}

Semaphore esporta il token come `SEMAPHORE_JWT` nell'ambiente del
processo del task.

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

## Esempio: OpenBao {#example-openbao}

La seguente procedura configura OpenBao affinché consideri attendibili i JWT di Semaphore e
li scambi con una password dimostrativa.
Sostituire `semaphore.example.com` e `bao.example.com` con i propri nomi host.

### 1. Configurare il metodo di autenticazione JWT {#1-configure-the-jwt-auth-method}

Abilitare il metodo di autenticazione JWT e puntarlo all'endpoint JWKS della propria
istanza Semaphore. OpenBao utilizza la chiave pubblica recuperata da lì per verificare
ogni token.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Definire una policy {#2-define-a-policy}

Concedere le autorizzazioni necessarie a un task. L'esempio seguente consente di leggere la
credenziale dimostrativa che si trova in `kv/data/semaphore/demo`:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Definire un ruolo OpenBao associato a un template {#3-define-an-openbao-role-bound-to-a-template}

Un ruolo OpenBao stabilisce **quali task di Semaphore** possono assumere quale
policy. Utilizzare i claim specifici di Semaphore (`project_id`, `template_id`, ...)
come `bound_claims`, in modo che solo il template previsto possa utilizzare il ruolo:

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

Limitare sempre ogni ruolo con almeno un claim `project_id` o `template_id`.
Senza un vincolo, **qualsiasi** JWT emesso dalla propria istanza Semaphore
potrebbe assumere il ruolo.

L'elenco completo dei parametri di configurazione supportati è disponibile [qui](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Configurare il template {#4-configure-the-template}

Nel template Semaphore che esegue il playbook di deploy:

- Selezionare **JWT abilitato**.
- Impostare **Audience** su `https://bao.example.com` – corrisponde a
  `bound_audiences` nel ruolo OpenBao.
- Facoltativamente impostare **TTL** su `15m`, in modo che il token scada poco dopo il
  termine del task.

### 5. Utilizzare il token nel task {#5-use-the-token-in-the-task}

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

Il task ora si autentica su OpenBao senza alcun segreto precondiviso :tada:
