# Construct Runtime

`@construct/runtime` is the generated-artifact facade package blessed by the
React DSL validator. Generated TSX imports Construct primitives from this
package instead of importing host clients, TanStack libraries, router adapters,
browser APIs, or design-system internals directly.

The current implementation is a typed contract with inert placeholders. Host
runtime loading will provide the real behavior for resources, actions, forms,
navigation, formatting, and environment data. Pure helpers such as
`constructClassNames` and `constructRange` are implemented here because they do
not require host authority.

Gatekeeper imports `@construct/runtime/policy` so the validator allowlist stays
linked to the facade package exports.

Host loaders can import `loadConstructArtifactModule` from
`@construct/runtime/loader`. Compiled artifacts read React, `react/jsx-runtime`,
and Construct primitives through the `Symbol.for("construct.artifactRuntime")`
slot during dynamic import, so host application bundlers do not compile
generated surface code.
