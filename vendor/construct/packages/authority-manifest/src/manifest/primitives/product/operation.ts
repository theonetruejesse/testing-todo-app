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
  invalidates?: ConstructId[];
};

export type OperationDataSensitivity = "public" | "internal" | "confidential" | "restricted";
export type OperationSchema = {
  type?: "array" | "boolean" | "integer" | "null" | "number" | "object" | "string";
  description?: string;
  format?: string;
  enum?: Array<boolean | number | string | null>;
  const?: boolean | number | string | null;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  properties?: Record<string, OperationSchema>;
  required?: string[];
  items?: OperationSchema;
  additionalProperties?: boolean;
  anyOf?: OperationSchema[];
};
export type OperationSemantics = {
  audience?: string;
  useCases?: string[];
  dataSensitivity?: OperationDataSensitivity;
};

export type OperationDeclaration = {
  id: ConstructId;
  title: string;
  description?: string;
  semantics?: OperationSemantics;
  inputSchema?: OperationSchema;
  outputSchema?: OperationSchema;
} & (ResourceOperation | ActionOperation);
