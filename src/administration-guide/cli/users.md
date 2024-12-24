<div class="breadcrumbs">
    <a href="/administration-guide/runners">CLI</a>
    → Users
</div>

# Users

Using CLI you can add, remove or change user.

```
semaphore user --help
```

## How to add admin user
```
semaphore user add --admin --login newAdmin --email new-admin@example.com --name "New Admin" --password "New$Password"
```

## How to change user password
```
semaphore user change-by-login --login myAdmin --password "New$Password"
```
