---
title: Éditions
description: Ce que contiennent Semaphore Community, Pro et Enterprise, et quelles fonctionnalités nécessitent un abonnement payant.
---

import EditionsTable from '@site/src/components/EditionsTable';

# Éditions

Semaphore est proposé en trois éditions issues d'une base de code unique et d'une
documentation unique. Tout ce qui est décrit dans cette documentation est disponible dans
**Community**, sauf si la page ou la section porte un badge d'édition.

| Édition | De quoi il s'agit |
|---|---|
| **Community** | L'édition open source. Gratuite, auto-hébergée, sans clé de licence. Tout ce qui n'est pas listé dans le tableau ci-dessous. |
| **Pro** | Ajoute les workflows, les runners de projet, les stockages de secrets externes, les exécuteurs de conteneurs et la journalisation structurée. |
| **Enterprise** | Ajoute la haute disponibilité, le RBAC étendu avec des rôles personnalisés, l'exécuteur Kubernetes et les stockages de secrets d'entreprise. |

Pro et Enterprise sont activés à l'aide d'une clé de licence, voir
[Licence](/admin-guide/license). L'édition exécutée par votre serveur est indiquée dans le
menu du compte, voir [Votre compte](/user-guide/account).

## Matrice des fonctionnalités {#feature-matrix}

Les fonctionnalités qui nécessitent une édition payante. Une fonctionnalité qui n'est pas
listée ici est disponible dans toutes les éditions.

<EditionsTable />

## Comment les éditions sont signalées dans cette documentation {#how-editions-are-marked}

Un badge à côté d'un titre signifie que la fonctionnalité décrite en dessous nécessite
cette édition :

- <Pro /> signale une fonctionnalité Pro.
- <Enterprise /> signale une fonctionnalité Enterprise.

Un badge peut également indiquer la version dans laquelle la fonctionnalité est apparue,
par exemple <FeatureState feature="extended-rbac" />. Cliquer sur un badge vous ramène à
cette page.
