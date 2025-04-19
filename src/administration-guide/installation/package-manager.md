<div class="breadcrumbs">
    <a href="/administration-guide/installation">Installation</a>
    → Package manager
</div>

# Package manager

<div class="warning">
  Look into the <a href="./../installation_manually.md">manual installation</a> on how to set-up your Python/Ansible/Systemd environment!
</div>


Download package file from [Releases page](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` for Debian and Ubuntu, `*.rpm` for CentOS and RedHat.&#x20;

Here are several installation commands, depending on the package manager:


{{#tabs }}

{{#tab name="Debian / Ubuntu (x64)"}}
```bash
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.13.14/semaphore_2.13.14_linux_amd64.deb

sudo dpkg -i semaphore_2.13.14_linux_amd64.deb
```
{{#endtab }}

{{#tab name="Debian / Ubuntu (ARM64)" }}
```bash
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.13.14/semaphore_2.13.14_linux_arm64.deb

sudo dpkg -i semaphore_2.13.14_linux_arm64.deb
```
{{#endtab }}

{{#tab name="CentOS (x64)" }}
```bash
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.13.14/semaphore_2.13.14_linux_amd64.rpm

sudo yum install semaphore_2.13.14_linux_amd64.rpm
```
{{#endtab }}

{{#tab name="CentOS (ARM64)" }}
```bash
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.13.14/semaphore_2.13.14_linux_arm64.rpm

sudo yum install semaphore_2.13.14_linux_arm64.rpm
```
{{#endtab }}

{{#endtabs }}

Setup Semaphore by using the following command:

```
semaphore setup
```

Now you can run Semaphore:

```
semaphore server --config=./config.json
```

Semaphore will be available via this URL [https://localhost:3000](https://localhost:3000).

----
