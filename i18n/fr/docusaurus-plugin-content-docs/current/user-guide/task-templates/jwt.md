# JWT de tâche

Lorsque [l'émission de JWT est activée sur le serveur](/admin-guide/security/jwt),
un modèle peut générer un token signé de courte durée pour chaque tâche qu'il lance.
Le token est exposé au playbook ou au script en cours d'exécution via la
variable d'environnement `SEMAPHORE_JWT` et peut être échangé contre des identifiants
auprès de tout système prenant en charge l'authentification JWT –
comme OpenBao ou HashiCorp Vault.

L'avantage par rapport à un secret de longue durée stocké dans le
[magasin de clés](/user-guide/key-store) est que chaque tâche reçoit un **token neuf
qui identifie précisément l'exécution de la tâche** (projet, modèle, identifiant utilisateur) et
qui expire peu après la fin de la tâche.

## Activer les JWT sur un modèle {#enabling-jwts-on-a-template}

Dans le formulaire du modèle, faites défiler jusqu'à la section **JWT** (elle n'apparaît que lorsque
l'administrateur a [activé l'émission de JWT](/admin-guide/security/jwt)) et
cochez **JWT activé**.

Vous pouvez configurer les options suivantes pour chaque modèle :

| Champ | Description |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Une ou plusieurs chaînes émises dans le claim `aud`. Définissez-la sur le ou les identifiants attendus par votre système en aval (par exemple l'URL du serveur OpenBao). Jusqu'à 32 entrées sont prises en charge. |
| TTL | Durée de vie du token exprimée sous forme de durée (`30s`, `10m`, `1h`, ...). Si le champ est vide, la valeur globale `jwt.default_ttl` est utilisée. Le TTL ne doit pas dépasser la valeur globale `jwt.max_ttl`. |

## Claims du token {#token-claims}

Chaque token contient les claims suivants, sur lesquels vous pouvez vous appuyer pour accorder
l'accès dans le système en aval :

| Claim | Exemple | Remarques |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Configuré par l'administrateur. |
| `aud` | `https://bao.example.com` | Issu de la liste d'audiences du modèle. |
| `sub` | `task:1234` | Unique pour chaque exécution de tâche. |
| `iat` / `nbf` / `exp` | | Claims temporels standard. |
| `jti` | | Identifiant unique du token. |
| `project_id` | `7` | Projet auquel appartient le modèle. |
| `template_id` | `42` | Modèle qui a produit la tâche. |
| `user_id` | `67` | Utilisateur ayant lancé la tâche (omis pour les exécutions planifiées / par intégration) |

Utilisez ces claims pour **restreindre** l'accès côté consommateur. Par exemple un
rôle OpenBao qui n'accepte que les tokens avec `project_id = 7` et un
`template_id` spécifique.

## Utiliser le token dans une tâche {#using-the-token-inside-a-task}

Semaphore exporte le token sous le nom `SEMAPHORE_JWT` dans l'environnement du
processus de la tâche.

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

## Exemple : OpenBao {#example-openbao}

La procédure suivante configure OpenBao pour qu'il fasse confiance aux JWT de Semaphore et
les échange contre un mot de passe de démonstration.
Remplacez `semaphore.example.com` et `bao.example.com` par vos propres noms d'hôte.

### 1. Configurer la méthode d'authentification JWT {#1-configure-the-jwt-auth-method}

Activez la méthode d'authentification JWT et pointez-la vers le point de terminaison JWKS de votre
instance Semaphore. OpenBao utilise la clé publique qu'il y récupère pour vérifier
chaque token.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Définir une politique {#2-define-a-policy}

Accordez les permissions dont une tâche a besoin. L'exemple ci-dessous autorise la lecture de
l'identifiant de démonstration situé sous `kv/data/semaphore/demo` :

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Définir un rôle OpenBao lié à un modèle {#3-define-an-openbao-role-bound-to-a-template}

Un rôle OpenBao détermine **quelles tâches Semaphore** sont autorisées à assumer quelle
politique. Utilisez les claims spécifiques à Semaphore (`project_id`, `template_id`, ...)
comme `bound_claims` afin que seul le modèle prévu puisse utiliser le rôle :

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

Restreignez toujours chaque rôle avec au moins un claim `project_id` ou `template_id`.
Sans cette liaison, **n'importe quel** JWT émis par votre instance Semaphore
pourrait assumer le rôle.

La liste complète des paramètres de configuration pris en charge est disponible [ici](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Configurer le modèle {#4-configure-the-template}

Sur le modèle Semaphore qui exécute le playbook de déploiement :

- Cochez **JWT activé**.
- Définissez **Audience** sur `https://bao.example.com` – cela correspond à
  `bound_audiences` dans le rôle OpenBao.
- Définissez éventuellement **TTL** sur `15m` pour que le token expire peu après la
  fin de la tâche.

### 5. Utiliser le token dans la tâche {#5-use-the-token-in-the-task}

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

La tâche s'authentifie désormais auprès d'OpenBao sans aucun secret pré-partagé :tada:
