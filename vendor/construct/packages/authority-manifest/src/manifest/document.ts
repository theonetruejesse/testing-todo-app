import type { OperationDeclaration } from "./primitives/product/operation.js";
import { defaultProjectScope, type ProjectScopeDeclaration } from "./primitives/product/scope.js";
import type { SurfaceDeclaration } from "./primitives/product/surface.js";
import type { ConstructAppIdentity } from "./primitives/project/identity.js";
import type { ConstructRuntimeIdentity } from "./primitives/project/runtime.js";
import {
  CONSTRUCT_MANIFEST_VERSION,
  type ConstructManifestVersion,
  type ManifestMetadata,
} from "./primitives/shared.js";

export type ConstructManifestDocument = {
  manifestVersion: ConstructManifestVersion;
  identity: ConstructAppIdentity;
  runtime: ConstructRuntimeIdentity;
  scope: ProjectScopeDeclaration;
  surfaces: SurfaceDeclaration[];
  operations: OperationDeclaration[];
  metadata?: ManifestMetadata;
};

export type ConstructManifestInput = Omit<
  ConstructManifestDocument,
  "manifestVersion" | "runtime" | "scope" | "surfaces" | "operations"
> & {
  manifestVersion?: ConstructManifestVersion;
  runtime?: Partial<ConstructRuntimeIdentity>;
  scope?: ProjectScopeDeclaration;
  surfaces?: SurfaceDeclaration[];
  operations?: OperationDeclaration[];
};

// This is a construction helper, not a trust boundary. Validation should be a
// separate compiler step so we can keep "fill defaults" and "reject bad links"
// legible as different phases.
export function defineConstructManifest(input: ConstructManifestInput): ConstructManifestDocument {
  return {
    manifestVersion: input.manifestVersion ?? CONSTRUCT_MANIFEST_VERSION,
    identity: input.identity,
    runtime: {
      framework: input.runtime?.framework ?? "unknown",
      packageManager: input.runtime?.packageManager,
      appPath: input.runtime?.appPath,
    },
    scope: input.scope ?? defaultProjectScope(),
    surfaces: input.surfaces ?? [],
    operations: input.operations ?? [],
    metadata: input.metadata,
  };
}
