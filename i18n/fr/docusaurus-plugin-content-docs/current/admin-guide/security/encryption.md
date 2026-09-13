---
id: encryption
title: Clés de chiffrement
sidebar_label: Clés de chiffrement
description: Comment Semaphore chiffre les secrets, configure les clés de chiffrement et les fait tourner sans interruption de service.
---

# Clés de chiffrement

Semaphore chiffre les données les plus sensibles qu'il stocke — les **secrets des clés d'accès**
(clés privées SSH, couples identifiant/mot de passe, chaînes secrètes) et la **clé de signature
JWT** — avec AES‑256‑GCM. Cette page explique comment configurer ces clés, comment
fonctionne la rotation et comment l'exploiter en toute sécurité.

:::info Deux clés, deux usages

| Clé | Protège | Pointeur actif |
|-----|----------|----------------|
| **Clé des secrets** | Les secrets des clés d'accès stockés dans la base de données | `active.secret_key` |
| **Clé des options** | Les options chiffrées de la base de données (la clé de signature JWT) | `active.option_key` |

Si aucune clé des options n'est configurée, les options utilisent la clé des secrets par défaut.
:::

---

## Démarrage rapide {#quick-start}

La configuration la plus simple consiste en une seule clé fournie dans la configuration principale :

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

Générez une clé avec :

```bash
openssl rand -base64 32
```

C'est tout — Semaphore chiffre désormais les secrets avec `key1`. La même clé est utilisée pour
la clé de signature JWT (les options utilisent la clé des secrets par défaut).

:::tip Production
Préférez les **références `file:`** ou un **`keys_folder`** (voir ci-dessous) à une
`value:` en ligne, afin que le matériel de clé réside dans un secret monté plutôt que dans la configuration.
:::

---

## Identification des clés {#how-keys-are-identified}

Chaque clé possède un **identifiant de clé** dérivé du matériel de clé lui-même — une empreinte,
`base64url(sha256(key))[:8]`. L'identifiant (et non la clé) est stocké avec chaque
valeur chiffrée, de sorte que le déchiffrement consiste en une recherche directe de la clé exacte qui l'a écrite.

Cela signifie que :

- **Les libellés peuvent être renommés librement.** `key1`, `secrets_key_primary.txt` — ils sont
  destinés aux humains. La base de données ne les stocke jamais, uniquement l'empreinte.
- **Une clé ne peut jamais être mal ciblée.** Modifiez les octets d'une clé et elle devient un *nouvel*
  identifiant ; les anciennes données continuent de référencer l'ancien identifiant.
- **La suppression d'une clé échoue bruyamment**, pas silencieusement — un identifiant de clé manquant est une
  erreur explicite, jamais une sortie corrompue.

Vous ne définissez jamais les identifiants à la main ; Semaphore les calcule.

---

## Le fichier de clés {#the-keys-file}

`encryption.keys_file` pointe vers un fichier dont le contenu est un **registre de clés**
ainsi que des **pointeurs** vers la clé active pour chaque usage. Il est analysé en tant que **YAML ou JSON,
quelle que soit l'extension du fichier**.

Il existe deux façons de fournir le registre — une table en ligne, un dossier de fichiers, ou
les deux combinés.

### Table en ligne {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

