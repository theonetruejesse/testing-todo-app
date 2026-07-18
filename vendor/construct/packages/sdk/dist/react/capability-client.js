export function createHandlerCapabilityBinding(input) {
    return {
        async invoke(invocation) {
            if (invocation.kind === "resource") {
                const handler = input.resourceHandlers?.[invocation.capabilityId];
                if (!handler)
                    throw missingBinding(invocation);
                return { data: await handler(invocation.input) };
            }
            const handler = input.actionHandlers?.[invocation.capabilityId];
            if (!handler)
                throw missingBinding(invocation);
            return {
                data: await handler(invocation.input ?? null),
                invalidates: input.actionInvalidations?.[invocation.capabilityId] ?? [],
            };
        },
    };
}
export function createMockCapabilityBinding(input) {
    const operations = new Map(input.operations.map((operation) => [operation.operationId, operation]));
    return {
        async invoke(invocation) {
            const operation = operations.get(invocation.capabilityId);
            if (!operation)
                throw missingBinding(invocation);
            const scenario = operation.scenarios.find((candidate) => candidate.id === input.scenarioId) ??
                operation.scenarios.find((candidate) => candidate.id === "default");
            if (!scenario)
                throw new Error(`No fixture scenario exists for ${invocation.capabilityId}.`);
            if (input.delayMs)
                await delay(input.delayMs);
            if (scenario.outcome === "error") {
                throw Object.assign(new Error(scenario.error.message), { code: scenario.error.code });
            }
            return { data: scenario.data, invalidates: operation.invalidates ?? [] };
        },
    };
}
function missingBinding(invocation) {
    return new Error(`No Construct ${invocation.kind} binding is registered for ${invocation.capabilityId}.`);
}
function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
//# sourceMappingURL=capability-client.js.map