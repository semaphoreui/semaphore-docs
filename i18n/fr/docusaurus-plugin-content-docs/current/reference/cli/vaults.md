# Vaults

La commande `semaphore vault` gère le chiffrement des secrets que Semaphore stocke dans la base
de données — les **secrets des clés d'accès** (clés SSH, couples login/mot de passe, chaînes
secrètes) et la **clé de signature JWT**.

```bash
semaphore vault --help
```

> `vault` est un alias de `vaults`.

Elle possède deux sous-commandes :

| Commande | Rôle |
|----------|------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | Rechiffrer tous les secrets stockés avec la clé de chiffrement active. |
| [`vault check`](#checking-key-usage-vault-check) | Indiquer quel identifiant de clé chiffre chaque secret stocké (lecture seule). |

Pour la configuration et la rotation des clés de chiffrement, consultez
[Clés de chiffrement](/admin-guide/security/encryption).

## Rechiffrer les secrets (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

Rechiffre tous les secrets stockés localement — les secrets des clés d'accès et la clé de
signature JWT — avec la clé de chiffrement **active**, en inscrivant l'identifiant de cette clé
dans chaque valeur. Les secrets adossés à un stockage de secrets externe sont ignorés (ils ne
sont pas chiffrés avec le trousseau de clés de Semaphore).

```bash
semaphore vault rekey
```

### Rotation des clés sans interruption {#zero-downtime-key-rotation}

La clé active chiffre les nouvelles écritures ; toutes les autres clés du jeu de clés peuvent
encore déchiffrer les anciennes données. La rotation consiste donc à : ajouter une clé,
basculer le pointeur actif, rechiffrer en arrière-plan, puis supprimer l'ancienne clé.

1. Ajoutez une nouvelle clé au jeu de clés (un fichier dans `keys_folder`, ou une entrée
   `keys:`) et faites pointer le pointeur actif (`active.secret_key`, ou `secret_key_file`)
   vers elle. Le changement est appliqué dans le délai de `keys_poll_interval` (par défaut
   `15s`), ou immédiatement avec `kill -HUP <pid>` — aucun redémarrage n'est nécessaire.
2. Exécutez `semaphore vault rekey` pour rechiffrer les données existantes avec la nouvelle clé.
3. Exécutez [`semaphore vault check`](#checking-key-usage-vault-check) ; une fois que
   l'ancienne clé affiche `0 rows`, elle peut être retirée du jeu de clés en toute sécurité.

### Options {#options}

| Option | Description |
|--------|-------------|
| `--old-key <key>` | Ancienne clé de chiffrement explicite pour une migration héritée à clé unique. Inutile lorsque l'ancienne clé fait déjà partie du jeu de clés en tant que clé secondaire. Sert à déchiffrer les données héritées sans préfixe, qui n'ont pas d'identifiant de clé inscrit. |
| `--backup <file>` | Écrit une sauvegarde des textes chiffrés actuels des clés d'accès dans `<file>` avant de rechiffrer. |
| `--rollback <file>` | Restaure les textes chiffrés des clés d'accès à partir d'un fichier de sauvegarde au lieu de rechiffrer. |

### Sauvegarde et restauration {#backup-and-rollback}

Prenez un instantané des textes chiffrés actuels avant de rechiffrer, et restaurez-le en cas
de problème :

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

La sauvegarde est un fichier JSON Lines, avec une entrée par clé d'accès (`project_id`,
`key_id`, `secret`). Une restauration réécrit ces textes chiffrés tels quels.

### Migration héritée à clé unique {#legacy-single-key-migration}

Si vos données ont été chiffrées par une version plus ancienne de Semaphore qui utilisait la
clé unique `access_key_encryption` (sans rotation, sans identifiant de clé inscrit), passez
cette clé explicitement afin qu'elles puissent être déchiffrées avant d'être rechiffrées avec
la clé active :

```bash
semaphore vault rekey --old-key <base64-old-key>
```

Cela devient inutile une fois que l'ancienne clé fait partie du jeu de clés — Semaphore
recherche chaque valeur par son identifiant inscrit et la déchiffre automatiquement avec la clé
correspondante.

## Vérifier l'utilisation des clés (`vault check`) {#checking-key-usage-vault-check}

Lecture seule. Indique, pour chaque identifiant de clé, combien de secrets de clés d'accès
stockés localement (et la clé de signature JWT) cette clé chiffre, ainsi que l'état de la clé
de signature JWT. Exécutez-la après `vault rekey` pour confirmer qu'une clé retirée peut être
supprimée en toute sécurité : une clé sans aucune référence peut être supprimée du jeu de clés.

```bash
semaphore vault check
```

Exemple de sortie :

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

Chaque identifiant de clé est signalé avec l'un des statuts suivants :

| Statut | Signification |
|--------|---------------|
| `active` | La clé chiffre actuellement les nouvelles écritures. |
| `retired, rekey pending` | La clé chiffre encore certaines lignes ; exécutez `vault rekey` pour les faire passer sur la clé active. |
| `retired, SAFE TO REMOVE` | Aucune ligne ne référence la clé (`0 rows`) — elle peut être retirée du jeu de clés. |
| `legacy (no id)` | Lignes chiffrées avant l'existence des identifiants de clé ; rechiffrez pour inscrire un identifiant. |
| `MISSING KEY (cannot decrypt)` | Un identifiant de clé référencé est absent du jeu de clés. |

La dernière ligne indique quelle clé chiffre la clé de signature JWT, ou
`JWT signing key: not set` si aucune n'a encore été générée.

Si un secret référence un identifiant de clé absent du jeu de clés, la commande signale ces
lignes et **se termine avec un statut différent de zéro** — réintégrez la clé manquante dans le
jeu de clés pour que ces données puissent être déchiffrées.
