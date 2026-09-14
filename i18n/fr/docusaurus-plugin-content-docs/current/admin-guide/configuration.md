---
title: Configuration
description: Semaphore lit ses paramètres dans un fichier de configuration et dans les variables d’environnement. Le configurateur en ligne permet de les préparer à l’aide d’un formulaire. Choisissez la méthode adaptée à votre serveur.
---

# Configuration

Semaphore lit ses paramètres dans un fichier de configuration et dans les variables d’environnement. Le configurateur en ligne permet de les préparer à l’aide d’un formulaire. Choisissez la méthode adaptée à votre serveur.

## Dans cette section {#in-this-section}

| Méthode | Quand l’utiliser |
|---|---|
| [Configurateur en ligne](/admin-guide/configuration/online) | Vous voulez un formulaire qui génère la configuration et les commandes de démarrage pour une installation binaire ou Docker. |
| [Fichier de configuration](/admin-guide/configuration/config-file) | Vous voulez conserver les paramètres du serveur dans un fichier `config.json`. |
| [Variables d'environnement](/admin-guide/configuration/env-vars) | Vous gérez les paramètres via Docker, une définition de service ou vos outils de déploiement. |

## Options de configuration {#configuration-options}

Une variable d’environnement remplace la valeur correspondante du fichier. La valeur par défaut s’applique si aucune des deux n’est définie. Si modifier le fichier ne change rien, vérifiez l’environnement du processus Semaphore.

La [référence des options de configuration](/reference/configuration) répertorie les noms, variables d’environnement, types et valeurs par défaut. Elle est générée à partir du code de Semaphore ; utilisez la documentation de votre version pour un serveur plus ancien.

<span id="frequently-asked-questions" />

## URL publique {#1-how-to-configure-a-public-url-for-semaphore-ui}

Définissez `web_host` (ou `SEMAPHORE_WEB_ROOT`) sur l’adresse ouverte par les utilisateurs dans leur navigateur. Si un proxy inverse expose Semaphore sur `https://example.com/semaphore`, utilisez l’adresse complète, avec `/semaphore`. Il s’agit de l’adresse publique, pas de l’adresse interne utilisée par le proxy.

## Par où commencer {#where-to-start}

Pour un nouveau serveur, ouvrez le guide du configurateur en ligne et suivez les étapes pour une installation binaire ou Docker. Pour un serveur existant, modifiez le fichier ou les variables d’environnement de son service, puis redémarrez Semaphore.
