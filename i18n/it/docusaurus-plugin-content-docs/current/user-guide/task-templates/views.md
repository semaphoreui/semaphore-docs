# Viste

Le viste raggruppano i Task Template in schede sopra l'elenco dei Task Template. Un Project parte con un'unica vista **All**; è possibile aggiungerne di proprie, ad esempio **Build**, **Deploy** e **Tools**, in modo che nei Project con molti Task Template gli utenti trovino rapidamente quello giusto.

![Elenco dei Task Template con le schede delle viste](/assets/templates-list.webp)

## Gestione delle viste {#managing-views}

Gli utenti con il ruolo **Manager** o superiore possono modificare le viste. Fare clic sull'icona a forma di matita accanto alle schede delle viste per aprire la finestra di dialogo **Edit views**, quindi utilizzare **Add view** per creare una nuova scheda. Ogni vista dispone delle impostazioni seguenti:

| Impostazione | Descrizione |
|---|---|
| **Title** | L'etichetta della scheda. |
| **Type** | **Custom** mostra solo i Task Template assegnati a questa vista. **All** mostra tutti i Task Template del Project. |
| **Sort by** e **Reverse** | Ordinamento predefinito dei Task Template nella scheda. |
| **Hidden** | Mantiene la vista ma nasconde la scheda. |
| **Show task counts** | Mostra sulla scheda quanti dei suoi Task Template si trovano in ciascuno stato, vedere [Conteggio dei Task Template sulle schede](#template-counts). Disattivato per impostazione predefinita. |

Trascinare le viste nella finestra di dialogo per cambiare l'ordine delle schede. L'eliminazione di una vista non elimina i suoi Task Template, che restano visibili nella vista **All**.

## Assegnazione di un Task Template a una vista {#assigning-a-template-to-a-view}

Aprire il modulo del Task Template e scegliere la scheda nel campo **View**. Un Task Template appartiene a una sola vista personalizzata per volta ed è sempre elencato nelle viste di tipo **All**.

## Conteggio dei Task Template sulle schede {#template-counts}

Una vista con **Show task counts** attivo mostra accanto al titolo quanti dei suoi Task Template si trovano in ciascuno stato, in un chip composto da segmenti colorati. Lo stato di un Task Template è lo stato del suo ultimo Task. Un segmento viene nascosto quando il suo conteggio è zero, e i conteggi seguono i Task durante l'esecuzione. L'impostazione è disattivata per una nuova vista, e i conteggi vengono calcolati solo per le viste in cui è attiva.

| Colore | Task Template contati |
|---|---|
| Verde | L'ultimo Task è riuscito. |
| Rosso | L'ultimo Task è fallito. |
| Grigio | L'ultimo Task è stato arrestato o è in fase di arresto, oppure il Task Template non è mai stato avviato. |
| Arancione | L'ultimo Task attende una conferma. |
| Blu | L'ultimo Task è in coda, in avvio o in esecuzione. |

I conteggi includono solo i Task Template che l'utente è autorizzato a vedere.

## Colonne {#columns}

L'icona a forma di ingranaggio nell'angolo in alto a destra dell'elenco dei Task Template apre il selettore delle colonne. Si applica a tutte le viste ed è memorizzato nel browser.

![Selettore delle colonne](/assets/templates-columns.webp)
