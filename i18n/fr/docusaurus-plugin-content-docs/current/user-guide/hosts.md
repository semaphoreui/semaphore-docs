---
title: Hosts
description: Quels hôtes vos tâches Ansible atteignent, comment chacun s'est terminé, et où regarder quand un hôte échoue ou n'est jamais atteint.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

La page **Hosts** d'un projet liste chaque hôte atteint par les tâches Ansible du projet, avec le
résultat de la dernière exécution sur cet hôte. Ouvrez-la pour savoir quels hôtes échouent, lesquels
sont injoignables et lesquels n'ont été touchés par aucune tâche depuis un moment, sans ouvrir les
journaux des tâches un par un.

## Fonctionnement {#how-it-works}

Vous n'ajoutez pas les hôtes à la main. Après chaque tâche Ansible, Semaphore enregistre chaque hôte
du play avec son résultat sur cet hôte : `ok`, `changed`, `failed` ou `unreachable`. Les tâches sur
le serveur, sur les runners et dans les exécuteurs Docker ou Kubernetes comptent toutes. Les tâches
d'autres applications, comme Terraform ou Bash, n'ajoutent pas d'hôtes.

Un hôte est identifié par son nom dans l'inventaire. `web-01` dans deux inventaires est un seul hôte,
et `Web-01` est le même hôte que `web-01`. Un hôte atteint par les tâches de plusieurs projets est
listé dans chaque projet avec les chiffres propres à ce projet. Un hôte reste dans la liste après
avoir quitté votre inventaire, avec son historique.

## Trouver un hôte {#find-a-host}

- **Search** trouve les hôtes par nom.
- **Failing now** affiche les hôtes dont la dernière exécution a échoué. **Unreachable** affiche les
  hôtes auxquels Ansible n'a pas pu se connecter. **Not seen 30 days** affiche les hôtes qu'aucune
  tâche n'a touchés depuis un mois.
- **Template** restreint la liste aux hôtes d'un seul modèle.

Cliquez sur un hôte pour ouvrir sa fiche : quand il a été vu pour la première fois, combien
d'exécutions il a eues, combien des 10 dernières exécutions ont échoué, et les tâches qui l'ont
atteint avec le résultat sur cet hôte. Cliquez sur une tâche pour ouvrir son journal.

L'onglet **Summary** d'une tâche affiche la même chose pour une seule exécution : sélectionnez
**All servers** pour voir tous les hôtes de cette tâche avec leurs compteurs.

## Et ensuite {#whats-next}

- [Hosts pour les administrateurs](/admin-guide/hosts) — tous les projets, le décompte de la licence et la désactivation.
- [Inventaire](/user-guide/inventory) — définissez les hôtes sur lesquels vos tâches s'exécutent.
