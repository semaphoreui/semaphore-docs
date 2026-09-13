# Bitbucket アクセストークン

Semaphore で Bitbucket アクセストークンを使用して、Bitbucket のリポジトリにアクセスできます。

まず、Bitbucket リポジトリ用に読み取りアクセス権限を持つアクセストークンを作成する必要があります。

![](/assets/bitbucket_access_token_1.webp)

作成後、アクセストークンが表示されます。Semaphore で**アクセスキー**を作成する際に必要になるため、クリップボードにコピーしておいてください。

![](/assets/bitbucket_access_token_2.webp)

1. Semaphore の**キーストア**セクションに移動し、**新しいキー**ボタンをクリックします。
2. キーの種類として `Login with password` を選択します。
3. **ログイン**に `x-token-auth` を入力し、先ほどコピーしたキーを**パスワード**フィールドに貼り付けます。キーを保存します。<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. **リポジトリ**セクションに移動し、**新しいリポジトリ**ボタンをクリックします。
5. リポジトリの HTTPS URL (`https://bitbucket.org/path/to/repo`) を入力し、正しいブランチを入力して、先ほど作成した**アクセスキー**を選択します。<br/><br/>![](/assets/bitbucket_access_token_4.webp)
