# Installation

You can install Semaphore in 4 ways:

* [Snap (deprecated)](./installation/snap)
* [Package manager](./installation/package-manager)
* [Docker](./installation/docker)
* [Binary file](./installation/binary-file)

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
