---
title: Reverse proxy
description: Pourquoi placer Semaphore derrière un reverse proxy, ce que toute configuration doit gérer, et les exemples nginx, Apache et Caddy.
---

# Reverse proxy

Un reverse proxy se place devant Semaphore et termine TLS : les navigateurs et les
runners lui parlent en HTTPS tandis que Semaphore lui-même écoute en HTTP simple sur
l'interface locale. Semaphore dispose aussi d'une
[prise en charge TLS intégrée](/admin-guide/security/network#tls), un proxy n'est
donc pas strictement nécessaire. Utilisez-en un si vous exploitez déjà un proxy, si
vous avez besoin d'un certificat géré ailleurs, si vous voulez servir Semaphore sur
un sous-chemin ou si vous servez plusieurs services depuis un même hôte.

## Ce que toute configuration doit gérer {#what-every-configuration-must-handle}

Quel que soit le proxy choisi, trois éléments doivent être corrects, sans quoi des
parties de l'interface cessent de fonctionner d'une manière difficile à
diagnostiquer :

- **La montée en WebSocket sur `/api/ws`.** Les journaux de tâche sont diffusés via
  un WebSocket. Sans les en-têtes de montée en version, la fenêtre des journaux reste
  vide pendant l'exécution de la tâche.
- **Un délai de lecture plus long que l'intervalle de ping.** Semaphore envoie un
  ping sur un WebSocket inactif environ toutes les deux minutes. Un proxy qui ferme
  les connexions inactives au bout de 60 secondes déconnecte la vue des journaux à
  répétition.
- **`web_host` défini sur l'URL publique.** Semaphore construit les URL de
  redirection, positionne l'attribut `Secure` du cookie et vérifie l'origine de la
  requête à partir de cette valeur. Si elle ne correspond pas à ce que le navigateur
  a utilisé, la connexion échoue. Voir
  [Configuration](/admin-guide/configuration).

## Dans cette section {#in-this-section}

| Page | Contenu |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | Un bloc server avec TLS, la montée en WebSocket et les en-têtes transférés. |
| [Apache](/admin-guide/reverse-proxy/apache) | Un hôte virtuel utilisant `mod_proxy` et `mod_proxy_wstunnel`. |
| [Caddy](/admin-guide/reverse-proxy/caddy) | Un Caddyfile minimal avec certificats automatiques. |

## Par où commencer {#where-to-start}

Choisissez le proxy que vous exploitez déjà. Si vous n'avez ni préférence ni proxy
existant, [Caddy](/admin-guide/reverse-proxy/caddy) est le chemin le plus court : il
obtient et renouvelle les certificats tout seul.

Pour un durcissement au-delà de TLS, voir
[Sécurité réseau](/admin-guide/security/network).
