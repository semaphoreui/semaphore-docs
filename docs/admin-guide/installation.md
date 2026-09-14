---
title: Installation
description: Choose an installation method for Semaphore and add the Python packages your Ansible tasks need.
---

# Installation

Choose how to install Semaphore based on where you plan to run it and how you
manage software. The guides below cover native packages, containers, standalone
binaries, and Kubernetes, with a separate guide for cloud deployments.

## In this section {#in-this-section}

| Method | Use it when |
|---|---|
| [Package manager](/admin-guide/installation/package-manager) | You want a native package for your Linux distribution. |
| [Docker](/admin-guide/installation/docker) | You want to run Semaphore in a container with Docker or Docker Compose. |
| [Cloud](/admin-guide/installation/cloud) | You are deploying to a cloud platform and need guidance on managed services and infrastructure. |
| [Binary file](/admin-guide/installation/binary-file) | You want to install a precompiled binary and manage the process yourself. |
| [Kubernetes (Helm chart)](/admin-guide/installation/k8s) | You already run Kubernetes and want to manage the deployment with Helm. |

## Additional Python packages {#installing-additional-python-packages}

Some Ansible modules and roles need extra Python packages. If you run Semaphore in
Docker, list those packages in a `requirements.txt` file and mount it in the
container's `/etc/semaphore` directory. Add the mount to your Semaphore service in
`docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

The container installs these packages into the bundled Ansible virtual environment
every time it starts. The same mount works for the `semaphoreui/runner` image. See
[Additional Python dependencies](/admin-guide/installation/docker#installing-additional-python-dependencies)
for details and a custom-image alternative.

For the file syntax, see the
[pip requirements file format reference](https://pip.pypa.io/en/stable/reference/requirements-file-format/).

## Where to start {#where-to-start}

Start with the guide for your deployment environment. For a binary installation,
follow the service instructions to keep Semaphore running. For service users, Python dependencies, and systemd configuration,
use the manual installation guide.

* [Run as a service](/admin-guide/installation/binary-file#run-as-a-service)
* [Manual installation](/admin-guide/installation_manually)
