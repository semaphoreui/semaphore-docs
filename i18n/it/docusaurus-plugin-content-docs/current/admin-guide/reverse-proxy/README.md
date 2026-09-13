---
title: Reverse proxy
description: Perché mettere Semaphore dietro un reverse proxy, che cosa deve gestire ogni configurazione e gli esempi per nginx, Apache e Caddy.
---

# Reverse proxy

Un reverse proxy si colloca davanti a Semaphore e termina TLS, così browser e runner
comunicano con esso via HTTPS mentre Semaphore stesso resta in ascolto in HTTP
semplice sull'interfaccia locale. Semaphore dispone anche del
[supporto TLS integrato](/admin-guide/security/network#tls), quindi un proxy non è
strettamente necessario. Conviene usarlo quando si gestisce già un proxy, quando
serve un certificato gestito altrove, quando si vuole Semaphore su un sotto-percorso
oppure quando si servono più servizi da un unico host.

## Che cosa deve gestire ogni configurazione {#what-every-configuration-must-handle}

Qualunque proxy si scelga, tre aspetti devono essere corretti, altrimenti alcune
parti dell'interfaccia smettono di funzionare in modi difficili da diagnosticare:

- **L'upgrade a WebSocket su `/api/ws`.** I log dei Task vengono trasmessi tramite
  un WebSocket. Senza le intestazioni di upgrade la finestra dei log resta vuota
  mentre il Task è in esecuzione.
- **Un timeout di lettura più lungo dell'intervallo di ping.** Semaphore invia un
  ping su un WebSocket inattivo all'incirca ogni due minuti. Un proxy che chiude le
  connessioni inattive dopo 60 secondi disconnette ripetutamente la vista dei log.
- **`web_host` impostato sull'URL pubblico.** Semaphore costruisce gli URL di
  redirect, imposta il flag `Secure` del cookie e verifica l'origine della richiesta
  a partire da questo valore. Se non corrisponde a quello usato dal browser,
  l'accesso non riesce. Vedere
  [Configurazione](/admin-guide/configuration).

## In questa sezione {#in-this-section}

| Pagina | Contenuto |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | Un blocco server con TLS, l'upgrade a WebSocket e le intestazioni inoltrate. |
| [Apache](/admin-guide/reverse-proxy/apache) | Un virtual host che utilizza `mod_proxy` e `mod_proxy_wstunnel`. |
| [Caddy](/admin-guide/reverse-proxy/caddy) | Un Caddyfile minimale con certificati automatici. |

## Da dove iniziare {#where-to-start}

Scegliere il proxy che si gestisce già. Se non si ha alcuna preferenza né un proxy
esistente, [Caddy](/admin-guide/reverse-proxy/caddy) è la strada più breve: ottiene e
rinnova i certificati da solo.

Per un hardening che vada oltre TLS, vedere
[Sicurezza di rete](/admin-guide/security/network).
