---
title: Stockage de secrets CyberArk
description: Option Enterprise pour lire et stocker les secrets du Key Store dans CyberArk Privileged Access Manager via l'API REST PVWA.
sidebar_custom_props:
  edition: pro
---

# Stockage de secrets CyberArk <Enterprise />

Semaphore UI Enterprise peut utiliser **CyberArk Privileged Access Manager** (PAM Self-Hosted ou Privilege Cloud) comme stockage externe pour les secrets du Key Store à la place de la base de données. Semaphore communique avec l'API REST Password Vault Web Access (PVWA) : chaque clé Semaphore correspond à un **compte** CyberArk au sein d'un **Safe**.

## Options de configuration {#configuration-options}

Lorsque vous créez un stockage **CyberArk** sous **Key Store → Storages**, configurez :

| Champ | Description |
|-------|-------------|
| **URL du serveur** | Adresse de base de PVWA, par exemple `https://pvwa.example.com`. Un `/PasswordVault` final est accepté. Requis. |
| **Ignorer la vérification du certificat TLS** | Désactive la validation du certificat. Uniquement pour les environnements de test. |
| **Méthode d'authentification** | Méthode de connexion PVWA pour l'utilisateur Semaphore : `CyberArk` (par défaut), `LDAP`, `RADIUS` ou `Windows`. |
| **Nom d'utilisateur** | L'utilisateur PVWA avec lequel Semaphore se connecte. Requis. |
| **Mot de passe** | Mot de passe de cet utilisateur. Peut être stocké dans la base de données, lu depuis une variable d'environnement ou chargé depuis un fichier. |
| **Safe par défaut** | Safe utilisé lorsqu'une clé référence un compte sans préfixe de Safe, ainsi que chemin de synchronisation par défaut. |
| **ID de plateforme pour nouveaux comptes** | Plateforme assignée aux comptes créés par Semaphore (par exemple `UnixSSH`). Requis uniquement lorsque le stockage n'est pas en lecture seule et que vous créez des clés depuis Semaphore. |
| **Adresse pour nouveaux comptes** | Propriété d'adresse facultative pour les comptes créés par Semaphore. Certaines plateformes l'exigent. |

Le stockage peut fonctionner en mode lecture seule. Dans ce mode, Semaphore lit et synchronise uniquement les comptes et ne crée, modifie ni ne supprime jamais rien dans le coffre.

### Autorisations PVWA requises {#required-pvwa-permissions}

Accordez à l'utilisateur Semaphore les autorisations suivantes sur chaque Safe utilisé :

| Opération | Autorisations Safe |
|-----------|--------------------|
| Lire une clé, synchronisation | **Lister les comptes**, **Récupérer les comptes** |
| Créer une clé depuis Semaphore | **Ajouter des comptes** |
| Mettre à jour une clé depuis Semaphore | **Mettre à jour la valeur du mot de passe**, **Mettre à jour les propriétés du compte** |
| Supprimer une clé depuis Semaphore | **Supprimer des comptes** |

Semaphore demande systématiquement une session PVWA concurrente (`concurrentSession`), de sorte que plusieurs nœuds Semaphore ou une tâche en cours et une synchronisation planifiée peuvent partager le même utilisateur sans se déconnecter mutuellement. Cela nécessite PVWA 11.3 ou ultérieur.

:::warning
N'activez pas « raison obligatoire » ni l'intégration de système de tickets pour les Safes utilisés par Semaphore. Semaphore envoie une raison fixe mais ne peut pas fournir de numéro de ticket.
:::

## Utilisation {#how-to-use}

1. Dans votre projet, ouvrez **Key Store → Storages** et créez un stockage **CyberArk**.
2. Lors de la création ou modification d'une clé, sélectionnez ce stockage et saisissez le compte sous la forme `Safe/AccountName`. Le nom du compte est le nom d'objet affiché dans PVWA. Si le stockage possède un Safe par défaut, `AccountName` seul suffit.
3. Configurez facultativement des [chemins de synchronisation](/user-guide/key-store/secret-sync) pour importer des Safes entiers automatiquement selon un calendrier.

### Correspondance des types de clés {#key-type-mapping}

| Type de clé Semaphore | Compte CyberArk |
|-----------------------|-----------------|
| **Connexion avec mot de passe** | Compte de mot de passe : `userName` devient l'identifiant, le secret du compte devient le mot de passe. |
| **SSH** | Compte de clé (`secretType: key`) : `userName` devient l'identifiant, le secret du compte est la clé privée. Les clés SSH avec phrase secrète ne peuvent pas être stockées dans CyberArk. |
| **Secret / chaîne** | Compte de mot de passe sans nom d'utilisateur. Le secret du compte est utilisé tel quel. |

Lorsque Semaphore crée un compte, la gestion automatique par le Central Policy Manager (CPM) est désactivée afin que CyberArk ne permute pas un secret venant d'être écrit par Semaphore. Si vous souhaitez que CyberArk effectue la rotation de l'identifiant, gérez le compte depuis PVWA et marquez le stockage en lecture seule dans Semaphore.

## Synchronisation des secrets {#syncing-secrets}

Un chemin de synchronisation est le nom d'un Safe. Semaphore importe chaque compte du Safe sous la forme d'une clé nommée d'après le compte (avec le préfixe facultatif). Le type de clé est détecté à partir du compte : les comptes de clé deviennent des clés SSH, les comptes de mot de passe avec nom d'utilisateur deviennent des clés Connexion avec mot de passe et les comptes sans nom d'utilisateur deviennent des secrets simples. Voir [Synchronisation des secrets depuis des stockages distants](/user-guide/key-store/secret-sync).
