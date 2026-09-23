# Integracije

Integracije (Integrations) omogućavaju uspostavljanje interakcije između Semaphore-a i spoljnih servisa, kao što su GitHub i GitLab.

![Lista integracija](/assets/integrations-list.webp)

Webhook URL projekta (Project) prikazan je iznad liste. Svaka integracija ima naziv i šablon koji pokreće; kliknite na integraciju da biste podesili njene uparivače (matchers) i ekstraktore vrednosti (value extractors).

![Detalji integracije](/assets/integration-detail.webp)

Pomoću integracije možete pokrenuti određeni šablon pozivanjem posebne krajnje tačke (alias), za koju možete podesiti jedan od sledećih načina autentifikacije:
* GitHub Webhooks
* Token
* HMAC (SHA-256)
* HMAC (SHA-512)
* Bez autentifikacije

Alias predstavlja URL u sledećem formatu: `/api/integrations/<random_string>`. Podržava `GET` i `POST` zahteve.

## HMAC autentifikacija {#hmac-authentication}

HMAC metode autentifikacije (`hmac` / SHA-256 i `hmac-sha512` / SHA-512) proveravaju da li je telo webhook zahteva potpisano deljenom tajnom.

Podesite:

1. **Auth header** — zaglavlje zahteva koje prenosi potpis (na primer `X-Signature` ili `X-Hub-Signature-256`).
2. **Auth secret** — kredencijal za prijavu i lozinku iz skladišta ključeva; Semaphore koristi vrednost **lozinke** kao HMAC tajnu.

Pošiljalac mora u to zaglavlje da postavi HMAC sažetak neobrađenog tela zahteva kao **sirovu heksadecimalnu vrednost** (bez prefiksa `sha256=` / `sha512=`). Semaphore ga poredi sa `HMAC-SHA256` ili `HMAC-SHA512` vrednošću tela izračunatom pomoću podešene tajne.

Primer (SHA-512) sa OpenSSL-om:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Uparivači {#matchers}

Pomoću uparivača (Matchers) možete definisati parametre dolaznog zahteva. Kada se ti parametri poklope, šablon će biti pozvan.

## Ekstraktori vrednosti {#value-extractors}

Pomoću ekstraktora (Value Extractors) možete uzeti podatke iz zaglavlja ili tela zahteva (JSON polje ili string) i proslediti ih zadatku (Task). Svaka izdvojena vrednost ima **Tip promenljive** (Variable type):

* **Okruženje** (Environment): vrednost se dodaje promenljivim okruženja zadatka i zamenjuje promenljivu istog naziva iz grupe promenljivih (Variable Group).
* **Parametar zadatka** (Task parameter): vrednost postaje parametar zadatka, na primer promenljiva upitnika ili upit.

## Parametri zadatka {#task-parameters}

Integracije mogu pokretati zadatke sa parametrima. Koristite ekstraktore vrednosti da sastavite JSON sadržaj za parametre zadatka i podesite šablon tako da prihvata vrednosti unete na upit.

## Napomene o alias-ima i uparivačima {#notes-on-aliases-and-matchers}

Alias projekta (URL iznad liste integracija) dele sve integracije projekta: Semaphore proverava uparivače svake integracije i pokreće šablone čiji se uparivači poklope. Integracija može imati i sopstveni alias; zahtevi ka njemu pokreću tu integraciju bez provere uparivača. Po potrebi dajte prednost autentifikaciji tokenom/HMAC-om i prosleđujte parametre preko ekstraktora.
