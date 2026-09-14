
# Shell/Bash skripte

Semaphore može da pokreće shell skripte pomoću `/bin/bash`. Da biste to uradili, kreirajte šablon zadatka (Task Template) tipa **Bash Script**.

## Kreiranje Bash šablona {#creating-a-bash-template}

1. Otvorite odeljak **Šabloni zadataka** (Task Templates) i kliknite na dugme **Novi šablon** (New Template).
2. Izaberite **Bash** kao tip aplikacije.
3. Podesite šablon:

| Polje | Opis |
|---|---|
| **Naziv** (Name) | Opisni naziv šablona |
| **Repozitorijum** (Repository) | Repozitorijum koji sadrži vašu shell skriptu |
| **Playbook / Skripta** (Playbook / Script) | Relativna putanja do skripte, npr. `scripts/deploy.sh` |
| **Grupe promenljivih** (Variable Groups) | Grupe promenljivih čije se vrednosti ubacuju kao promenljive okruženja |

4. Kliknite **Kreiraj** (Create).
5. Kliknite **Pokreni** (Run) da biste izvršili šablon. Dijalog Novi zadatak (New Task) za šablon sa skriptom sadrži samo opcionu poruku, kao i anketne promenljive i upite ako ih šablon definiše.

<div class="DialogScreenshot">

![Dijalog Novi zadatak za Bash šablon](/assets/task-new-bash.webp)

</div>

## Prosleđivanje promenljivih skriptama {#passing-variables-to-scripts}

Promenljive iz izabranih **grupa promenljivih** (Variable Groups) ubacuju se kao promenljive okruženja. Pristupite im u skripti pomoću `$VARIABLE_NAME`:

```bash
#!/bin/bash
echo "Deploying to $TARGET_HOST"
```

## Napomene {#notes}

- Učinite skriptu izvršnom (`chmod +x`) ili se pobrinite da počinje važećim shebang-om (`#!/bin/bash`).
- Skripte se izvršavaju neinteraktivno. Izbegavajte upite koji čekaju unos korisnika.
- Izlazni kod `0` označava uspeh; svaki izlazni kod različit od nule označava zadatak (Task) kao neuspešan.
- Ako veoma kratka skripta ne proizvede nikakav izlaz u logu, pogledajte [Izlaz Bash skripte nedostaje ili je nepotpun](/faq/troubleshooting#bash-script-output-is-missing-or-incomplete) u vodiču za rešavanje problema.
- Za izvršavanje komandi na udaljenim hostovima umesto toga koristite [Ansible](./ansible).
