import type { FilePattern, PackageScriptName } from "../shared.js";

// Host-authored. Scope is the project-wide baseline the host is willing to grant
// before any surface-specific permission is resolved.
export type ProjectReadScope = {
  allow: FilePattern[];
  deny?: FilePattern[];
};

export type PackageScriptScope = {
  allow?: PackageScriptName[];
  review?: PackageScriptName[];
  deny?: PackageScriptName[];
};

export type DependencyScope = {
  allow?: boolean;
};

export type ProjectScopeDeclaration = {
  read: ProjectReadScope;
  scripts?: PackageScriptScope;
  dependencies?: DependencyScope;
};

export function defaultProjectScope(): ProjectScopeDeclaration {
  return {
    read: {
      allow: [],
    },
  };
}
