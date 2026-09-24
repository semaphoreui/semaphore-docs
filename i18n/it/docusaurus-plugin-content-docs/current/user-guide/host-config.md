---
title: Configurazione host
description: "Associa un host Git o l'URL di un repository a una credenziale del Key Store, così submoduli, ruoli Galaxy, moduli Terraform e repository di inventario ospitati altrove sono raggiungibili con la propria chiave."
---

# Configurazione host

Un'attività si autentica al proprio repository con la chiave selezionata nel [Repository](/user-guide/repositories). Tutto il resto che l'attività scarica da Git non ha una credenziale propria: un submodulo su un altro server, un ruolo di `requirements.yml`, un modulo Terraform, un inventario conservato in un secondo repository. **Host config** (configurazione degli host) colma questa lacuna. Una mappatura associa un host Git o l'URL di un repository a una credenziale del [Key Store](/user-guide/key-store), e ogni operazione Git del progetto la usa quando raggiunge quell'host o quell'URL.

La pagina si trova nel menu del progetto, sotto **Repositories**. Aggiungere, modificare ed eliminare le mappature richiede il permesso di gestire le risorse del progetto, lo stesso necessario per il Key Store.

![Pagina Host config di un progetto con tre mappature](/assets/host-config-page.webp)

## Tipi di mappatura {#mapping-types}

Premi **Add mapping** (aggiungi mappatura) e scegli a cosa deve corrispondere la mappatura.

### Host {#host}

Una mappatura di tipo **Host** corrisponde a un nome host SSH, per esempio `github.com` o `gitlab.example.com`, e richiede una chiave **SSH**. Ogni volta che l'attività apre una connessione SSH verso quell'host, si autentica con la chiave mappata: un repository o un submodulo clonato via SSH, un URL `git@host:group/repo.git` in `requirements.yml`, e anche gli host di un inventario Ansible con quel nome. Se la chiave ha un login, viene usato come utente SSH per l'host.

<div style={{maxWidth: 720}}>

![Finestra Add mapping con il tipo Host selezionato](/assets/host-config-form-host.webp)

</div>

### URL {#url}

Una mappatura di tipo **URL** corrisponde all'URL `https://` o `http://` di un repository. Può indicare un singolo repository, `https://gitlab.example.com/infra/network.git`, oppure terminare con `/` per coprire tutti i repository di un gruppo, `https://gitlab.example.com/ansible/`. Quando più mappature corrispondono, vince l'URL più specifico: la mappatura di un singolo repository prevale su quella del gruppo che lo contiene.

La credenziale decide come viene raggiunto l'URL:

| Credenziale | Cosa succede |
|---|---|
| Chiave **SSH** | L'URL viene riscritto nella sua forma SSH e la connessione si autentica con la chiave. Il login della chiave è l'utente SSH, `git` se la chiave non ne ha uno. |
| **Login con password** | Login e password vengono aggiunti all'URL e inviati via HTTPS. Lascia vuoto il login per usare un personal access token. Solo un URL `https://` accetta questa credenziale, così il segreto non viaggia mai in chiaro. |

L'URL non deve contenere credenziali proprie, spazi, virgolette o il carattere `=`.

<div style={{maxWidth: 720}}>

![Finestra di modifica di una mappatura URL con Login con password](/assets/host-config-form-url.webp)

</div>

## Dove si applicano le mappature {#where-mappings-apply}

Le mappature di un progetto vengono installate prima del primo comando Git di un'attività e restano in vigore fino alla sua conclusione. Coprono:

- la clonazione e l'aggiornamento del repository del modello, submoduli inclusi;
- i ruoli e le collection installati da `requirements.yml`, vedi [Requisiti Galaxy](/user-guide/apps/ansible#galaxy-requirements);
- i moduli scaricati da `terraform init` o `tofu init`;
- i comandi Git avviati dal playbook o dallo script stesso, per esempio il modulo `git` di Ansible;
- il repository di un inventario conservato in Git;
- gli host dell'inventario, quando una mappatura **Host** corrisponde al loro nome;
- la navigazione di branch e playbook di un repository nel modulo del modello e il polling delle pianificazioni che partono a ogni nuovo commit.

Le attività inviate a un [runner remoto](/admin-guide/runners) ricevono le mappature insieme all'attività, quindi lì si comportano allo stesso modo.

Una mappatura sovrascrive la voce per lo stesso host nella configurazione SSH globale del server (`ssh.config_path` nella [configurazione](/reference/configuration)); tutte le altre voci di quel file continuano a funzionare. Le mappature richiedono il client Git a riga di comando, che è il valore predefinito `git_client: cmd_git`; con il client integrato `go_git` un'attività di un progetto con mappature fallisce con un errore esplicativo invece di usare la credenziale sbagliata.

## Credenziali {#credentials}

Le chiavi private non toccano mai il disco: ogni mappatura SSH conserva la propria chiave in un agente SSH che vive quanto l'attività, e la configurazione SSH generata fa riferimento solo all'agente. Un Login con password viene passato a Git tramite il suo ambiente di configurazione, non sulla riga di comando, e Git riporta l'URL originale nel log dell'attività, quindi il segreto non compare in nessuno dei due.

Una chiave a cui fa riferimento una mappatura non può essere eliminata; la finestra di conferma elenca le mappature che la usano. Anche cambiare il tipo di una chiave del genere in uno che la mappatura non può usare, per esempio trasformare la chiave SSH di una mappatura Host in un Login con password, viene rifiutato.

## Esempio {#example}

Un playbook si trova su GitHub, usa un submodulo da un GitLab self-hosted e installa un ruolo da un secondo gruppo GitLab tramite `requirements.yml`:

```yaml
# requirements.yml
- src: https://gitlab.example.com/ansible/role-nginx.git
  version: v2.1.0
```

Tre mappature fanno funzionare l'attività senza alcuna modifica al repository:

| Tipo | Host o URL | Credenziale |
|---|---|---|
| Host | `github.com` | La deploy key del repository GitHub |
| URL | `https://gitlab.example.com/ansible/` | Un access token di GitLab, come Login con password |
| URL | `https://gitlab.example.com/infra/network.git` | La chiave SSH autorizzata su quel singolo repository |

## Backup {#backups}

Le mappature fanno parte del [backup del progetto](./projects/settings#danger-zone). Fanno riferimento alla propria credenziale per nome, quindi un progetto ripristinato le mantiene collegate alle chiavi ripristinate. Come per ogni chiave, il valore segreto in sé non viene esportato.
