# Token de acesso do Bitbucket

Você pode usar um token de acesso do Bitbucket no Semaphore para acessar repositórios do Bitbucket.

Primeiro, você precisa criar um token de acesso para o seu repositório do Bitbucket com permissões de leitura.

![](/assets/bitbucket_access_token_1.webp)

Após a criação, você verá o token de acesso. Copie-o para a área de transferência, pois ele será necessário para criar uma **Chave de Acesso** no Semaphore.

![](/assets/bitbucket_access_token_2.webp)

1. Vá até a seção **Armazenamento de Chaves** do Semaphore e clique no botão **Nova Chave**.
2. Escolha `Login with password` como tipo de chave.
3. Digite `x-token-auth` em **Login** e cole a chave copiada anteriormente no campo **Senha**. Salve a chave.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. Vá até a seção **Repositórios** e clique no botão **Novo Repositório**.
5. Digite a URL HTTPS do repositório (`https://bitbucket.org/path/to/repo`), informe o branch correto e selecione a **Chave de Acesso** criada anteriormente.<br/><br/>![](/assets/bitbucket_access_token_4.webp)
