# Bitbucket Access Token

Bitbucket Access Token možete koristiti u Semaphore-u za pristup repozitorijumima (Repositories) sa Bitbucket-a.

Prvo treba da kreirate Access Token za svoj Bitbucket repozitorijum sa dozvolama za čitanje.

![](/assets/bitbucket_access_token_1.webp)

Nakon kreiranja videćete pristupni token. Kopirajte ga jer će biti potreban za kreiranje ključa (**Access Key**) u Semaphore-u.

![](/assets/bitbucket_access_token_2.webp)

1. Idite u odeljak **Key Store** (skladište ključeva) u Semaphore-u i kliknite na dugme **New Key**.
2. Izaberite `Login with password` kao tip ključa.
3. Unesite `x-token-auth` kao **Login** i nalepite prethodno kopirani ključ u polje **Password**. Sačuvajte ključ.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. Idite u odeljak **Repositories** i kliknite na dugme **New Repository**.
5. Unesite HTTPS URL repozitorijuma (`https://bitbucket.org/path/to/repo`), unesite ispravnu granu i izaberite prethodno kreirani **Access Key**.<br/><br/>![](/assets/bitbucket_access_token_4.webp)
