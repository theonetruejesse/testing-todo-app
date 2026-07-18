import type { OperationDeclaration, OperationSchema } from "@construct/authority-manifest/manifest";

type HostSchema = OperationSchema | object;

export type RouteOperationDeclaration = Omit<
  OperationDeclaration,
  "inputSchema" | "outputSchema"
> & {
  // Zod schemas are accepted as host-side authoring values. Gatekeeper extracts
  // their supported static shape into the portable input/output schema fields.
  input?: HostSchema;
  output?: HostSchema;
};

export type RouteOperationMap = Record<string, RouteOperationDeclaration>;

// Host-authored Next route annotation. The route handlers stay normal Next
// exports; Gatekeeper scans this object to discover exposed product operations.
export function defineRouteOperations<const T extends RouteOperationMap>(operations: T): T {
  return operations;
}
