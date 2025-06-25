<div class="breadcrumbs">
    <a href="/administration-guide/runners">CLI</a>
    → Database migrations
</div>

# Database migrations

Using CLI you can apply database migrations or undo them.

```
semaphore migrations --help
```

## Applying migrations

### Applying all migrations
```
semaphore migrate
```

### Applying migrations to specific version

```
semaphore migrate --apply-to <version>
```

## Rolling back migrations

```
semaphore migrate --undo-to <version>
```