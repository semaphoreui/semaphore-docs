# Bitbucket Access Token

Sie können ein Bitbucket Access Token in Semaphore verwenden, um auf Repositories von Bitbucket zuzugreifen.

Zunächst müssen Sie ein Access Token für Ihr Bitbucket-Repository mit Leseberechtigungen erstellen.

![](/assets/bitbucket_access_token_1.webp)

Nach der Erstellung wird Ihnen das Access Token angezeigt. Kopieren Sie es in die Zwischenablage, da es zum Erstellen eines **Zugangsschlüssels** in Semaphore benötigt wird.

![](/assets/bitbucket_access_token_2.webp)

1. Gehen Sie zum Bereich **Key Store** in Semaphore und klicken Sie auf die Schaltfläche **Neuer Schlüssel**.
2. Wählen Sie `Login with password` als Schlüsseltyp.
3. Geben Sie `x-token-auth` als **Login** ein und fügen Sie den zuvor kopierten Schlüssel in das Feld **Passwort** ein. Speichern Sie den Schlüssel.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. Gehen Sie zum Bereich **Repositories** und klicken Sie auf die Schaltfläche **Neues Repository**.
5. Geben Sie die HTTPS-URL des Repositories ein (`https://bitbucket.org/path/to/repo`), geben Sie den richtigen Branch ein und wählen Sie den zuvor erstellten **Zugangsschlüssel** aus.<br/><br/>![](/assets/bitbucket_access_token_4.webp)
