# Upgrading

There are 4 ways for upgraging Semaphore:

* Snap
* Package manager
* Docker
* Binary

### Snap

Use the following command for upgrading Semaphore to the latest stable version:

```
sudo snap refresh semaphore
```

### Package manager

Download package file from [Releases page](https://github.com/ansible-semaphore/semaphore/releases).

&#x20;`*.deb` for Debian and Ubuntu, `*.rpm` for CentOS and RedHat.&#x20;

Install it using the package manager.

{% tabs %}
{% tab title="Debian / Ubuntu (x64)" %}
```
wget https://github.com/ansible-semaphore/semaphore/releases/\
download/v2.8.49/semaphore_2.8.49_linux_amd64.deb

sudo dpkg -i semaphore_2.8.49_linux_amd64.deb
```
{% endtab %}

{% tab title="Debian / Ubuntu (ARM64)" %}
```
wget https://github.com/ansible-semaphore/semaphore/releases/\
download/v2.8.49/semaphore_2.8.49_linux_arm64.deb

sudo dpkg -i semaphore_2.8.49_linux_arm64.deb
```
{% endtab %}

{% tab title="CentOS (x64)" %}
```
wget https://github.com/ansible-semaphore/semaphore/releases/\
download/v2.8.49/semaphore_2.8.49_linux_amd64.rpm

sudo yum install semaphore_2.8.49_linux_amd64.rpm
```
{% endtab %}

{% tab title="CentOS (ARM64)" %}
```
wget https://github.com/ansible-semaphore/semaphore/releases/\
download/v2.8.49/semaphore_2.8.49_linux_arm64.rpm

sudo yum install semaphore_2.8.49_linux_arm64.rpm
```
{% endtab %}
{% endtabs %}

### Docker

{% hint style="info" %}
Coming soon
{% endhint %}

### Binary

Download `*.tar.gz` for your platform from [Releases page](https://github.com/ansible-semaphore/semaphore/releases). Unpack binary to the directory where your old Semaphore binary is located.

{% tabs %}
{% tab title="Linux (x64)" %}
```
wget https://github.com/ansible-semaphore/semaphore/releases/\
download/v2.8.49/semaphore_2.8.49_linux_amd64.tar.gz

tar xf semaphore_2.8.49_linux_amd64.tar.gz
```
{% endtab %}

{% tab title="Linux (ARM64)" %}
```
wget https://github.com/ansible-semaphore/semaphore/releases/\
download/v2.8.49/semaphore_2.8.49_linux_arm64.tar.gz

tar xf semaphore_2.8.49_linux_arm64.tar.gz
```
{% endtab %}

{% tab title="Windows (x64)" %}
```
Invoke-WebRequest `
-Uri ("https://github.com/ansible-semaphore/semaphore/releases/" +
      "download/v2.8.49/semaphore_2.8.49_windows_amd64.zip") `
-OutFile semaphore.zip

Expand-Archive -Path semaphore.zip  -DestinationPath ./
```
{% endtab %}
{% endtabs %}

