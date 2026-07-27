# Test Todo App

A minimal Next.js application used to qualify Construct project setup, sandbox
lifecycles, Managed Variants, and runtime capability bindings.

The repository intentionally owns only application behavior:

- Todo UI and API routes
- The `todos.main` surface declaration
- Todo resource/action declarations and handlers
- Thin Next route exports for the Construct SDK host runtime

Generic preview selection, artifact proxying, CSP policy, readiness attestation,
and runtime React behavior live in `@construct/sdk`.

## Local run

```sh
pnpm install
pnpm check
pnpm build
pnpm dev
```

Open `http://localhost:3000`.

## Construct integration

`src/app/page.tsx` declares the `todos.main` surface. Todo API routes use
`defineRouteOperations` to describe the capabilities generated variants may
invoke.

`src/app/construct-provider.tsx` contains the app-owned mapping from those
capability IDs to the todo APIs. `ConstructNextProvider` owns the reusable
runtime transport.

The three routes under `/api/construct/runtime-artifacts` are deliberately thin
exports from the SDK server adapter:

- `POST /api/construct/runtime-artifacts/resolve`
- `POST /api/construct/runtime-artifacts/preview-object`
- `GET /api/construct/runtime-artifacts/objects/:artifactId/:kind`

Copy `.env.example` to `.env.local` for local integration. Target credentials
remain server-only. Selected-version preview selectors are short-lived,
document-scoped, removed from the address bar before hydration, and revalidated
for every private artifact object.

## Construct package boundary

The application consumes content-addressed packages from
`vendor/construct-packages`. These are immutable blueprint release artifacts,
not an editable copy of Construct source. Their SHA-256 values are recorded in
`manifest.json`.

The canonical Construct repository regenerates them with:

```sh
pnpm sdk:pack-consumer -- /absolute/path/to/testing-todo-app/vendor/construct-packages
```

Registry versions can replace the archives later without changing application
imports.

## Sandbox qualification

These commands must work after a clean Git clone:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm dev --hostname 0.0.0.0 --port 3000
```

The todo store is intentionally empty and in-memory. Restarting the development
server clears its records; the host does not seed examples that could be
mistaken for Construct-generated synthetic data.

## Todo API

```txt
GET    /api/todos
POST   /api/todos
PATCH  /api/todos/:id
DELETE /api/todos/:id
```
