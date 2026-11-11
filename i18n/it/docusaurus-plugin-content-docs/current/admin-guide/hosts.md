---
title: Hosts
description: La vista amministratore degli host di tutti i Project, il conteggio Nodes della licenza e come dismettere un host che non si gestisce più.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

La pagina **Hosts** dell'amministratore elenca in un unico posto gli host di tutti i Project e mostra
quali contano per i **Nodes** della licenza. Aprire il menu Admin in basso a sinistra e selezionare
**Hosts**.

Il modo in cui gli host entrano nell'elenco, gli stati, la ricerca e la scheda dell'host sono gli
stessi della pagina del Project. Per ulteriori informazioni, vedere [Hosts](/user-guide/hosts). Qui un
host è una sola riga per tutti i Project, e la sua scheda elenca i Project e i Task che lo hanno
raggiunto.

## Conteggio della licenza {#license-count}

La licenza include un certo numero di host. La riga **Nodes** di **Abbonamento e fatturazione**
mostra quanti sono in uso, ad esempio `42 / 50`. Un host è in uso quando un Task Ansible lo ha
raggiunto nell'ultimo mese e nessuno lo ha dismesso. Un host che è stato solo irraggiungibile non è
in uso.

Gli host non in uso mostrano **Not counted** nell'elenco. Rientrano nel conteggio da soli la
prossima volta che un Task li raggiunge.

Quando sono in uso più host di quanti ne includa la licenza, la riga **Nodes** diventa rossa con
**(limit exceeded)** e questa pagina mostra un avviso. Dismettere gli host che non si gestiscono più
oppure estendere la licenza. Per ulteriori informazioni, vedere [Attivazione della licenza](/admin-guide/license).

## Dismettere un host {#decommission}

Quando un host è stato rimosso dall'infrastruttura, fare clic su **Decommission** alla fine della sua
riga e confermare. L'host esce subito dal conteggio, mostra **Decommissioned** e conserva la sua
cronologia in ogni Project. Se in seguito un Task lo raggiunge di nuovo, Semaphore rimuove il
contrassegno e l'host è di nuovo in uso.

## Passi successivi {#whats-next}

- [Hosts](/user-guide/hosts) — la pagina del Project, gli stati e la scheda dell'host.
- [Attivazione della licenza](/admin-guide/license) — attivare e sostituire la chiave di licenza.
