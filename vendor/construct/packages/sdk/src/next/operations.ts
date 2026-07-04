import type { OperationDeclaration } from "@construct/authority-manifest/manifest";

export type RouteOperationMap = Record<string, OperationDeclaration>;

// Host-authored Next route annotation. The route handlers stay normal Next
// exports; Gatekeeper scans this object to discover exposed product operations.
export function defineRouteOperations<const T extends RouteOperationMap>(operations: T): T {
  return operations;
}
