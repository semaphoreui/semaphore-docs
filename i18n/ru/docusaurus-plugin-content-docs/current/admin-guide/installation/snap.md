# Snap (устарело)

Чтобы установить Semaphore через snap, выполните в терминале следующую команду:

```bash
sudo snap install semaphore
```

Semaphore будет доступен по URL [https://localhost:3000](https://localhost:3000).&#x20;

Но для входа необходимо создать пользователя-администратора. Используйте следующие команды:

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

Проверить состояние службы Semaphore можно следующей командой:

```bash
sudo snap services semaphore
```

Она должна вывести следующую таблицу:

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

После установки вы можете настроить Semaphore через [конфигурацию Snap](https://snapcraft.io/docs/configuration-in-snaps). Чтобы посмотреть текущую конфигурацию Semaphore, используйте следующую команду:

```bash
sudo snap get semaphore
```

&#x20;Список доступных опций приведён в [справочнике по опциям конфигурации](../configuration#configuration-options).

----
