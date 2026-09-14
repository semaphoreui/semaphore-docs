---
title: Use the online configurator
description: Generate binary setup commands or a Docker Compose file with the Semaphore online configurator.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Use the online configurator

Fill in the form to generate setup commands for a new Semaphore server. The preview
updates as you edit; apply the result on your own server to complete setup.

## Before you begin {#before-you-begin}

- Choose binary or Docker installation and the Semaphore version you will run.
  The links and recordings below use **2.19**; select your version on the website.
- For MySQL or Postgres, have the database connection details ready. For SQLite,
  choose a database file location writable by the Semaphore service user.
- Use your own administrator password. The recordings contain demonstration values.

## Steps {#steps}

Follow the section for your installation method.

### Binary installation {#binary-installation}

1. Open the [binary installation page](https://semaphoreui.com/install/binary/2_19/install).
   Find your platform, architecture, and package type. Click the row to show its
   commands; copy and run them on your server, or use **Download** to get the package.
2. Open [Server setup](https://semaphoreui.com/install/binary/2_19/config).
   Under **Database settings**, select **SQLite**, **MySQL**, or **Postgres** and
   enter the file path or connection details. Under **Admin user**, fill in the
   login, password, name, and email.
3. Return to **Config file** and click the copy icon. Review the generated commands
   before running them in a writable directory on your server. They create
   `config.json`, add the administrator, and start Semaphore. Keep the configuration
   and its generated encryption keys for future starts.

![Linux amd64 deb row expanded to show installation commands](/img/admin-guide/configuration/online/binary-install.png)

![Database and administrator fields filled with demonstration values](/img/admin-guide/configuration/online/binary-settings.png)

The video shows package selection, server settings, and copying the generated commands.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="Binary setup in the online configurator">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Docker installation {#docker-installation}

1. Open the [Docker configurator](https://semaphoreui.com/install/docker/2_19).
   In **Container settings**, set the name and host port. Under **Docker volumes**,
   enable the data and configuration volumes to keep them when replacing the container.
2. Choose the database and fill in **Admin user**, including your own password.
   For an external database, use a host reachable from the container.
3. Select **Docker Compose** and click the download icon. Save the result as
   `docker-compose.yml` in your deployment directory, review it, and run
   `docker compose up -d` there. Alternatively, select **Docker command** and copy
   the generated `docker run` command.

![Docker container settings with persistent data and configuration volumes enabled](/img/admin-guide/configuration/online/docker-settings.png)

The video shows container settings, persistent volumes, and downloading Docker Compose.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="Docker setup in the online configurator">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## What's next {#whats-next}

Open your server in a browser, for example `http://localhost:3000` when running
locally, and sign in with the administrator credentials you entered.

- [Run the binary as a service](/admin-guide/installation/binary-file#run-as-a-service).
- [Docker deployment details](/admin-guide/installation/docker).
- [All configuration options](/reference/configuration).
