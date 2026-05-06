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
