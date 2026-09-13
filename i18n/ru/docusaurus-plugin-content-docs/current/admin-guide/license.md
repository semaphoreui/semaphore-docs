---
title: "Активация лицензии"
---

# Активация лицензии <Pro />

Возможности Semaphore Pro и Enterprise включаются с помощью лицензионного ключа. Активировать лицензию можно из веб-интерфейса или указать ключ в конфигурации сервера для автоматизированных развёртываний.

## Перед началом {#before-you-start}

- Для активации Pro или Enterprise не нужно переустанавливать Semaphore UI или переходить на другую сборку. Вашу текущую версию Semaphore UI можно активировать лицензионным ключом. Обновитесь до последней версии, если хотите получить доступ к новейшим возможностям Pro или Enterprise.
- Войдите под учётной записью администратора.
- Подготовьте лицензионный ключ. Его можно найти в письме о покупке или в [портале Semaphore UI](https://portal.semaphoreui.com/auth/login).

## Активация из веб-интерфейса {#activate-from-the-web-ui}

1. Войдите в Semaphore UI как администратор.

![Экран входа в Semaphore UI](/assets/subscription-login-screen.png)

2. Откройте меню администратора из пользовательской области в левом нижнем углу.

![Кнопка меню администратора в левом нижнем углу](/assets/subscription-admin-menu-trigger.png)

3. Выберите **Upgrade to PRO or EE**.

![Меню администратора с пунктом Upgrade to PRO or EE](/assets/subscription-upgrade-menu-item.png)

4. Вставьте лицензионный ключ в диалог активации и нажмите **ACTIVATE NEW KEY**.

![Диалог активации Semaphore Pro](/assets/subscription-activation-dialog.png)

После успешной активации Semaphore UI показывает сведения о текущей лицензии в диалоге **Subscription & Billing**.

![Диалог Subscription and Billing после успешной активации](/assets/subscription-activation-success.png)

## Активация из конфигурации {#activate-from-configuration}

Для Docker, Kubernetes, systemd и других автоматизированных развёртываний укажите лицензионный ключ в конфигурации сервера вместо ввода в UI. Имена опций конфигурации используют префикс `subscription.*`.

В `config.json`:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

Или как переменная окружения:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

Ключ также можно хранить в файле:

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

или:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

Когда лицензионный ключ управляется через конфигурацию, Semaphore UI отключает элементы редактирования и активации в диалоге **Subscription & Billing**. Это относится и к `subscription.key`, и к `subscription.key_file`, поскольку сервер при запуске считывает файл ключа в лицензионный ключ времени выполнения.

## Управление лицензионным ключом и его замена {#manage-or-replace-a-license-key}

Чтобы продлить, заменить или просмотреть лицензию, откройте меню администратора и выберите **Subscription & Billing**.

![Меню администратора с пунктом Subscription and Billing](/assets/subscription-billing-menu-item.png)

Для лицензионного ключа, управляемого из веб-интерфейса, откройте меню действий в диалоге **Subscription & Billing**, чтобы перезагрузить, загрузить или сбросить ключ.

![Диалог Subscription and Billing с действиями над ключом](/assets/subscription-key-actions-menu.png)

Если ключ задан на сервере:

1. Замените значение `subscription.key` или обновите содержимое файла, на который ссылается `subscription.key_file`.
2. Перезапустите Semaphore UI, чтобы сервер перечитал лицензионный ключ.
3. Убедитесь, что ожидаемые возможности Pro или Enterprise доступны в Semaphore UI.
