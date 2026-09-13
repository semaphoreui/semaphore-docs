---
title: "Runneri projekta"
sidebar_custom_props:
  edition: pro
---

# Runneri projekta <Pro />

Runneri (Runners) izvršavaju zadatke (Tasks) na mašinama koje nisu Semaphore server: bliže ciljnoj infrastrukturi, u drugoj mrežnoj zoni ili sa drugačijim skupom alata. **Globalne runnere** registruje administrator i oni služe svim projektima. **Runneri projekta** pripadaju jednom projektu (Project) i njima upravlja njegov tim u odeljku **Runners**.

![Runneri projekta](/assets/project-runners-list.webp)

| Kolona | Sadržaj |
|---|---|
| Prekidač | Uključuje ili isključuje runner. Isključeni runner ne prima zadatke. Samo runneri projekta imaju prekidač; globalnim runnerima upravlja administrator. |
| **Name** | Naziv runnera. Oznaka **Global** označava runnere koje dele svi projekti. |
| **Tag** | Oznake runnera. Šabloni sa **Runner tag** izvršavaju se samo na runnerima koji imaju tu oznaku. |
| **Status** | **Online** kada je runner nedavno kontaktirao server, u suprotnom **Offline**. |

## Dodavanje runnera {#adding-a-runner}

Potrebna vam je uloga **Manager** ili viša. Kliknite **New Runner** i popunite formu.

<div class="dialog-screenshot dialog-screenshot--small">

![Dijalog za novi runner](/assets/project-runner-new.webp)

</div>

| Polje | Opis |
|---|---|
| **Name** | Naziv runnera koji se prikazuje u listi i u detaljima zadatka. |
| **Tags** | Opciono. Jedna ili više oznaka. Šablon sa **Runner tag** izvršavaju samo runneri koji nose tu oznaku. |
| **Is default** | Runneri sa ovom zastavicom preuzimaju i zadatke šablona bez oznake runnera. Runner bez zastavice i bez oznaka nikada ne prima zadatke. |
| **Register** | Označeno: runner se kreira kao registrovan i dijalog prikazuje token runnera koji treba uneti u konfiguraciju runnera. Neoznačeno: runner se kreira kao neregistrovan i dobijate jednokratni **token za registraciju**; runner se sam registruje pomoću `semaphore runner register` ili `semaphore runner start --auto-register`. |
| **Webhook** | Opcioni URL koji Semaphore poziva kada se zadatak dodeli runneru. Koristite ga za pokretanje runnera na zahtev (jednokratnih), na primer pomoću cloud funkcije. |
| **Max number of parallel tasks** | Opciono. Koliko zadataka runner može da izvršava istovremeno. |
| **Enabled** | Da li runner prima zadatke. |

Nakon kreiranja kliknite na runner da ponovo vidite njegov token ili token za registraciju i da kopirate isečke konfiguracije.

## Instaliranje runnera {#installing-the-runner}

Runner je isti `semaphore` binarni fajl ili Docker slika `semaphoreui/runner` pokrenuta u režimu runnera. Instalacija, konfiguraciona datoteka, komande za registraciju, izvršioci (lokalni, Docker, Kubernetes) i bezbednost opisani su u vodiču za administratore (Admin Guide): [Runneri](/admin-guide/runners) i [CLI: Runneri](/reference/cli/runners).

## Usmeravanje zadataka na runnere {#routing-tasks-to-runners}

1. Dodelite runneru jednu ili više **Tags** oznaka, na primer `windows-qa-server`.
2. U formi šablona podesite **Runner tag** na istu vrednost.
3. Zadaci šablona čekaju u statusu `waiting` dok runner sa tom oznakom ne bude na mreži.

Šabloni bez oznake runnera idu na runnere označene sa **Is default**, uključujući globalne podrazumevane runnere. Runner koji je izvršio zadatak prikazan je na kartici **Details** u [prozoru zadatka](../tasks#task-window).

## Bezbednost {#security}

- Runneri se povezuju na server, nikada obrnuto, tako da runner može da bude iza NAT-a ili u privatnoj mreži.
- Svaki zahtev runnera autentifikuje se njegovim tokenom. Povucite runner tako što ćete ga obrisati ili isključiti.
- Koristite HTTPS između runnera i servera; pogledajte [Bezbednost mreže](/admin-guide/security/network).
