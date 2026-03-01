# Snap configuration

Snap configurations should be used for when Semaphore was installed via Snap.

To see a list of available options, use the following command:

```bash
sudo snap get semaphore
```

You can change each of these configurations. For example if you want to change Semaphore port, use following command:

```bash
sudo snap set semaphore port=4444
```

Don't forget to restart Semaphore after changing a configuration:

```bash
sudo snap restart semaphore
```
