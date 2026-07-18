# @construct/sdk

`@construct/sdk` is the host-facing authoring package.

Its product job is to make host setup small and stable: mark controlled
surfaces, declare or confirm product operations, provide host identity and
runtime bindings, and let Construct serve developer-approved Managed Variants
without adding customer-specific source to the host repository.

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

<Surface
  id="todos.main"
  title="Todo List"
  description="Helps contributors organize and complete current work."
  audience="Individual contributors"
  useCases={["Plan work", "Track completion"]}
>
  <TodoApp />
</Surface>;
```

At runtime, hosts should wrap the app with `ConstructProvider` from
`@construct/sdk/react`. `Surface` remains the same host-authored marker
Gatekeeper scans, but it can also resolve and load an approved Construct runtime
artifact when the provider supplies `resolveRuntimeArtifact`. The same provider
also maps approved Construct resource/action ids onto host-owned APIs.

The initial production loader is `trusted-same-realm`. An approved restricted
React artifact executes as trusted host frontend code and therefore is not
browser-contained. Hosts must approve an exact artifact/version, authority
package, capability binding set, and audience; retain fallback and revocation;
and authorize every backend operation independently. The future
`isolated-iframe` profile preserves the same SDK contracts while changing the
loader and capability transport.

Every resource and action used by an artifact must have an explicit host
handler. A missing handler is a surface integration failure and prevents the
artifact from mounting; capability ids alone are not enough to infer an HTTP
method, route, authentication policy, or response projection. Standalone
artifact viewers therefore need a portable, authority-bound capability
transport contract before they can execute host operations. They must not guess
routes from ids such as `todos.list`.

`ConstructProvider` normalizes handlers behind a `CapabilityBinding`. Generated
artifacts always invoke stable capability ids; the configured binding decides
whether those calls use synthetic fixtures, local host handlers, or a future
authenticated relay. Existing `resourceHandlers` and `actionHandlers` remain a
compatibility authoring API.

```tsx
// src/app/construct-provider.tsx
"use client";

import { ConstructProvider } from "@construct/sdk/react";

const platformApiUrl = process.env.NEXT_PUBLIC_CONSTRUCT_PLATFORM_API_URL;
if (!platformApiUrl) {
  throw new Error("NEXT_PUBLIC_CONSTRUCT_PLATFORM_API_URL is required.");
}

export function LocalConstructProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConstructProvider
      resolveRuntimeArtifact={async (input) => {
        const response = await fetch(`${platformApiUrl}/runtime-artifacts/resolve`, {
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

`NEXT_PUBLIC_CONSTRUCT_PLATFORM_API_URL` is the portable host contract. Local
host development may set it to a local Platform API, while remote sandbox
launchers must inject a public HTTPS base. Host source should not hard-code a
loopback runtime-artifact endpoint; a remote browser interprets `localhost` as
its own machine and cannot reach the Construct developer process.

```ts
// src/app/api/todos/route.ts
import { defineRouteOperations } from "@construct/sdk/next";
import { z } from "zod";

const todoSchema = z.object({
  id: z.string().uuid().describe("Stable todo identifier"),
  title: z.string().min(1).describe("Short description of the work item"),
  completed: z.boolean().describe("Whether the work is complete"),
});

export const operations = defineRouteOperations({
  GET: {
    kind: "resource",
    id: "todos.list",
    title: "List todos",
    description: "Returns todo items visible to the current user.",
    semantics: {
      audience: "Individual contributors",
      useCases: ["Plan current work", "Review completed work"],
      dataSensitivity: "internal",
    },
    input: z.object({ status: z.enum(["open", "completed"]).optional() }),
    output: z.array(todoSchema),
  },
  POST: {
    kind: "action",
    id: "todos.create",
    title: "Create todo",
    description: "Creates a new incomplete todo item.",
    input: z.object({ title: z.string().min(1).max(120) }),
    output: todoSchema,
    invalidates: ["todos.list"],
  },
});
```

Semantic fields are optional. Zod descriptions and constraints improve fixture
generation and later product suggestions, while Gatekeeper preserves a bounded
portable schema without executing the host route module. Dynamic schema logic
outside the supported static subset is reported during permission compilation.

## Notes

These helpers are authoring markers. They are intentionally thin. Gatekeeper is
responsible for scanning the repo and resolving them into authority metadata.
The long-term project setup goal is confirmation-oriented: framework adapters and
repository analysis should propose surfaces and operations automatically so a
host developer reviews a small integration instead of maintaining duplicate
configuration.
