export class ConstructCapabilityBindingError extends Error {
    code = "construct.capability.missing-handler";
    constructor(kind, capabilityId) {
        super(`No Construct ${kind} handler is registered for ${capabilityId}.`);
        this.name = "ConstructCapabilityBindingError";
    }
}
// Capability ids are authority, not transport configuration. The host must
// bind each approved id explicitly instead of the SDK guessing an endpoint.
export function requireConstructCapabilityHandler(handler, kind, capabilityId) {
    if (!handler)
        throw new ConstructCapabilityBindingError(kind, capabilityId);
    return handler;
}
//# sourceMappingURL=capability-bindings.js.map