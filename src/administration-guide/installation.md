# Installation

You can install Semaphore in multiple ways, depending on your operating system, environment, and preferences:

* **Package manager**<br>
  Install Semaphore using a native package for your distribution (e.g., apt for Debian/Ubuntu or dnf for RHEL-based systems). This is the easiest way to get started on Linux servers and integrates well with system services.<br>
  [Learn more »](./installation/package-manager)

* **Docker**<br>
  Run Semaphore as a container using Docker or Docker Compose. Ideal for fast setup, sandboxed environments, and CI/CD pipelines. Recommended for users who prefer infrastructure as code.<br>
  [Learn more »](./installation/docker)

* **Binary file**<br>
  Download a precompiled binary from the releases page. Great for manual installation or embedding in custom workflows. Works across Linux, macOS, and Windows (via WSL).<br>
  [Learn more »](./installation/binary-file)

* **Kubernetes (Helm chart)**<br>
  Deploy Semaphore into a Kubernetes cluster using Helm. Best suited for production-grade, scalable infrastructure. Supports easy configuration and upgrades via Helm values.<br>
  [Learn more »](./installation/k8s)

* **Snap (deprecated)**<br>
  Previously available as a Snap package. This method is deprecated and no longer maintained. Users are advised to switch to one of the supported methods above.<br>
  [Learn more »](./installation/snap)

See also:
* [Run as service](./installation/binary-file.md#run-as-a-service)
* [Manual installation](./installation_manually.md)

----


### Installing Additional Python Packages

Some Ansible modules and roles require additional python packages to run. To install additional python packages, create a `requirements.txt` file and mount it in the `/etc/semaphore` directory on the container. For example, you could add the following lines to your `docker-compose.yml` file:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

The packages specified in the requirements file will be installed when the container starts up.

For more information about Python requirements files, see the [Pip Requirements File Format reference](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
