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

Use Node 24 (the repository includes `.nvmrc`), then run:

```sh
pnpm install
pnpm check
pnpm build
pnpm dev
```

Open `http://localhost:3000`.

## Construct integration

`src/app/page.tsx` declares the `todos.main` surface with `Surface` from
`@construct/sdk/react`. The host-owned masthead deliberately stays outside
that boundary; the composer, status, and todo list are the replaceable surface.
Todo API routes use `defineRouteOperations` from `@construct/sdk/next` to
describe the capabilities generated variants may invoke.

`src/app/construct-provider.tsx` contains the app-owned mapping from those
capability IDs to the todo APIs. `ConstructNextProvider` from
`@construct/sdk/next/client` owns the reusable runtime transport.

The route under `/api/construct/runtime-artifacts` is a deliberately thin
export from the SDK server adapter:

- `POST /api/construct/runtime-artifacts/resolve`

Copy `.env.example` to `.env.local` for local integration. Target credentials
remain server-only. The plain production URL resolves the active default;
`?construct=<releaseId>` resolves an exact immutable release. Draft previews
never load in this host and are delivered from Construct-owned preview origins.

`src/instrumentation-client.ts` calls `captureConstructReleaseSelection` before
React mounts. This captures the initial URL selector once, so later client-side
navigation cannot silently swap the release rendered by an already-mounted
surface. The host does not parse or resolve selectors itself.

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

The todo store is intentionally in-memory and begins with exactly three
application-owned examples. Their deterministic UUIDs make this fixed host
design recognizable; they are not generated fixtures or synthetic data. The
browser still loads state through `GET /api/todos`, so the native surface and
Managed Variants exercise the same backend contract. Runtime edits reset when
the development server restarts.

## Todo API

```txt
GET    /api/todos
POST   /api/todos
PATCH  /api/todos/:id
DELETE /api/todos/:id
```

Operation outputs and HTTP response bodies intentionally use the same raw
shapes: list returns `Todo[]`, create/update return `Todo`, and delete returns
an empty `204` response. This keeps generated fixtures aligned with the values
the runtime handlers expose.
