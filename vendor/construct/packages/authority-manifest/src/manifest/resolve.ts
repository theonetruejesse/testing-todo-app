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

export type ResolvedDependencyPolicy = {
  allow: boolean;
};

export type AuthorityResolutionFinding = {
  code:
    | "surface.file-outside-scope"
    | "surface.file-denied-by-scope"
    | "surface.file-shared-by-surfaces";
  severity: "warning";
  surfaceId: string;
  path: FilePattern;
  message: string;
};

export type ResolvedAuthority = {
  files: ResolvedFilePermission[];
  scripts: ResolvedScriptPermissions;
  dependencies: ResolvedDependencyPolicy;
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

// Pure compiler step. Services discover project facts, but this package defines
// how host-authored scope and surfaces become a concrete authority document.
export function resolveConstructManifest(
  input: ResolveConstructManifestInput,
): ResolvedConstructManifestDocument {
  const surfaceMetadata = input.surfaceMetadata ?? {};
  const surfaces = input.manifest.surfaces.map((surface) => ({
    ...surface,
    metadata: surfaceMetadata[surface.id] ?? {
      additiveRoot: additiveRootForSurface(surface.id),
      routes: [],
      entrypoints: [],
      files: [],
    },
  }));
  const scopeReadRules = input.manifest.scope.read.allow.map((pattern) => ({
    pattern,
    permission: "read" as const,
    source: "scope" as const,
  }));
  const scopeDenyRules = (input.manifest.scope.read.deny ?? []).map((pattern) => ({
    pattern,
    permission: "denied" as const,
    source: "scope" as const,
  }));
  const surfaceResolution = resolveSurfaceFileAuthority({
    surfaces,
    scopeAllow: input.manifest.scope.read.allow,
    scopeDeny: input.manifest.scope.read.deny ?? [],
  });

  return {
    ...input.manifest,
    surfaces,
    resolved: {
      files: [...scopeReadRules, ...scopeDenyRules, ...surfaceResolution.files],
      scripts: {
        allow: input.manifest.scope.scripts?.allow ?? [],
        review: input.manifest.scope.scripts?.review ?? [],
        deny: input.manifest.scope.scripts?.deny ?? [],
      },
      dependencies: {
        allow: input.manifest.scope.dependencies?.allow === true,
      },
      findings: surfaceResolution.findings,
    },
  };
}

function resolveSurfaceFileAuthority(input: {
  surfaces: ResolvedSurface[];
  scopeAllow: FilePattern[];
  scopeDeny: FilePattern[];
}): { files: ResolvedFilePermission[]; findings: AuthorityResolutionFinding[] } {
  const files: ResolvedFilePermission[] = [];
  const findings: AuthorityResolutionFinding[] = [];
  const surfaceIdsByFile = groupSurfaceIdsByFile(input.surfaces);

  for (const surface of input.surfaces) {
    files.push({
      pattern: `${surface.metadata.additiveRoot}/**`,
      permission: "read-write",
      source: "surface",
      sourceId: surface.id,
    });

    for (const filePath of surface.metadata.files) {
      if (firstMatchingPattern(input.scopeDeny, filePath)) {
        findings.push({
          code: "surface.file-denied-by-scope",
          severity: "warning",
          surfaceId: surface.id,
          path: filePath,
          message: `Surface "${surface.id}" discovered "${filePath}", but scope denies it.`,
        });
        continue;
      }

      if (!firstMatchingPattern(input.scopeAllow, filePath)) {
        findings.push({
          code: "surface.file-outside-scope",
          severity: "warning",
          surfaceId: surface.id,
          path: filePath,
          message: `Surface "${surface.id}" discovered "${filePath}", but scope does not allow reading it.`,
        });
        continue;
      }

      const sharingSurfaceIds = surfaceIdsByFile.get(filePath) ?? [];
      if (sharingSurfaceIds.length > 1) {
        findings.push({
          code: "surface.file-shared-by-surfaces",
          severity: "warning",
          surfaceId: surface.id,
          path: filePath,
          message: `Surface "${surface.id}" discovered shared file "${filePath}" with surfaces ${sharingSurfaceIds
            .filter((surfaceId) => surfaceId !== surface.id)
            .map((surfaceId) => `"${surfaceId}"`)
            .join(", ")}.`,
        });
        continue;
      }

      files.push({
        pattern: filePath,
        permission: "read-write",
        source: "surface",
        sourceId: surface.id,
      });
    }
  }

  return { files, findings };
}

export function additiveRootForSurface(surfaceId: string): FilePattern {
  const safeSurfaceId = surfaceId.replaceAll(/[^a-zA-Z0-9._-]/g, "-").replaceAll(/^-+|-+$/g, "");
  return `src/construct/surfaces/${safeSurfaceId || "surface"}`;
}

function groupSurfaceIdsByFile(surfaces: ResolvedSurface[]): Map<FilePattern, string[]> {
  const surfaceIdsByFile = new Map<FilePattern, string[]>();
  for (const surface of surfaces) {
    for (const filePath of new Set(surface.metadata.files)) {
      const surfaceIds = surfaceIdsByFile.get(filePath) ?? [];
      surfaceIds.push(surface.id);
      surfaceIdsByFile.set(filePath, surfaceIds);
    }
  }
  return surfaceIdsByFile;
}

function firstMatchingPattern(patterns: FilePattern[], value: string): FilePattern | undefined {
  return patterns.find((pattern) => matchesPattern(pattern, value));
}

function matchesPattern(pattern: FilePattern, value: string): boolean {
  if (pattern === value || pattern === "**") return true;
  if (pattern.endsWith("/**")) return value.startsWith(pattern.slice(0, -3));
  if (pattern.startsWith("**/")) {
    return value.endsWith(pattern.slice(3)) || value.includes(pattern.slice(2));
  }
  if (pattern.startsWith("*.")) return value.endsWith(pattern.slice(1));
  if (pattern.endsWith("*")) return value.startsWith(pattern.slice(0, -1));
  return false;
}
