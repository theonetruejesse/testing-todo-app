import type { ConstructId } from "../shared.js";

// Host-authored. Operations are product behaviors the host intentionally exposes
// to agents. The kind keeps the first security distinction visible: resources
// are read behavior, actions mutate.
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
