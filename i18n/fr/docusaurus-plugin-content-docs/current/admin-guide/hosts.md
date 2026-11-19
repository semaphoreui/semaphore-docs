---
title: Hosts
description: La vue administrateur des hôtes de tous les projets, le décompte Nodes de la licence, et comment désactiver un hôte que vous ne gérez plus.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

La page **Hosts** de l'administrateur liste en un seul endroit les hôtes de tous les projets et
indique lesquels comptent dans les **Nodes** de votre licence. Ouvrez le menu Admin en bas à gauche
et sélectionnez **Hosts**.

La manière dont les hôtes arrivent dans la liste, les statuts, la recherche et la fiche d'hôte sont
les mêmes que sur la page du projet. Pour plus d'informations, voir [Hosts](/user-guide/hosts). Ici,
un hôte occupe une seule ligne pour tous les projets, et sa fiche liste les projets et les tâches qui
l'ont atteint.

## Décompte de la licence {#license-count}

Votre licence inclut un certain nombre d'hôtes. La ligne **Nodes** de **Abonnement et facturation**
indique combien sont utilisés, par exemple `42 / 50`. Un hôte est utilisé lorsqu'une tâche Ansible
l'a atteint au cours du dernier mois et que personne ne l'a désactivé. Un hôte qui n'a toujours été
qu'injoignable n'est pas utilisé.

Les hôtes non utilisés affichent **Not counted** dans la liste. Ils reviennent d'eux-mêmes dans le
décompte la prochaine fois qu'une tâche les atteint.

Lorsque plus d'hôtes sont utilisés que la licence n'en inclut, la ligne **Nodes** devient rouge avec
**(limit exceeded)** et cette page affiche un avertissement. Désactivez les hôtes que vous ne gérez
plus, ou étendez votre licence. Pour plus d'informations, voir [Activation de la licence](/admin-guide/license).

## Désactiver un hôte {#decommission}

Lorsque vous avez retiré un hôte de votre infrastructure, cliquez sur **Decommission** à la fin de sa
ligne et confirmez. L'hôte quitte le décompte immédiatement, affiche **Decommissioned** et conserve
son historique dans chaque projet. Si une tâche l'atteint de nouveau plus tard, Semaphore retire la
marque et l'hôte est de nouveau utilisé.

## Et ensuite {#whats-next}

- [Hosts](/user-guide/hosts) — la page du projet, les statuts et la fiche d'hôte.
- [Activation de la licence](/admin-guide/license) — activer et remplacer la clé de licence.
