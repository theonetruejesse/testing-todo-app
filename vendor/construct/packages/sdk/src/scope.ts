import type {
  OperationDeclaration,
  ProjectScopeDeclaration,
} from "@construct/authority-manifest/manifest";

export type {
  OperationDeclaration,
  ProjectScopeDeclaration,
  SurfaceDeclaration,
} from "@construct/authority-manifest/manifest";

export function defineConstructScope<const T extends ProjectScopeDeclaration>(scope: T): T {
  return scope;
}

export function defineConstructOperations<const T extends readonly OperationDeclaration[]>(
  operations: T,
): T {
  return operations;
}
