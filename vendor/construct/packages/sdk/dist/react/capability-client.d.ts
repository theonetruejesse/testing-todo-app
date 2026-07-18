import type { ConstructJsonValue } from "@construct/runtime";
export type CapabilityInvocation = {
    capabilityId: string;
    kind: "action" | "resource";
    input?: ConstructJsonValue;
};
export type CapabilityResult = {
    data: unknown;
    invalidates?: string[];
};
export interface CapabilityBinding {
    invoke(invocation: CapabilityInvocation): Promise<CapabilityResult>;
}
export type CapabilityInvocationObserver = (invocation: CapabilityInvocation, result: {
    status: "success";
    data: unknown;
} | {
    status: "error";
    error: unknown;
}) => void;
export type HandlerCapabilityBindingInput = {
    actionHandlers?: Record<string, (input: ConstructJsonValue) => Promise<unknown>>;
    actionInvalidations?: Record<string, string[]>;
    resourceHandlers?: Record<string, (input: ConstructJsonValue | undefined) => Promise<unknown>>;
};
export type MockCapabilityOperation = {
    operationId: string;
    invalidates?: string[];
    scenarios: Array<{
        id: string;
        outcome: "success";
        data?: unknown;
    } | {
        id: string;
        outcome: "error";
        error: {
            code: string;
            message: string;
        };
    }>;
};
export declare function createHandlerCapabilityBinding(input: HandlerCapabilityBindingInput): CapabilityBinding;
export declare function createMockCapabilityBinding(input: {
    operations: MockCapabilityOperation[];
    scenarioId: string;
    delayMs?: number;
}): CapabilityBinding;
//# sourceMappingURL=capability-client.d.ts.map