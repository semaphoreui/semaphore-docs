# Upgrading

There are 4 ways for upgrading Semaphore:

* Package manager
* Docker
* Binary

### Package manager

Download a package file from [Releases page](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` for Debian and Ubuntu, `*.rpm` for CentOS and RedHat.&#x20;

Install it using the package manager.

```
wget https://github.com/semaphoreui/semaphore/releases/\

download/v2.15.0/semaphore_2.15.0_linux_amd64.deb

sudo dpkg -i semaphore_2.15.0_linux_amd64.deb
```

```
wget https://github.com/semaphoreui/semaphore/releases/\

download/v2.15.0/semaphore_2.15.0_linux_arm64.deb

sudo dpkg -i semaphore_2.15.0_linux_arm64.deb
```

```
wget https://github.com/semaphoreui/semaphore/releases/\

download/v2.15.0/semaphore_2.15.0_linux_amd64.rpm

sudo yum install semaphore_2.15.0_linux_amd64.rpm
```

```
wget https://github.com/semaphoreui/semaphore/releases/\

download/v2.15.0/semaphore_2.15.0_linux_arm64.rpm

sudo yum install semaphore_2.15.0_linux_arm64.rpm
```

### Docker

<div class="warning">
      Coming soon
</div>

### Binary

---

## Migrating from Snap to package/binary

Snap installation is deprecated. If you are migrating from Snap to a package or binary installation on the same host and were using BoltDB, ensure you move the BoltDB file and repositories directory and update the corresponding paths in `config.json` for `database.boltdb` and `tmp_path`. Also adjust file ownership for the service user (e.g., `semaphore`).
Download a `*.tar.gz` for your platform from [Releases page](https://github.com/semaphoreui/semaphore/releases). Unpack the binary to the directory where your old Semaphore binary is located.

```
wget https://github.com/semaphoreui/semaphore/releases/\

download/v2.15.0/semaphore_2.15.0_linux_amd64.tar.gz

tar xf semaphore_2.15.0_linux_amd64.tar.gz
```

```
wget https://github.com/semaphoreui/semaphore/releases/\

download/v2.15.0/semaphore_2.15.0_linux_arm64.tar.gz

tar xf semaphore_2.15.0_linux_arm64.tar.gz
```

```
Invoke-WebRequest `
-Uri ("https://github.com/semaphoreui/semaphore/releases/" +
      "download/v2.15.0/semaphore_2.15.0_windows_amd64.zip") `
-OutFile semaphore.zip

Expand-Archive -Path semaphore.zip  -DestinationPath ./
```

