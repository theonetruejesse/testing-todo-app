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
