# Token d'accès Bitbucket

Vous pouvez utiliser un token d'accès Bitbucket dans Semaphore pour accéder à des dépôts hébergés sur Bitbucket.

Vous devez d'abord créer un token d'accès pour votre dépôt Bitbucket avec des permissions d'accès en lecture.

![](/assets/bitbucket_access_token_1.webp)

Après sa création, le token d'accès s'affiche. Copiez-le dans votre presse-papiers, car il sera nécessaire pour créer une **clé d'accès** dans Semaphore.

![](/assets/bitbucket_access_token_2.webp)

1. Allez dans la section **Magasin de clés** de Semaphore et cliquez sur le bouton **Nouvelle clé**.
2. Choisissez `Login with password` comme type de clé.
3. Saisissez `x-token-auth` comme **Login** et collez la clé copiée précédemment dans le champ **Mot de passe**. Enregistrez la clé.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. Allez dans la section **Dépôts** et cliquez sur le bouton **Nouveau dépôt**.
5. Saisissez l'URL HTTPS du dépôt (`https://bitbucket.org/path/to/repo`), indiquez la bonne branche et sélectionnez la **clé d'accès** créée précédemment.<br/><br/>![](/assets/bitbucket_access_token_4.webp)
