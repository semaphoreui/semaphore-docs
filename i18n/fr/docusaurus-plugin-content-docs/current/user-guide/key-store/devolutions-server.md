---
title: "Stockage de secrets Devolutions Server"
---

# Stockage de secrets Devolutions Server <Enterprise />

Semaphore UI prend en charge Devolutions Server comme stockage pour les secrets. 

![](/assets/dvls1.webp)

Vous pouvez renseigner les options suivantes :
- **URL du Devolutions Server** — adresse de votre serveur Devolutions.
- **ID du vault** — identifiant du vault dans lequel les secrets sont stockés.
- **Clé d'application** — clé d'application utilisée pour l'authentification.
- **Token** — token d'authentification. Le token peut être :
    - Stocké dans la base de données.
    - Fourni via une variable d'environnement.
    - Fourni via un fichier.

Le stockage peut fonctionner en mode lecture seule.
