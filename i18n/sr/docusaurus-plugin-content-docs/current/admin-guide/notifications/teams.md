# Microsoft Teams

Microsoft Teams obaveštenja dostavljaju rezultate zadataka iz Semaphore-a direktno u Teams kanal. Svaka poruka je kartica sa nazivom šablona, statusom zadatka, korisnikom koji je pokrenuo zadatak i dugmetom koje otvara zadatak u Semaphore-u.

Da biste podesili Teams obaveštenja, potreban vam je webhook URL koji povezuje Semaphore sa kanalom. U Teams-u se ovaj URL kreira pomoću aplikacije **Workflows**, koja radi na Microsoft Power Automate platformi i nema veze sa tokovima rada (Workflows) u Semaphore-u.

:::warning
Microsoft je u maju 2026. ugasio Office 365 konektore u Teams-u, uključujući stari konektor **Incoming Webhook**. Webhook URL na `webhook.office.com` više ne isporučuje poruke. Kreirajte novi URL pomoću aplikacije Workflows kao što je opisano u nastavku.
:::

## Kreiranje Teams webhook-a {#creating-teams-webhook}

### Korak 1. Otvorite Workflows za kanal {#step-1-open-workflows-for-the-channel}

1. U Microsoft Teams-u idite u tim i kanal koji treba da prima obaveštenja.
2. Kliknite **More options (…)** pored naziva kanala.
3. Izaberite **Workflows**.

---

### Korak 2. Kreirajte tok rada iz šablona {#step-2-create-a-workflow-from-the-template}

1. Pronađite šablon **Send webhook alerts to a channel** i izaberite ga.
2. Proverite parametre toka rada: tim (**Team**) i kanal (**Channel**) u koji se objavljuju poruke.
3. Kliknite **Save**.

Semaphore šalje zahtev bez zaglavlja za autentifikaciju, zato koristite upravo ovaj šablon, a ne njegove varijante *from specific people* ili *from people in an org*.

---

### Korak 3. Kopirajte webhook URL {#step-3-copy-the-webhook-url}

1. Kada se tok rada kreira, Teams prikazuje njegov webhook link. Kopirajte ga.
2. URL je dugačak i izgleda otprilike ovako:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

Parametar `sig` je jedina zaštita webhook-a: svako ko ima URL može da objavljuje poruke u kanalu. Ceo URL čuvajte kao tajnu.

---

### Korak 4. Testirajte webhook {#step-4-test-your-webhook}

Za testiranje koristite `curl`:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

Telo zahteva ima istu strukturu kao poruke koje šalje Semaphore: poruku sa jednim Adaptive Card prilogom. Ako je sve ispravno podešeno, odgovor je `202 Accepted`, a kartica se za nekoliko sekundi pojavljuje u izabranom Teams kanalu.


## Podešavanje Semaphore-a {#semaphore-configuration}

Kada imate Teams webhook URL, Teams obaveštenja možete uključiti pomoću konfiguracionog fajla ili promenljivih okruženja. Restartujte Semaphore da bi izmena stupila na snagu.

### Metod 1: Konfiguracioni fajl {#method-1-configuration-file}

Dodajte sledeća podešavanja u svoj Semaphore konfiguracioni fajl:

- `microsoft_teams_alert`: Postavite na `true` da biste uključili Teams obaveštenja
- `microsoft_teams_url`: Vaš webhook URL iz prethodnog koraka

Primer `config.json`:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Metod 2: Promenljive okruženja {#method-2-environment-variables}

Alternativno, možete koristiti promenljive okruženja. Ovaj metod je posebno koristan za kontejnerizovane instalacije ili kada ne želite da webhook URL stoji u konfiguracionom fajlu.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
URL sadrži znakove `&` i `%`. Kada promenljivu postavljate u shell-u, stavite URL u jednostruke navodnike. U systemd jedinici stavite ga u `EnvironmentFile` umesto u liniju `Environment=`, jer tamo `%` započinje specifikator.
:::

## Uključivanje obaveštenja za projekat {#enabling-notifications-for-a-project}

Gornja podešavanja uključuju kanal za ceo server, a sve poruke idu u jedan kanal kojem webhook pripada. Projekat ih prima samo ako koristi serverske kanale, a šablon zadatka može da potisne poruke o uspehu ili neuspehu. Pogledajte [Kako funkcioniše isporuka](/admin-guide/notifications#how-delivery-works), gde je objašnjeno i kako da pošaljete probnu poruku bez pokretanja zadatka.

Teams dobija obaveštenje kada zadatak uspe, ne uspe ili čeka potvrdu.

Da biste obaveštenja jednog projekta slali u drugi Teams kanal, kreirajte [obaveštenje projekta](/user-guide/alerts#project-alerts) tipa Microsoft Teams sa sopstvenim webhook URL-om.

## Sadržaj poruke {#message-content}

| Element kartice | Vrednost |
|---|---|
| Zaglavlje | `Ansible Task Template Execution by:` i ime korisnika koji je pokrenuo zadatak, ili `—` ako zadatak nije pokrenuo korisnik. |
| **Task** | Naziv šablona zadatka. |
| **Status** | Status zadatka sa ikonom, na primer `✅ SUCCESS`, `❌ ERROR` ili `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Broj zadatka. |
| Dugme **Task URL** | Otvara zadatak u Semaphore-u. Link se formira iz `web_host`, zato ovu opciju postavite na adresu na kojoj korisnici otvaraju Semaphore. |

## Rešavanje problema {#troubleshooting}

Zahtev šalje Semaphore server, a ne runner, i rezultat se upisuje u log zadatka. Semaphore svaku poruku šalje jednom i ne pokušava ponovo.

| Log zadatka | Šta proveriti |
|---|---|
| Nema linije o Microsoft Teams-u | Slanje poruke nije ni pokušano. Proverite da je `microsoft_teams_alert` postavljeno na `true`, da projekat koristi serverske kanale i da šablon ne potiskuje obaveštenje. |
| `Can't send microsoft teams alert! Error: …` | Server nije mogao da dođe do webhook hosta. Dozvolite odlazni HTTPS saobraćaj sa servera ka hostu iz URL-a. Iza proksija postavite `HTTPS_PROXY` za Semaphore server, pogledajte [Rad iza korporativnog proksija](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | Webhook je odbio zahtev. Proverite da je URL kopiran u celosti, uključujući parametar `sig`, i da je tok rada uključen i nije obrisan. Microsoft ograničava webhook na četiri zahteva u sekundi. |
| `Sent successfully microsoft teams alert`, ali u kanalu nema kartice | Tok rada je prihvatio zahtev, a zatim nije uspeo. Otvorite tok rada u aplikaciji **Workflows** i pogledajte istoriju njegovih izvršavanja. Tok rada pripada korisniku koji ga je kreirao i prestaje da radi kada taj korisnik napusti organizaciju ili izgubi pristup kanalu, zato toku rada dodajte suvlasnike. |
