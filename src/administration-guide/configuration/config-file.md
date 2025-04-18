
# Configuration file

## Creating configuration file

Semaphore uses a `config.json` file for its core configuration. You can generate this file interactively using built-in tools or through a web-based configurator.

### Generate via CLI

Use the following commands to generate the configuration file interactively:

* For the Semaphore server:
  ```
  semaphore setup
  ```
* For the Semaphore runner:
  ```
  semaphore runner setup
  ```
  
  <div class="warning">
    For more details about runner configuration, see the <a href="./../runners.md">Runners</a> section.
  </div>


### Generate via Web

Alternatively, you can use the web-based interactive configurator:
* [Server configurator](https://semaphoreui.com/install/binary/2_13/config)
* [Runner configurator](https://semaphoreui.com/install/binary/2_13/runner)

## Configuration file example

Semaphore uses a `config.json` configuration file with following content:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Configuration file usage

* For Semaphore server:

```bash
semaphore server --config ./config.json
```

* For Semaphore runner:

```bash
semaphore runner start --config ./config.json
```