Chaque entrée est une [`KeySource`](#keysource) : soit `value` (base64 en ligne) **soit**
`file` (chemin vers un fichier contenant la clé en base64) — jamais les deux.

### Dossier de fichiers de clés {#folder-of-key-files}

Faites pointer `keys_folder` vers un répertoire ; **chaque fichier régulier est une clé**, libellée par
son nom de fichier. Idéal pour les secrets Docker/Kubernetes montés.

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Compatible Kubernetes
`keys_folder` ignore les entrées préfixées par un point (`..data`, `..2024_*`) et suit
les liens symboliques, ce qui lui permet de fonctionner directement avec la façon dont Kubernetes monte les volumes
`Secret`/`ConfigMap`.
:::

### Combinaison {#combined}

`keys` et `keys_folder` fusionnent en un seul registre ; `active` peut pointer par libellé
*ou* par nom de fichier :

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## Rotation (sans interruption de service) {#rotation-zero-downtime}

La clé active chiffre les **nouvelles** écritures ; toutes les autres clés du registre peuvent encore
**déchiffrer** les anciennes données. La rotation consiste donc à : ajouter une clé, basculer le pointeur,
rechiffrer en arrière-plan, puis retirer l'ancienne clé.

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

Aucun redémarrage du processus n'est nécessaire à aucune étape.

### Appliquer les changements sans redémarrage {#applying-changes-without-a-restart}

Semaphore relit le fichier de clés (ainsi que les fichiers de clés qu'il référence) et remplace les
clés en mémoire de manière atomique. Deux déclencheurs :

| Déclencheur | Comportement |
|---------|-----------|
| **Surveillance de fichier** | Interroge le fichier toutes les `encryption.keys_poll_interval` (par défaut `15s`). Définissez `"0"` pour désactiver. |
| **`SIGHUP`** | `kill -HUP <pid>` force un rechargement immédiat (Unix uniquement). |

:::caution Windows
Windows n'a pas de `SIGHUP`. Utilisez la **surveillance périodique** (le comportement par défaut) — elle fonctionne sur toutes les
plateformes — ou redémarrez le service.
:::

Un rechargement valide d'abord les nouvelles clés et, en cas d'erreur, laisse les clés en cours
d'utilisation intactes.

---

## Commandes CLI {#cli-commands}

### `vault check` {#vault-check}

Lecture seule. Indique, pour chaque identifiant de clé, combien de secrets stockés elle chiffre, afin que vous puissiez
voir ce qui se trouve sur la clé active et ce qui peut être supprimé en toute sécurité.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

Statuts : `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)` et `MISSING KEY` (une clé référencée est absente — code de sortie 1).

### `vault rekey` {#vault-rekey}

Rechiffre tous les secrets stockés (ainsi que la clé de signature JWT) avec la clé active.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## Rétrocompatibilité {#backward-compatibility}

La mise à niveau est sûre et ne nécessite **aucune migration de données** :

- Les installations existantes qui définissent **`access_key_encryption`** (ou la
  variable d'environnement `SEMAPHORE_ACCESS_KEY_ENCRYPTION`) continuent de fonctionner sans changement — cette clé
  simple devient la clé des secrets active.
- Les données écrites par une version plus ancienne de Semaphore (sans identifiant de clé) se déchiffrent toujours. À leur prochaine écriture,
  ou après `vault rekey`, elles sont réestampillées avec un identifiant de clé.
- **L'absence totale de chiffrement** (aucune clé configurée) continue de stocker les secrets en
  base64 simple et de les déchiffrer de la même manière.

Pour migrer une ancienne installation à clé unique vers un fichier de clés, il suffit d'inclure l'ancienne clé
dans le registre :

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

Les anciennes données se déchiffrent via `old` ; exécutez `vault rekey` pour tout déplacer vers `new`.

---

## Kubernetes et Docker {#kubernetes--docker}

Montez vos clés en tant que volume `Secret` et faites pointer `keys_folder` dessus :

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

Lorsque vous mettez à jour le `Secret`, Kubernetes actualise les fichiers montés et la
surveillance périodique applique le changement dans le délai `keys_poll_interval` — sans redémarrage du pod.

---

## Bonnes pratiques de sécurité {#security-best-practices}

:::danger Protégez le fichier de clés
- Restreignez les permissions : `chmod 0400`, détenu par l'utilisateur du service Semaphore.
- **Ne validez jamais de vraies clés** dans le contrôle de version — ajoutez le fichier au `.gitignore`.
- Sauvegardez-le de manière sécurisée. **Perdre toutes les clés signifie perdre toutes les données chiffrées.**
- Préférez les secrets montés (`file:` / `keys_folder`) à une `value:` en ligne, et les variables d'environnement
  à aucune des deux — `value:` conserve la clé dans le fichier de configuration.
:::

---

## Référence {#reference}

### `encryption` (configuration principale) {#encryption-main-config}

| Champ | Env | Par défaut | Description |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | Chemin vers le fichier de clés (YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | Fréquence d'interrogation du fichier de clés. `"0"` désactive l'interrogation. |

### Clés simples héritées (configuration principale) {#legacy-flat-keys-main-config}

| Champ | Env | Description |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | Clé des secrets unique, sans rotation. Utilisée lorsque `keys_file` n'est pas défini. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | Clé des options unique, sans rotation. Utilise la clé des secrets par défaut. |

### Fichier de clés {#keys-file}

| Champ | Description |
|-------|-------------|
| `keys` | Table `libellé → KeySource` (registre en ligne). |
| `keys_folder` | Répertoire de fichiers de clés (un fichier régulier par clé, libellé par le nom de fichier). |
| `active.secret_key` | Libellé (dans `keys`) de la clé des secrets active. |
| `active.option_key` | Libellé de la clé des options active. |
| `active.secret_key_file` | Nom de fichier dans `keys_folder` de la clé des secrets active (relatif). |
| `active.option_key_file` | Nom de fichier dans `keys_folder` de la clé des options active (relatif). |

### KeySource {#keysource}

| Champ | Description |
|-------|-------------|
| `value` | Matériel de clé en base64 en ligne. |
| `file` | Chemin vers un fichier contenant la clé en base64. |

`value` et `file` sont mutuellement exclusifs. Les clés doivent être le base64 de **16, 24 ou 32
octets** (AES‑128/192/256).

---

## Dépannage {#troubleshooting}

| Symptôme | Cause / correction |
|---------|-------------|
| Panique au démarrage : `encryption_keys… not found` / `invalid` | Le fichier de clés ou un fichier de clé référencé est manquant/malformé, ou une clé n'est pas un base64 valide de 16/24/32 octets. Corrigez le fichier ; le démarrage échoue rapidement à dessein. |
| `vault check` affiche `MISSING KEY <id>` (sortie 1) | Des données ont été chiffrées avec une clé qui n'est plus dans le registre. Rajoutez cette clé pour pouvoir les déchiffrer. |
| `cannot decrypt access key, perhaps encryption key was changed` | Une valeur héritée (sans préfixe) ne peut être déchiffrée par aucune clé configurée. Assurez-vous que la clé d'origine est présente (dans le registre ou dans `access_key_encryption`). |
| Rotation non appliquée | Vérifiez `keys_poll_interval` (différent de `"0"`) et que le fichier de clés a réellement changé ; ou envoyez `SIGHUP`. |
| `active.secret_key: no key labelled "…"` | Le pointeur actif désigne un libellé/nom de fichier absent de `keys`/`keys_folder`. |
