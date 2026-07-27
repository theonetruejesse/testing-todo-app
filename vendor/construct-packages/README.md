# Construct consumer packages

These content-addressed archives are generated from the canonical Construct
monorepo with:

```sh
pnpm sdk:pack-consumer -- /absolute/path/to/testing-todo-app/vendor/construct-packages
```

`manifest.json` records the complete SHA-256 for every archive. This repository
consumes the archives as immutable packages; it does not mirror or edit
Construct SDK source.

Registry releases will replace this blueprint bridge without changing the
application-facing imports.
