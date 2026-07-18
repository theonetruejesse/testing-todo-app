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

export type CapabilityInvocationObserver = (
  invocation: CapabilityInvocation,
  result: { status: "success"; data: unknown } | { status: "error"; error: unknown },
) => void;

export type HandlerCapabilityBindingInput = {
  actionHandlers?: Record<string, (input: ConstructJsonValue) => Promise<unknown>>;
  actionInvalidations?: Record<string, string[]>;
  resourceHandlers?: Record<string, (input: ConstructJsonValue | undefined) => Promise<unknown>>;
};

export type MockCapabilityOperation = {
  operationId: string;
  invalidates?: string[];
  scenarios: Array<
    | { id: string; outcome: "success"; data?: unknown }
    | { id: string; outcome: "error"; error: { code: string; message: string } }
  >;
};

export function createHandlerCapabilityBinding(
  input: HandlerCapabilityBindingInput,
): CapabilityBinding {
  return {
    async invoke(invocation) {
      if (invocation.kind === "resource") {
        const handler = input.resourceHandlers?.[invocation.capabilityId];
        if (!handler) throw missingBinding(invocation);
        return { data: await handler(invocation.input) };
      }
      const handler = input.actionHandlers?.[invocation.capabilityId];
      if (!handler) throw missingBinding(invocation);
      return {
        data: await handler(invocation.input ?? null),
        invalidates: input.actionInvalidations?.[invocation.capabilityId] ?? [],
      };
    },
  };
}

export function createMockCapabilityBinding(input: {
  operations: MockCapabilityOperation[];
  scenarioId: string;
  delayMs?: number;
}): CapabilityBinding {
  const operations = new Map(
    input.operations.map((operation) => [operation.operationId, operation]),
  );
  return {
    async invoke(invocation) {
      const operation = operations.get(invocation.capabilityId);
      if (!operation) throw missingBinding(invocation);
      const scenario =
        operation.scenarios.find((candidate) => candidate.id === input.scenarioId) ??
        operation.scenarios.find((candidate) => candidate.id === "default");
      if (!scenario) throw new Error(`No fixture scenario exists for ${invocation.capabilityId}.`);
      if (input.delayMs) await delay(input.delayMs);
      if (scenario.outcome === "error") {
        throw Object.assign(new Error(scenario.error.message), { code: scenario.error.code });
      }
      return { data: scenario.data, invalidates: operation.invalidates ?? [] };
    },
  };
}

function missingBinding(invocation: CapabilityInvocation): Error {
  return new Error(
    `No Construct ${invocation.kind} binding is registered for ${invocation.capabilityId}.`,
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
