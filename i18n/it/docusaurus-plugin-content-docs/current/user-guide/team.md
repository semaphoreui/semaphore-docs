# Team

In Semaphore UI ogni Project è associato a un **Team**. Solo i membri del Team e gli amministratori possono accedere al Project. A ciascun membro del Team viene assegnato uno dei quattro ruoli integrati, che determinano il livello di accesso e le azioni che può eseguire.

Nell'edizione **Enterprise** i ruoli integrati possono essere estesi con [ruoli personalizzati](#extended-rbac-enterprise) che concedono permessi aggiuntivi e granulari su Task Template specifici.

:::tip
Per evitare di perdere l'accesso a un Project, è consigliabile avere almeno due membri del Team con il ruolo <b>Owner</b>.
:::

La sezione **Team** di un Project dispone di due schede: **Members**, con gli utenti e i loro ruoli, e **Roles**, con i ruoli personalizzati (Enterprise).

![Membri del Team](/assets/team-members.webp)

## Ruoli integrati {#built-in-roles}

Ogni membro del Team ha esattamente uno di questi quattro ruoli:

- **Owner**
- **Manager**
- **Task Runner**
- **Guest**

Di seguito sono riportate le descrizioni dettagliate di ciascun ruolo e dei relativi permessi.

### Owner {#owner}

- **Permessi completi**<br />
  Gli Owner possono fare qualsiasi cosa all'interno del Project, inclusa la gestione dei ruoli, l'aggiunta e la rimozione di membri e la configurazione di qualsiasi impostazione del Project.

- **Più Owner**<br />
  Un Project può avere più Owner, garantendo così la presenza di più di una persona con privilegi completi.

- **Limitazioni all'auto-rimozione**<br />
  Un Owner non può rimuovere se stesso se è l'unico Owner del Project. Questo impedisce che il Project rimanga senza Owner.

- **Gestione degli altri Owner**<br />
  Gli Owner possono gestire (anche rimuovere o modificare i ruoli di) tutti i membri del Team, inclusi gli altri Owner.

### Manager {#manager}

- **Controllo esteso sul Project:** i Manager hanno quasi gli stessi permessi degli Owner, il che consente loro di occuparsi della maggior parte delle attività quotidiane e di gestire l'ambiente del Project.

- I Manager **non possono**:
  - Rimuovere il Project.
  - Rimuovere o modificare i ruoli degli Owner.

- **Caso d'uso tipico:** assegnare il ruolo Manager ai membri senior del Team che necessitano di un accesso ampio ma non dell'autorità per eliminare il Project o gestire gli Owner.

### Task Runner {#task-runner}

- **Esecuzione dei Task:** i Task Runner possono eseguire qualsiasi Task Template presente nel Project.

- **Sola lettura per le altre risorse:** pur potendo eseguire i Task, hanno accesso in sola lettura alle altre risorse, come Inventory, variabili, Repository, ecc.

- **Caso d'uso tipico:** sviluppatori o ingegneri QA che devono avviare e monitorare i Task ma non hanno bisogno di modificare le impostazioni del Project o di gestire i membri del Team.

### Guest {#guest}

- **Accesso in sola lettura:** i Guest hanno accesso in sola lettura a tutte le risorse del Project (ad esempio visualizzazione dei log, degli Inventory, delle dashboard).

- **Nessun permesso di scrittura:** non possono modificare le impostazioni, eseguire Task o cambiare i ruoli.

- **Caso d'uso tipico:** stakeholder o altri collaboratori che devono solo visualizzare lo stato e i dettagli del Project senza apportare modifiche.

---

## RBAC estesa <Enterprise /> {#extended-rbac-enterprise}

:::info
La RBAC estesa è disponibile nell'edizione **Semaphore Enterprise**, a partire da [Semaphore v2.17](https://semaphoreui.com/releases/semaphore-v2_17).
:::

La RBAC estesa aggiunge permessi supplementari ai quattro ruoli integrati. I ruoli integrati stessi rimangono invariati. Se non si definiscono ruoli personalizzati, ogni Project si comporta esattamente come nell'edizione community.

Con la RBAC estesa i ruoli personalizzati possono concedere singoli permessi a livello di Project. È inoltre possibile concedere a un ruolo permessi su Task Template selezionati. Questo consente di dare a un membro del Team l'accesso ai Task Template di cui ha bisogno senza promuoverlo a un ruolo integrato superiore.

### Ruoli personalizzati {#custom-roles}

Un ruolo personalizzato è un insieme di permessi con un nome, che integra il ruolo integrato di un membro nel Project. Ogni membro del Team mantiene il proprio ruolo integrato. I ruoli personalizzati aggiungono permessi ad esso.

I ruoli personalizzati sono disponibili su due livelli:

- **I ruoli globali** sono definiti a livello di istanza e possono essere utilizzati in qualsiasi Project.
- **I ruoli di Project** sono definiti all'interno di un singolo Project e sono disponibili solo in quel Project.

### Livelli dei permessi {#permission-levels}

I ruoli personalizzati concedono permessi a due livelli:

