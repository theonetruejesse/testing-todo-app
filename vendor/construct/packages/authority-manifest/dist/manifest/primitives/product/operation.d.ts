import type { ConstructId } from "../shared.js";
export type OperationKind = "resource" | "action";
export type ResourceOperation = {
    kind: "resource";
};
export type ActionOperation = {
    kind: "action";
};
export type OperationDeclaration = {
    id: ConstructId;
    title: string;
    description?: string;
} & (ResourceOperation | ActionOperation);
//# sourceMappingURL=operation.d.ts.map