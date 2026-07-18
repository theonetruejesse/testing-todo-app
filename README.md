# Test Todo App

A minimal public-repo-ready Next.js todo app for testing sandbox runtime flows.

It has:

- A browser UI at `/`
- Todo API routes under `/api/todos`
- In-memory server-side todo storage
- Scripts for install, lint, build, and container-friendly dev startup

## Local run

```sh
pnpm install
pnpm check
pnpm build
pnpm dev
```

Open `http://localhost:3000`.

## Local Construct runtime surfaces

The app wraps its root layout with `LocalConstructProvider`. When local
Construct services are running, `<Surface id="todos.main">` asks the app's
same-origin server route for the artifact assigned to this deployment target:

```txt
http://localhost:3000/api/construct/runtime-artifacts/resolve
```

Copy `.env.example` to `.env.local` for local integration. The target secret and
Platform API URL are server-only; generated artifact objects are revalidated and
proxied through this app rather than exposing deployment credentials to the browser.

### Selected-version preview

`CONSTRUCT_RUNTIME_PREVIEWS_ENABLED=true` enables the managed iframe preview
consumer. Platform opens a fresh document with a short-lived selector in
`#construct-preview=<opaque selector>`. Client instrumentation captures it before
hydration and immediately removes it from the address bar. The selector stays only
in that document's memory and same-origin POST bodies.

The host re-resolves the selector for the descriptor and every module/style object,
then creates document-local Blob URLs. Expired, revoked, or tampered selectors fail
closed and never fall back to the active production assignment. The default-off path
continues to use the existing active resolver and object GET routes unchanged.

After the generated subtree commits successfully, the iframe posts a non-secret
`construct:runtime-ready` fingerprint to its parent. It contains the source,
artifact/version ID, surface, content hash, and host build identity; it never contains
the selector or deployment target secret.

`CONSTRUCT_PLATFORM_WEB_ORIGIN` is required with previews. The exact origin is
used both as the `postMessage` target and the CSP `frame-ancestors` source; wildcard
parent messaging is not supported.

## Sandbox test commands

These are the exact commands a sandbox should be able to run after cloning the repo.

```sh
pnpm install
pnpm check
pnpm build
pnpm dev --hostname 0.0.0.0 --port 3000
```

For npm-only environments:

```sh
npm install
npm run check
npm run build
npm run dev -- --hostname 0.0.0.0 --port 3000
```

The important sandbox detail is `--hostname 0.0.0.0`; it lets remote container port forwarding reach the Next.js dev server.

## API

```txt
GET    /api/todos
POST   /api/todos
PATCH  /api/todos/:id
DELETE /api/todos/:id
```

Todo data is intentionally in-memory. Restarting the dev server resets it.

## Publish to GitHub

Create an empty GitHub repository, then run:

```sh
git remote add origin git@github.com:<your-user>/<your-repo>.git
git branch -M main
git push -u origin main
```
