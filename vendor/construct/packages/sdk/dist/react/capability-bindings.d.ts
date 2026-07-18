export declare class ConstructCapabilityBindingError extends Error {
    readonly code = "construct.capability.missing-handler";
    constructor(kind: "action" | "resource", capabilityId: string);
}
export declare function requireConstructCapabilityHandler<THandler>(handler: THandler | undefined, kind: "action" | "resource", capabilityId: string): THandler;
//# sourceMappingURL=capability-bindings.d.ts.map