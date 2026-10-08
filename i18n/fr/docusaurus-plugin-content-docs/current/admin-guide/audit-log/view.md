---
title: Consulter le journal d'audit
description: "Consultez le journal d'audit dans l'interface web : les événements les plus récents, tous les champs d'un événement et, avec Semaphore Pro, les filtres et l'export en CSV ou JSON Lines."
---

# Consulter le journal d'audit

Les administrateurs ouvrent **Audit log** depuis le menu utilisateur. Les événements les plus récents viennent en premier, 50 par page.

![Le journal d'audit, événements les plus récents en premier](/assets/audit-log-list.png)

Cliquez sur un événement pour voir tous ses champs. Le bouton de copie copie l'événement dans le format que
Semaphore envoie à un SIEM.

![Un événement avec tous ses champs](/assets/audit-log-card.png)

## Filtrer et exporter <FeatureState feature="audit-log-filters" /> {#filter-export}

Filtrez par période, utilisateur, type d'événement, résultat, projet ou adresse IP. Dans un événement,
l'utilisateur, l'adresse, l'objet et le projet sont des liens qui filtrent le journal selon eux.

![Le journal filtré par l'adresse d'un événement](/assets/audit-log-filters.png)

Quand une combinaison de filtres trouve peu d'événements, Semaphore cherche deux secondes à la fois et indique
jusqu'où il est remonté. Cliquez sur **Search older** pour continuer.

**Export** enregistre tous les événements qui correspondent aux filtres dans un fichier CSV ou JSON Lines. Chaque
export est enregistré comme un événement `audit.log/export`.

![Export en CSV ou JSON Lines](/assets/audit-log-export.png)
