import type { OperationDeclaration } from "./primitives/product/operation.js";
import { type ProjectScopeDeclaration } from "./primitives/product/scope.js";
import type { SurfaceDeclaration } from "./primitives/product/surface.js";
import type { ConstructAppIdentity } from "./primitives/project/identity.js";
import type { ConstructRuntimeIdentity } from "./primitives/project/runtime.js";
import { type ConstructManifestVersion, type ManifestMetadata } from "./primitives/shared.js";
export type ConstructManifestDocument = {
    manifestVersion: ConstructManifestVersion;
    identity: ConstructAppIdentity;
    runtime: ConstructRuntimeIdentity;
    scope: ProjectScopeDeclaration;
    surfaces: SurfaceDeclaration[];
    operations: OperationDeclaration[];
    metadata?: ManifestMetadata;
};
export type ConstructManifestInput = Omit<ConstructManifestDocument, "manifestVersion" | "runtime" | "scope" | "surfaces" | "operations"> & {
    manifestVersion?: ConstructManifestVersion;
    runtime?: Partial<ConstructRuntimeIdentity>;
    scope?: ProjectScopeDeclaration;
    surfaces?: SurfaceDeclaration[];
    operations?: OperationDeclaration[];
};
export declare function defineConstructManifest(input: ConstructManifestInput): ConstructManifestDocument;
//# sourceMappingURL=document.d.ts.map