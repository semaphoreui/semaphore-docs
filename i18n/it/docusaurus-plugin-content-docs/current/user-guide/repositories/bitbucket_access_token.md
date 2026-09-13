# Token di accesso Bitbucket

È possibile utilizzare un token di accesso Bitbucket in Semaphore per accedere ai repository di Bitbucket.

Innanzitutto, è necessario creare un token di accesso per il repository Bitbucket con autorizzazioni di lettura.

![](/assets/bitbucket_access_token_1.webp)

Dopo la creazione verrà mostrato il token di accesso. Copiarlo negli appunti, poiché sarà necessario per creare una **Chiave di accesso** in Semaphore.

![](/assets/bitbucket_access_token_2.webp)

1. Andare nella sezione **Key Store** di Semaphore e fare clic sul pulsante **Nuova chiave**.
2. Scegliere `Login with password` come tipo di chiave.
3. Inserire `x-token-auth` come **Login** e incollare la chiave copiata in precedenza nel campo **Password**. Salvare la chiave.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. Andare nella sezione **Repository** e fare clic sul pulsante **Nuovo repository**.
5. Inserire l'URL HTTPS del repository (`https://bitbucket.org/path/to/repo`), inserire il branch corretto e selezionare la **Chiave di accesso** creata in precedenza.<br/><br/>![](/assets/bitbucket_access_token_4.webp)
