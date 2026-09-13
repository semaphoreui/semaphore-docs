---
title: Installation
description: The available installation methods - package manager, Docker, cloud, binary, and Helm - and how to add extra Python packages.
---

# Installation

You can install Semaphore in multiple ways, depending on your operating system, environment, and preferences:

* **Package manager**<br />
  Install Semaphore using a native package for your distribution (e.g., apt for Debian/Ubuntu or dnf for RHEL-based systems). This is the easiest way to get started on Linux servers and integrates well with system services.<br />
  [Learn more »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Run Semaphore as a container using Docker or Docker Compose. Ideal for fast setup, sandboxed environments, and CI/CD pipelines. Recommended for users who prefer infrastructure as code.<br />
  [Learn more »](/admin-guide/installation/docker)

* **Cloud**<br />
  Guidance for deploying Semaphore to cloud platforms using VMs, containers, or Kubernetes with managed services.<br />
  [Learn more »](/admin-guide/installation/cloud)

* **Binary file**<br />
  Download a precompiled binary from the releases page. Great for manual installation or embedding in custom workflows. Works across Linux, macOS, and Windows (via WSL).<br />
  [Learn more »](/admin-guide/installation/binary-file)

* **Kubernetes (Helm chart)**<br />
  Deploy Semaphore into a Kubernetes cluster using Helm. Best suited for production-grade, scalable infrastructure. Supports easy configuration and upgrades via Helm values.<br />
  [Learn more »](/admin-guide/installation/k8s)

See also:
* [Run as service](/admin-guide/installation/binary-file#run-as-a-service)
* [Manual installation](/admin-guide/installation_manually)

----


### Installing Additional Python Packages {#installing-additional-python-packages}

Some Ansible modules and roles require additional python packages to run. To install additional python packages, create a `requirements.txt` file and mount it in the `/etc/semaphore` directory on the container. For example, you could add the following lines to your `docker-compose.yml` file:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

The packages specified in the requirements file will be installed into the bundled Ansible virtual environment every time the container starts. The same mount works for the `semaphoreui/runner` image. See [Installing Additional Python Dependencies](/admin-guide/installation/docker#installing-additional-python-dependencies) for details and a custom-image alternative.

For more information about Python requirements files, see the [Pip Requirements File Format reference](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
