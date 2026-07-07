# @construct/sdk

`@construct/sdk` is the host-facing authoring package.

- `@construct/sdk` exports `defineConstructScope` and
  `defineConstructOperations` for `construct.scope.ts`.
- `@construct/sdk/react` exports the transparent `Surface` wrapper that
  Gatekeeper scans from React source.
- `@construct/sdk/next` exports `defineRouteOperations` for Next route handlers.

Security semantics live in `@construct/authority-manifest`; Gatekeeper compiles
and validates them as a service.

## Example

```ts
// construct.scope.ts
import { defineConstructScope } from "@construct/sdk";

export default defineConstructScope({
  read: {
    allow: ["src/**", "package.json"],
    deny: [".env*", "node_modules/**", ".next/**"],
  },
  scripts: {
    allow: ["typecheck", "build"],
    review: ["lint"],
    deny: ["dev"],
  },
});
```

```tsx
// src/app/page.tsx
import { Surface } from "@construct/sdk/react";

<Surface id="todos.main" title="Todo List">
  <TodoApp />
</Surface>;
```

At runtime, hosts should wrap the app with `ConstructProvider` from
`@construct/sdk/react`. `Surface` remains the same host-authored marker
Gatekeeper scans, but it can also resolve and load an approved Construct runtime
artifact when the provider supplies `resolveRuntimeArtifact`. The same provider
also maps approved Construct resource/action ids onto host-owned APIs.

```tsx
// src/app/construct-provider.tsx
"use client";

import { ConstructProvider } from "@construct/sdk/react";

export function LocalConstructProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConstructProvider
      resolveRuntimeArtifact={async (input) => {
        const response = await fetch("http://localhost:4100/runtime-artifacts/resolve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        return await response.json();
      }}
      resourceHandlers={{
        "todos.list": async () => {
          const response = await fetch("/api/todos");
          return (await response.json()).todos;
        },
      }}
      actionHandlers={{
        "todos.create": async (input) => {
          const response = await fetch("/api/todos", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(input),
          });
          return (await response.json()).todo;
        },
      }}
    >
      {children}
    </ConstructProvider>
  );
}
```

```ts
// src/app/api/todos/route.ts
import { defineRouteOperations } from "@construct/sdk/next";

export const operations = defineRouteOperations({
  GET: { kind: "resource", id: "todos.list", title: "List todos" },
  POST: { kind: "action", id: "todos.create", title: "Create todo" },
});
```

## Notes

These helpers are authoring markers. They are intentionally thin. Gatekeeper is
responsible for scanning the repo and resolving them into authority metadata.
