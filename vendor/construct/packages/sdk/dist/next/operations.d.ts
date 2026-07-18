import type { OperationDeclaration, OperationSchema } from "@construct/authority-manifest/manifest";
type HostSchema = OperationSchema | object;
export type RouteOperationDeclaration = Omit<OperationDeclaration, "inputSchema" | "outputSchema"> & {
    input?: HostSchema;
    output?: HostSchema;
};
export type RouteOperationMap = Record<string, RouteOperationDeclaration>;
export declare function defineRouteOperations<const T extends RouteOperationMap>(operations: T): T;
export {};
//# sourceMappingURL=operations.d.ts.map