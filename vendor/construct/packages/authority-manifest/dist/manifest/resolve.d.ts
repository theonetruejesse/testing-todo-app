import type { ConstructManifestDocument } from "./document.js";
import type { ResolvedSurface, SurfaceMetadata } from "./primitives/product/surface.js";
import type { FilePattern, PackageScriptName } from "./primitives/shared.js";
export type EffectiveFilePermission = "read" | "read-write" | "denied";
export type ResolvedFilePermission = {
    pattern: FilePattern;
    permission: EffectiveFilePermission;
    source: "scope" | "surface";
    sourceId?: string;
};
export type ResolvedScriptPermissions = {
    allow: PackageScriptName[];
    review: PackageScriptName[];
    deny: PackageScriptName[];
};
export type AuthorityResolutionFinding = {
    code: "surface.file-outside-scope" | "surface.file-denied-by-scope" | "surface.file-shared-by-surfaces";
    severity: "warning";
    surfaceId: string;
    path: FilePattern;
    message: string;
};
export type ResolvedAuthority = {
    files: ResolvedFilePermission[];
    scripts: ResolvedScriptPermissions;
    findings: AuthorityResolutionFinding[];
};
export type ResolveConstructManifestInput = {
    manifest: ConstructManifestDocument;
    surfaceMetadata?: Record<string, SurfaceMetadata>;
};
export type ResolvedConstructManifestDocument = Omit<ConstructManifestDocument, "surfaces"> & {
    surfaces: ResolvedSurface[];
    resolved: ResolvedAuthority;
};
export declare function resolveConstructManifest(input: ResolveConstructManifestInput): ResolvedConstructManifestDocument;
export declare function additiveRootForSurface(surfaceId: string): FilePattern;
//# sourceMappingURL=resolve.d.ts.map