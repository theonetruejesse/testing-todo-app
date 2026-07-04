import type { OperationDeclaration, ProjectScopeDeclaration } from "@construct/authority-manifest/manifest";
export type { OperationDeclaration, ProjectScopeDeclaration, SurfaceDeclaration, } from "@construct/authority-manifest/manifest";
export declare function defineConstructScope<const T extends ProjectScopeDeclaration>(scope: T): T;
export declare function defineConstructOperations<const T extends readonly OperationDeclaration[]>(operations: T): T;
//# sourceMappingURL=scope.d.ts.map