# Task-JWTs

Wenn die [JWT-Ausstellung auf dem Server aktiviert ist](/admin-guide/security/jwt),
kann ein Template für jeden von ihm gestarteten Task ein kurzlebiges, signiertes Token erzeugen.
Das Token wird dem laufenden Playbook oder Skript als Umgebungsvariable
`SEMAPHORE_JWT` bereitgestellt und kann bei jedem System, das JWT-Authentifizierung
unterstützt – etwa OpenBao oder HashiCorp Vault –
gegen Zugangsdaten eingetauscht werden.

Der Vorteil gegenüber einem langlebigen Secret im
[Key Store](/user-guide/key-store) besteht darin, dass jeder Task ein **frisches Token
erhält, das den genauen Task-Lauf identifiziert** (Projekt, Template, Benutzer-ID) und
kurz nach Abschluss des Tasks abläuft.

## JWTs für ein Template aktivieren {#enabling-jwts-on-a-template}

Scrollen Sie im Template-Formular zum Abschnitt **JWT** (er erscheint nur, wenn der
Administrator die [JWT-Ausstellung aktiviert](/admin-guide/security/jwt) hat) und
aktivieren Sie **JWT aktiviert**.

Sie können pro Template die folgenden Optionen konfigurieren:

| Feld | Beschreibung |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Eine oder mehrere Zeichenketten, die im Claim `aud` ausgegeben werden. Setzen Sie hier die Kennung(en), die Ihr nachgelagertes System erwartet (zum Beispiel die URL des OpenBao-Servers). Bis zu 32 Einträge werden unterstützt. |
| TTL | Gültigkeitsdauer des Tokens als Zeitspanne (`30s`, `10m`, `1h`, ...). Bleibt das Feld leer, wird der globale Wert `jwt.default_ttl` verwendet. Die TTL darf den globalen Wert `jwt.max_ttl` nicht überschreiten. |

## Token-Claims {#token-claims}

Jedes Token enthält die folgenden Claims, auf die Sie sich bei der Zugriffsvergabe
im nachgelagerten System verlassen können:

| Claim | Beispiel | Hinweise |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Vom Administrator konfiguriert. |
| `aud` | `https://bao.example.com` | Aus der Audience-Liste des Templates. |
| `sub` | `task:1234` | Eindeutig pro Task-Lauf. |
| `iat` / `nbf` / `exp` | | Standard-Zeitangaben. |
| `jti` | | Eindeutige Token-Kennung. |
| `project_id` | `7` | Projekt, zu dem das Template gehört. |
| `template_id` | `42` | Das Template, das den Task erzeugt hat. |
| `user_id` | `67` | Benutzer, der den Task gestartet hat (entfällt bei geplanten Läufen / Integrationsläufen) |

Verwenden Sie diese Claims, um den Zugriff auf der konsumierenden Seite **einzugrenzen**. Zum Beispiel eine
OpenBao-Rolle, die nur Tokens mit `project_id = 7` und einer bestimmten
`template_id` akzeptiert.

## Das Token innerhalb eines Tasks verwenden {#using-the-token-inside-a-task}

Semaphore exportiert das Token als `SEMAPHORE_JWT` in die Umgebung des
Task-Prozesses.

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

## Beispiel: OpenBao {#example-openbao}

Die folgende Anleitung konfiguriert OpenBao so, dass es den JWTs von Semaphore vertraut, und
tauscht diese gegen ein Demo-Passwort ein.
Ersetzen Sie `semaphore.example.com` und `bao.example.com` durch Ihre eigenen Hostnamen.

### 1. JWT-Auth-Methode konfigurieren {#1-configure-the-jwt-auth-method}

Aktivieren Sie die JWT-Auth-Methode und richten Sie sie auf den JWKS-Endpunkt Ihrer
Semaphore-Instanz aus. OpenBao verwendet den dort abgerufenen öffentlichen Schlüssel, um
jedes Token zu verifizieren.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Richtlinie definieren {#2-define-a-policy}

Gewähren Sie die Berechtigungen, die ein Task benötigt. Das folgende Beispiel erlaubt das Lesen der
Demo-Zugangsdaten unter `kv/data/semaphore/demo`:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Eine an ein Template gebundene OpenBao-Rolle definieren {#3-define-an-openbao-role-bound-to-a-template}

Eine OpenBao-Rolle entscheidet, **welche Semaphore-Tasks** welche Richtlinie
annehmen dürfen. Verwenden Sie die Semaphore-spezifischen Claims (`project_id`, `template_id`, ...)
als `bound_claims`, sodass nur das vorgesehene Template die Rolle nutzen kann:

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

Schränken Sie jede Rolle immer mindestens über einen `project_id`- oder `template_id`-Claim
ein. Ohne eine solche Bindung könnte **jedes** von Ihrer Semaphore-Instanz ausgestellte JWT
die Rolle annehmen.

Eine vollständige Liste der unterstützten Konfigurationsparameter finden Sie [hier](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Template konfigurieren {#4-configure-the-template}

Im Semaphore-Template, das das Deploy-Playbook ausführt:

- Aktivieren Sie **JWT aktiviert**.
- Setzen Sie **Audience** auf `https://bao.example.com` – dies entspricht
  `bound_audiences` in der OpenBao-Rolle.
- Setzen Sie optional **TTL** auf `15m`, damit das Token kurz nach Abschluss des
  Tasks abläuft.

### 5. Das Token im Task verwenden {#5-use-the-token-in-the-task}

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

Der Task authentifiziert sich jetzt bei OpenBao ohne ein vorab geteiltes Secret :tada:
