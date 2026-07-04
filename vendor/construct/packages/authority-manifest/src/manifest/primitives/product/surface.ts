import type { ConstructId, EntrypointPath, FilePattern, RoutePattern } from "../shared.js";

// Host-authored. A surface is a product/code area the agent may change.
// Project-wide read access lives in scope; discovered surfaces are write
// boundaries.
export type SurfaceDeclaration = {
  id: ConstructId;
  title: string;
  description?: string;
};

export type SurfaceMetadata = {
  additiveRoot: FilePattern;
  routes: RoutePattern[];
  entrypoints: EntrypointPath[];
  files: FilePattern[];
};

// Compiler-enriched. Resolved surfaces keep the host-authored declaration intact
// and add discovered metadata that Gatekeeper can show or pass to an agent.
export type ResolvedSurface = SurfaceDeclaration & {
  metadata: SurfaceMetadata;
};
