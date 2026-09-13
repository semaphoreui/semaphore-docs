# Stats

La scheda **Stats** della dashboard del Project mostra come sono terminati nel tempo i Task del Project.

![Statistiche del Project](/assets/project-stats.webp)

Il grafico **Task Status** conta i Task per giorno in base al loro stato finale:

- **Success**: il Task è terminato senza errori.
- **Failed**: il Task è terminato con un errore.
- **Stopped**: il Task è stato interrotto da un utente.

Due filtri sopra il grafico restringono i dati:

| Filtro | Opzioni |
|---|---|
| **Period** | Ultima settimana, Ultimo mese, Ultimo anno |
| **User** | Tutti gli utenti, oppure un singolo membro del Project. I Task avviati dagli Schedule e dalle Integration non hanno un utente e sono inclusi solo in **All users**. |

Lo stesso grafico è disponibile per un singolo Task Template nella scheda **Details** della [pagina del Task Template](../task-templates#template-page).

Per vedere le singole esecuzioni invece dei dati aggregati, utilizzare la scheda [History](./history).
