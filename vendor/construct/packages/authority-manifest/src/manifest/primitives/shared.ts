// Shared vocabulary. These are not standalone host-authored sections; they are
// the small names that project and product primitives build from.
export const CONSTRUCT_MANIFEST_VERSION = "construct.manifest.v1" as const;

export type ConstructManifestVersion = typeof CONSTRUCT_MANIFEST_VERSION;

// Construct ids are stable manifest-local names, not database ids. Other
// manifest sections refer to these ids so the compiler can link pieces together.
export type ConstructId = string;

// Paths are repo-relative by default. Gatekeeper can resolve them against a
// checked-out source snapshot, but the manifest should stay portable JSON.
export type RepoRelativePath = string;

// Globs are policy vocabulary, but the shared primitive lives here because
// surfaces, reads, writes, and validators will all reuse this path language.
export type FilePattern = string;

export type RoutePattern = string;
export type EntrypointPath = RepoRelativePath;
export type ModuleSpecifier = string;
export type UrlOrigin = string;
export type CommandName = string;
export type PackageScriptName = string;
export type PackageName = string;
export type SemverRange = string;

export type ManifestMetadata = Record<string, string>;

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type RuntimeFramework =
  | "next"
  | "react-router"
  | "vite-react"
  | "react"
  | "node"
  | "unknown";
