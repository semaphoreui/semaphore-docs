---
title: Reverse-Proxy
description: Warum Sie Semaphore hinter einen Reverse-Proxy stellen sollten, was jede Konfiguration leisten muss und die Beispiele für nginx, Apache und Caddy.
---

# Reverse-Proxy

Ein Reverse-Proxy sitzt vor Semaphore und terminiert TLS, sodass Browser und
Runner über HTTPS mit ihm sprechen, während Semaphore selbst über unverschlüsseltes
HTTP auf der lokalen Schnittstelle lauscht. Semaphore bringt außerdem
[integriertes TLS](/admin-guide/security/network#tls) mit, ein Proxy ist also nicht
zwingend erforderlich. Verwenden Sie einen, wenn Sie ohnehin schon einen Proxy
betreiben, ein anderswo verwaltetes Zertifikat benötigen, Semaphore unter einem
Unterpfad ausliefern möchten oder mehrere Dienste über einen Host bereitstellen.

## Was jede Konfiguration leisten muss {#what-every-configuration-must-handle}

Welchen Proxy Sie auch wählen: Drei Dinge müssen stimmen, sonst funktionieren Teile
der Oberfläche auf schwer zu diagnostizierende Weise nicht mehr:

- **WebSocket-Upgrade auf `/api/ws`.** Task-Protokolle werden über einen WebSocket
  gestreamt. Ohne die Upgrade-Header bleibt das Protokollfenster leer, während der
  Task läuft.
- **Ein Lese-Timeout, das länger ist als das Ping-Intervall.** Semaphore sendet
  etwa alle zwei Minuten einen Ping über einen untätigen WebSocket. Ein Proxy, der
  untätige Verbindungen nach 60 Sekunden schließt, trennt die Protokollansicht
  immer wieder.
- **`web_host` auf die öffentliche URL gesetzt.** Aus diesem Wert bildet Semaphore
  Weiterleitungs-URLs, setzt das `Secure`-Flag des Cookies und prüft den Origin der
  Anfrage. Stimmt er nicht mit dem überein, was der Browser verwendet hat, schlägt
  die Anmeldung fehl. Siehe
  [Konfiguration](/admin-guide/configuration).

## In diesem Bereich {#in-this-section}

| Seite | Inhalt |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | Ein Server-Block mit TLS, dem WebSocket-Upgrade und weitergereichten Headern. |
| [Apache](/admin-guide/reverse-proxy/apache) | Ein virtueller Host mit `mod_proxy` und `mod_proxy_wstunnel`. |
| [Caddy](/admin-guide/reverse-proxy/caddy) | Eine minimale Caddyfile mit automatischen Zertifikaten. |

## Womit Sie beginnen {#where-to-start}

Wählen Sie den Proxy, den Sie bereits betreiben. Wenn Sie keine Vorliebe und keinen
vorhandenen Proxy haben, ist [Caddy](/admin-guide/reverse-proxy/caddy) der kürzeste
Weg: Caddy beschafft und erneuert Zertifikate selbstständig.

Zur Härtung über TLS hinaus siehe [Netzwerksicherheit](/admin-guide/security/network).
