---
title: Используйте онлайн-конфигуратор
description: Создайте команды настройки бинарной установки или файл Docker Compose с помощью онлайн-конфигуратора Semaphore.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Используйте онлайн-конфигуратор

Заполните форму, чтобы получить команды настройки нового сервера Semaphore. Результат обновляется при изменении полей; примените его на своём сервере, чтобы завершить настройку.

## Перед началом {#before-you-begin}

- Выберите бинарную установку или Docker и нужную версию Semaphore. Ссылки и записи ниже используют **2.19**; на сайте выберите свою версию.
- Для MySQL или Postgres подготовьте параметры подключения. Для SQLite выберите путь к файлу базы данных, доступный для записи пользователю службы Semaphore.
- Используйте собственный пароль администратора. В записях показаны демонстрационные значения.

## Шаги {#steps}

Следуйте разделу для вашего способа установки.

### Бинарная установка {#binary-installation}

1. Откройте [страницу бинарной установки](https://semaphoreui.com/install/binary/2_19/install). Найдите платформу, архитектуру и тип пакета. Нажмите на строку, чтобы увидеть команды; скопируйте и выполните их на сервере или нажмите **Download**, чтобы скачать пакет.
2. Откройте [Server setup](https://semaphoreui.com/install/binary/2_19/config). В **Database settings** выберите **SQLite**, **MySQL** или **Postgres** и укажите путь к файлу или параметры подключения. В **Admin user** заполните логин, пароль, имя и email.
3. Вернитесь к **Config file** и нажмите значок копирования. Проверьте команды перед выполнением в каталоге на сервере, доступном для записи. Они создают `config.json`, добавляют администратора и запускают Semaphore. Сохраните конфигурацию и созданные ключи шифрования для следующих запусков.

![Строка Linux amd64 deb с раскрытыми командами установки](/img/admin-guide/configuration/online/binary-install.png)

![Настройки базы данных и администратора с демонстрационными значениями](/img/admin-guide/configuration/online/binary-settings.png)

Видео показывает выбор пакета, настройку сервера и копирование команд.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="Видео показывает выбор пакета, настройку сервера и копирование команд.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Установка в Docker {#docker-installation}

1. Откройте [конфигуратор Docker](https://semaphoreui.com/install/docker/2_19). В **Container settings** задайте имя и порт хоста. В **Docker volumes** включите тома данных и конфигурации, чтобы сохранить их при замене контейнера.
2. Выберите базу данных и заполните **Admin user**, указав собственный пароль. Для внешней базы данных укажите хост, доступный из контейнера.
3. Выберите **Docker Compose** и нажмите значок скачивания. Сохраните результат как `docker-compose.yml` в каталоге развёртывания, проверьте его и выполните там `docker compose up -d`. Другой вариант — выбрать **Docker command** и скопировать команду `docker run`.

![Настройки контейнера Docker с включёнными постоянными томами данных и конфигурации](/img/admin-guide/configuration/online/docker-settings.png)

Видео показывает настройку контейнера, постоянных томов и скачивание Docker Compose.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="Видео показывает настройку контейнера, постоянных томов и скачивание Docker Compose.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## Что дальше {#whats-next}

Откройте сервер в браузере, например `http://localhost:3000` при локальном запуске, и войдите с указанными данными администратора.

- [Запуск бинарного файла в качестве службы](/admin-guide/installation/binary-file#run-as-a-service).
- [Подробности развёртывания в Docker](/admin-guide/installation/docker).
- [Все параметры конфигурации](/reference/configuration).
