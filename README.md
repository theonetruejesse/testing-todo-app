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
remain server-only. A development target uses the native host by default and
`?construct-version=<versionId>` for an exact draft preview. A production
target uses its assigned release by default and
`?construct=<releaseId>` for an exact promoted release.

Each host environment needs one `CONSTRUCT_API_KEY` issued by its matching
Construct runtime target. The key identifies the project and environment and
must remain server-only. Construct shows it only when the target is created or
rotated.

Construct owns the stable cloud origins used by the SDK. Local dogfood can set
`CONSTRUCT_INTERNAL_PLATFORM_API_URL=http://127.0.0.1:4100` so the development
host resolves versions from the locally running control plane. Deployed
customer hosts should omit that internal override.

Internal dogfood deployments also use that endpoint to select the one Construct
control plane permitted to frame the host. Loopback and
`https://api-dev.thejesselee.com` permit `http://localhost:4200`;
`https://api.thejesselee.com` permits `https://app.thejesselee.com`. Unknown
configured origins fail closed during configuration. This keeps the production
script policy independent: only a local Next.js development process enables
`unsafe-eval`.

Opening a deployment directly proves its top-level route, but does not prove
that Construct can render it in the published Home card. The host CSP must
permit the active control-plane origin for that iframe qualification.

`src/instrumentation-client.ts` calls `captureConstructRuntimeSelection` before
React mounts. This captures the initial URL selector once, so later client-side
navigation cannot silently swap the runtime rendered by an already-mounted
surface. The host does not resolve selectors itself.

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
