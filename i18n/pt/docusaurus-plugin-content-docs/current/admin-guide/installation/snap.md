# Snap (obsoleto)

Para instalar o Semaphore via snap, execute o seguinte comando no terminal:

```bash
sudo snap install semaphore
```

O Semaphore estará disponível na URL [https://localhost:3000](https://localhost:3000).&#x20;

Mas, para fazer login, você precisa criar um usuário administrador. Use os seguintes comandos:

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

Você pode verificar o status do serviço do Semaphore usando o seguinte comando:

```bash
sudo snap services semaphore
```

Ele deve exibir a seguinte tabela:

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

Após a instalação, você pode configurar o Semaphore por meio da [configuração do Snap](https://snapcraft.io/docs/configuration-in-snaps). Use o seguinte comando para ver a configuração do seu Semaphore:

```bash
sudo snap get semaphore
```

&#x20;A lista de opções disponíveis pode ser encontrada na [referência de opções de configuração](../configuration#configuration-options).

----
