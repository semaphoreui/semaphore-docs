---
title: Integracije
description: Pokretanje šablona i radnih tokova iz dolaznih webhook zahteva pomoću krajnjih tačaka, grupa integracija, načina autentifikacije, uparivača i ekstraktora vrednosti.
---

# Integracije

Integracije (Integrations) omogućavaju spoljnim servisima, kao što su GitHub, GitLab ili CI server, da pokreću zadatke u Semaphore-u pozivanjem webhook URL-a. Integraciju opisuju tri objekta: **krajnja tačka** (endpoint) određuje gde zahtev stiže i kako se autentifikuje, **grupa integracija** određuje koje se integracije pokreću sa te krajnje tačke, a **integracija** određuje šta se pokreće i sa kojim parametrima.

![Lista integracija](/assets/integrations-list.webp)

## Kako radi {#how-it-works}

| Objekat | Šta sadrži | Gde se nalazi |
|---|---|---|
| **Krajnja tačka** | Naziv i opis, jedan ili više **alias-a** (javnih URL-ova oblika `/api/integrations/<random_string>`) i **autentifikaciju** kojom se proverava svaki zahtev ka tim URL-ovima. | Projekat → **Endpoints** |
| **Grupa integracija** | Skup integracija koje se pokreću sa jedne krajnje tačke. Grupa po pravilu nasleđuje autentifikaciju krajnje tačke; može je **zameniti** sopstvenim metodom i tajnom. | Projekat → **Integrations**, jedan odeljak po grupi |
| **Integracija** | Šablon ili radni tok (Pro) koji se pokreće, parametri zadatka, [uparivači](#matchers) koji filtriraju zahteve i [ekstraktori vrednosti](#value-extractors) koji prosleđuju podatke zadatku. | Unutar svoje grupe |

Kada zahtev stigne na alias, Semaphore pronalazi krajnju tačku, proverava zahtev autentifikacijom svake grupe (krajnje tačke ili sopstvenom autentifikacijom grupe) i pokreće svaku integraciju autorizovane grupe čiji svi uparivači prihvate zahtev. Integracija bez uparivača pokreće se na svaki autorizovani zahtev. Odgovor je uvek `204 No Content`; zaglavlja `X-Semaphore-Endpoint-ID`, `X-Semaphore-Integration-Group-ID`, `X-Semaphore-Integration-ID` i `X-Semaphore-Task-ID` navode šta je pokrenuto. Prihvataju se `GET` i `POST` zahtevi.

![Detalji integracije](/assets/integration-detail.webp)

Alias string je jedina tajna krajnje tačke bez autentifikacije: postupajte sa URL-om kao sa lozinkom, a da biste ga povukli, uklonite alias. Jedna krajnja tačka može imati više alias-a, pa svakom pošiljaocu možete dati zaseban URL i povlačiti ih jedan po jedan.

## Autentifikacija {#authentication}

Krajnja tačka, ili grupa koja je zamenjuje, proverava zahteve jednim od sledećih načina:

* **GitHub Webhooks** — zaglavlje `X-Hub-Signature-256`, HMAC-SHA256 tela sa tajnom
* **Bitbucket Webhooks** — zaglavlje `x-hub-signature`, HMAC-SHA256 tela
* **Token** — zaglavlje po vašem izboru mora biti jednako tajni
* **HMAC (SHA-256)** i **HMAC (SHA-512)** — zaglavlje po vašem izboru nosi potpis tela
* **BasicAuth** — korisničko ime i lozinka iz kredencijala za prijavu i lozinku
* **Bez autentifikacije** — prolazi svaki zahtev sa važećim alias URL-om

Tajna dolazi iz [skladišta ključeva](./key-store) projekta: ključ tipa **String** (njegova vrednost je tajna) ili kredencijal za **prijavu i lozinku** (njegova lozinka je tajna). BasicAuth je izuzetak: proverava i korisničko ime, pa zahteva kredencijal za prijavu i lozinku. Obrazac nudi samo ključeve čiji tip odgovara metodu, a API odbija ostale.

## HMAC autentifikacija {#hmac-authentication}

HMAC metode autentifikacije (`hmac` / SHA-256 i `hmac-sha512` / SHA-512) proveravaju da li je telo webhook zahteva potpisano deljenom tajnom.

Podesite na krajnjoj tački (ili na grupi koja je zamenjuje):

1. **Auth header** — zaglavlje zahteva koje prenosi potpis (na primer `X-Signature`).
2. **Auth secret** — ključ tipa **String** iz skladišta ključeva ili kredencijal za prijavu i lozinku.

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

Uparivači (matchers) opisuju zahteve na koje integracija reaguje: zaglavlje ili polje tela (JSON putanja ili celo telo kao string) poredi se sa vrednošću. Svi uparivači integracije moraju da se poklope; integracija bez uparivača pokreće se na svaki zahtev koji njena grupa propusti. Koristite uparivače da biste sa jedne krajnje tačke pokretali različite integracije za različite događaje — na primer jedan šablon za `push`, a drugi za `release`.

## Ekstraktori vrednosti {#value-extractors}

Pomoću ekstraktora (Value Extractors) možete uzeti podatke iz zaglavlja ili tela zahteva (JSON polje ili string) i proslediti ih zadatku (Task). Svaka izdvojena vrednost ima **Tip promenljive** (Variable type):

* **Okruženje** (Environment): vrednost se dodaje promenljivim okruženja zadatka i zamenjuje promenljivu istog naziva iz grupe promenljivih (Variable Group).
* **Parametar zadatka** (Task parameter): vrednost postaje parametar zadatka, na primer promenljiva upitnika ili upit.

## Parametri zadatka {#task-parameters}

Integracije mogu pokretati zadatke sa parametrima. Koristite ekstraktore vrednosti da sastavite JSON sadržaj za parametre zadatka i podesite šablon tako da prihvata vrednosti unete na upit.

## Nadogradnja sa starijih verzija {#upgrading-from-older-versions}

Pre verzije 2.20.19 integracija je imala sopstvenu autentifikaciju, a alias-i su postojali ili za ceo projekat ili za pojedinačnu integraciju. Nadogradnja pretvara tu konfiguraciju bez promene ponašanja bilo kog postojećeg URL-a:

| Pre | Posle nadogradnje |
|---|---|
| Alias-i projekta (URL iznad liste integracija) | Krajnja tačka pod nazivom **Default** bez autentifikacije koja sadrži sve njih |
| Integracija dostupna preko alias-a projekta (uključeno „Use project alias“) | Sopstvena grupa na krajnjoj tački **Default**. Ako je integracija imala autentifikaciju, grupa njome **zamenjuje** autentifikaciju krajnje tačke |
| Integracija sa sopstvenim alias-ima | Krajnja tačka nazvana po integraciji, sa njenim alias-ima i autentifikacijom, i sopstvena grupa na toj krajnjoj tački |
| Uparivači i ekstraktori vrednosti | Bez promena |

Svaka integracija završava sama u grupi nazvanoj po njoj; potom spajajte grupe ili preimenujte krajnje tačke po želji. Dva detalja se razlikuju od starog ponašanja: integracija iza alias-a projekta koja nije imala uparivače ranije se nikada nije pokretala, a sada se pokreće na svaki autorizovani zahtev, a sopstveni alias-i integracije koja je koristila i alias projekta (koji se nikada ni sa čim nisu poklapali) se odbacuju. Rezervne kopije projekta napravljene starijom verzijom pretvaraju se na isti način pri vraćanju.