- **I permessi a livello di Project** estendono l'accesso di un utente a tutto il Project. Si scelgono al momento della creazione del ruolo.
- **I permessi a livello di Task Template** controllano le azioni su un singolo Task Template. Si scelgono nella scheda **Permissions** di quel Task Template dopo aver aggiunto il ruolo al Task Template.

### Creazione di un ruolo personalizzato {#create-a-custom-role}

Scegliere il livello prima di aprire il modulo del ruolo.

#### Ruolo globale {#global-role}

I ruoli globali vengono creati una sola volta e possono essere assegnati agli utenti in qualsiasi Project. Solo un amministratore dell'istanza può creare un ruolo globale.

Aprire il menu di amministrazione in basso a sinistra e selezionare **Roles**.

Nell'elenco dei ruoli a livello di istanza, selezionare **New Role**.

![Aprire Roles dal menu dell'amministratore, quindi selezionare New Role](/assets/custom-roles-navigation-to-new-role-annotated-v4.png)

#### Ruolo di Project {#project-role}

I ruoli di Project sono disponibili solo nel Project in cui vengono creati. Possono crearli gli Owner e i Manager del Project.

1. Aprire il Project e andare in **Team** > **Roles**.
2. Selezionare **New Role**.

La scheda **Roles** è vuota fino alla creazione del primo ruolo di Project. Elenca tutti i ruoli del Project e contiene il pulsante **New Role**.

![](https://www.semaphoreui.com/uploads/v2.17/roles1.webp)

### Configurazione di un ruolo personalizzato {#configure-a-custom-role}

Entrambi i percorsi aprono lo stesso modulo del ruolo. Configurare il ruolo in base all'accesso necessario al membro del Team.

![Finestra di dialogo New Role con i campi e le caselle di controllo dei permessi](/assets/custom-roles-global-role-form.jpg)

| Campo | Descrizione |
| --- | --- |
| **Name** | Un'etichetta leggibile per il ruolo. |
| **Slug** | Un identificatore tecnico univoco utilizzato per fare riferimento al ruolo. Utilizzare lettere minuscole, numeri, underscore o trattini, ad esempio `release_operator`. |
| **Permissions** | I permessi a livello di Project concessi dal ruolo. |

#### Permessi a livello di Project {#project-wide-permissions}

Scegliere solo i permessi a livello di Project necessari al ruolo:

| Permesso | Descrizione |
| --- | --- |
| **Can run project tasks** | Eseguire i Task del Project. |
| **Can update project** | Modificare le informazioni di base del Project in **Dashboard** > **Settings**. |
| **Can manage project resources** | Gestire le risorse del Project, come Task Template, Repository, Inventory, ambienti, voci del Key Store, Schedule, Integration e Runner. Si tratta di un accesso a livello di Project. Non può essere limitato a singole risorse diverse dai Task Template. |
| **Can manage project users** | Gestire i membri del Project e l'assegnazione dei ruoli. |

I permessi a livello di Project non possono essere limitati a un singolo Inventory, Repository, ambiente o voce del Key Store. I Task Template sono l'unico tipo di risorsa che supporta assegnazioni granulari dei ruoli.

:::tip Accesso ai soli Task Template
Per creare un ruolo granulare che aggiunga l'accesso solo a determinati Task Template, lasciare deselezionati tutti i permessi a livello di Project. In questo modo il ruolo non aggiunge permessi propri a livello di Project. Aggiungerlo ai Task Template richiesti e scegliere solo le azioni necessarie a quel ruolo.
:::

Selezionare **Save** quando la configurazione del ruolo è pronta.

### Configurazione dell'accesso a Task Template specifici {#configure-access-to-specific-task-templates}

I permessi a livello di Task Template aggiungono l'accesso a Task Template selezionati. L'esempio seguente utilizza un ruolo personalizzato senza permessi a livello di Project. Questa configurazione con privilegi minimi è utile quando un membro del Team necessita solo di alcune azioni su determinati Task Template. È inoltre possibile aggiungere permessi a livello di Task Template a un ruolo che concede già accesso a livello di Project.

**Aprire il Task Template richiesto**

1. Aprire **Task Templates** e selezionare il Task Template desiderato.
2. Aprire la scheda **Permissions**.

La scheda **Permissions** elenca i ruoli già aggiunti al Task Template.

![](https://www.semaphoreui.com/uploads/v2.17/roles2.webp)

**Aggiungere il ruolo e concedere i permessi sul Task Template**

1. Selezionare **Add Role** e scegliere il ruolo personalizzato da aggiungere a questo Task Template.
2. Selezionare solo i permessi sul Task Template necessari al ruolo, come **Can run tasks** o **Can update the template**.

Questo esempio utilizza un ruolo creato in precedenza senza permessi a livello di Project. È possibile scegliere qualsiasi ruolo personalizzato disponibile nel Project.

![Finestra di dialogo dei permessi del Task Template con i controlli necessari evidenziati](/assets/custom-roles-template-permissions-annotated.png)

Per concedere allo stesso ruolo l'accesso ad altri Task Template, ripetere questi passaggi per ciascun Task Template.

:::note Accesso al Project già esistente
I permessi a livello di Task Template sono additivi. Aggiungono accesso senza sostituire o ridurre quello derivante dal ruolo integrato dell'utente o da altri ruoli personalizzati. Se un utente può già eseguire o modificare tutti i Task Template, l'aggiunta di un ruolo specifico per un Task Template non restringe tale accesso.
:::

### Assegnazione di un ruolo personalizzato in un Project {#assign-a-custom-role-in-a-project}

Dopo aver creato e configurato un ruolo globale o di Project, assegnarlo al membro del Team desiderato:

1. Aprire il Project e andare in **Team**.
2. Espandere **Roles** accanto all'utente desiderato.
3. Selezionare il ruolo personalizzato.

### Attualmente non supportato {#not-currently-supported}

- **Mappatura dei gruppi LDAP / OIDC.** I ruoli personalizzati vengono assegnati per singolo utente. La mappatura dei gruppi di directory esterne sui ruoli personalizzati non è supportata.
- **Permessi granulari per le risorse diverse dai Task Template.** Attualmente solo i Task Template possono essere governati dai ruoli personalizzati a livello di singola risorsa.

---

## Gestione dei membri del Team {#managing-team-members}

- **Invito di nuovi membri:** gli **Owner** e i **Manager** possono invitare nuovi utenti a entrare nel Team e assegnare loro un ruolo iniziale.

- **Modifica dei ruoli:** gli Owner possono sempre modificare i ruoli di qualsiasi membro del Team. I Manager possono modificare i ruoli dei **Task Runner** e dei **Guest**, ma **non** quelli degli altri Manager o degli Owner.

- **Rimozione dei membri:** gli Owner e i Manager possono rimuovere i membri del Team con ruoli inferiori.
  - Un Owner può rimuovere chiunque (inclusi gli altri Owner), ma non può rimuovere se stesso se è l'unico Owner.
  - Un Manager può rimuovere i **Task Runner** e i **Guest**, ma **non** gli altri Manager o gli Owner.

---

## Buone pratiche {#best-practices}

1. **Mantenere la ridondanza:** assegnare il ruolo **Owner** ad almeno due persone per garantire un accesso continuo ed evitare un singolo punto di guasto.
2. **Seguire il principio del privilegio minimo:**
   - Assegnare ai membri del Team il ruolo minimo necessario per le loro attività.
   - Utilizzare i ruoli **Task Runner** o **Guest** per chi necessita di permessi limitati.
   - Su Enterprise, preferire i [ruoli personalizzati](#extended-rbac-enterprise) per concedere l'accesso a Task Template specifici invece di elevare il ruolo integrato di un membro.
3. **Rivedere periodicamente i membri:**
   - Al variare della struttura del Team, rivalutare i ruoli.
   - Revocare l'accesso o declassare i ruoli degli utenti che non necessitano più di privilegi elevati.
4. **Utilizzare i Manager per l'amministrazione quotidiana:**
   - Riservare il ruolo Owner a un gruppo ristretto con l'autorità finale.
   - Delegare le attività ordinarie di gestione del Project ai Manager per ridurre il rischio di modifiche importanti accidentali o di eliminazioni del Project.

---

## Domande frequenti {#frequently-asked-questions}

### 1. Un Owner può rimuovere un altro Owner? {#1-can-an-owner-remove-another-owner}
Sì, un Owner può rimuovere o modificare il ruolo di qualsiasi altro Owner, a meno che non sia l'unico Owner rimasto nel Project.

### 2. Chi può eliminare il Project? {#2-who-can-delete-the-project}
Solo gli **Owner** possono eliminare un Project.

### 3. I Manager possono aggiungere o rimuovere altri Manager? {#3-can-managers-add-or-remove-other-managers}
No. I Manager possono aggiungere o rimuovere solo utenti con ruolo **Task Runner** o **Guest**. Per gestire gli Owner o gli altri Manager è necessario essere Owner.

### 4. Cosa succede se rimuovo accidentalmente tutti gli Owner? {#4-what-happens-if-i-remove-all-owners-by-accident}
Semaphore UI impedisce la rimozione di un Owner se ciò lascerebbe il Project completamente senza Owner. Deve esserci sempre almeno un Owner.

### 5. I Guest possono eseguire Task? {#5-can-guests-run-tasks}
No. I Guest hanno accesso in sola lettura e non possono avviare né gestire i Task. Nell'edizione Enterprise è possibile concedere a un Guest il permesso di eseguire singoli Task Template tramite un [ruolo personalizzato](#extended-rbac-enterprise).

### 6. I ruoli personalizzati sostituiscono i ruoli integrati? {#6-do-custom-roles-replace-the-built-in-roles}
No. I ruoli personalizzati estendono i ruoli integrati con permessi aggiuntivi a livello di Project e di Task Template. Ogni membro del Team continua ad avere esattamente un ruolo integrato.

### 7. La RBAC estesa è disponibile nell'edizione community? {#7-is-extended-rbac-available-in-the-community-edition}
No. La RBAC estesa richiede un abbonamento **Semaphore Enterprise**.
