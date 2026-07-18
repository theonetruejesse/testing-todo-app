export class ConstructCapabilityBindingError extends Error {
  readonly code = "construct.capability.missing-handler";

  constructor(kind: "action" | "resource", capabilityId: string) {
    super(`No Construct ${kind} handler is registered for ${capabilityId}.`);
    this.name = "ConstructCapabilityBindingError";
  }
}

// Capability ids are authority, not transport configuration. The host must
// bind each approved id explicitly instead of the SDK guessing an endpoint.
export function requireConstructCapabilityHandler<THandler>(
  handler: THandler | undefined,
  kind: "action" | "resource",
  capabilityId: string,
): THandler {
  if (!handler) throw new ConstructCapabilityBindingError(kind, capabilityId);
  return handler;
}
