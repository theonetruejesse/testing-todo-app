# @construct/authority-manifest

This package owns the canonical Construct authority manifest types and pure
resolution helpers.

Current host-authored sections:

- `scope`: project-wide read universe and package script permissions
- `surfaces`: product/code areas that promote scoped files to writable
- `operations`: product behaviors, split into resources and actions

Gatekeeper discovers project metadata and calls this package's resolver to
produce the concrete manifest-lock-style authority document.

## Current Shape

Hosts do not author the full resolved manifest directly. They author small SDK
markers:

- `construct.scope.ts` through `defineConstructScope`
- React surfaces through `<Surface />`
- Next route operations through `defineRouteOperations`

Gatekeeper enriches those markers with discovered routes, entrypoints, files,
runtime metadata, and operation lists.

Resolution is scope-first: a surface never creates global authority. A
discovered surface file becomes `read-write` only if it is already readable by
`scope.read.allow` and not blocked by `scope.read.deny`. Out-of-scope surface
files, denied files, and files discovered by multiple surfaces produce resolver
findings instead of write authority.

## Still Needed

- Validation findings for duplicate ids and malformed declarations.
- Stronger canonical hashing.
- Resolved manifest persistence.
- Post-run diff validation helpers.
- Future policy sections for imports, network, dependencies, secrets, artifacts,
  and runtime loading.
