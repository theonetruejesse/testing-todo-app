"use client";

import {
  ConstructNextProvider,
  type ConstructNextProviderProps,
} from "@construct/sdk/next/client";
import type { ConstructJsonValue } from "@construct/sdk/react";
import type { ReactNode } from "react";

type JsonRecord = Record<string, ConstructJsonValue>;

const resourceHandlers: NonNullable<ConstructNextProviderProps["resourceHandlers"]> = {
  "todos.list": async () => {
    const response = await fetch("/api/todos");
    if (!response.ok) throw new Error("Failed to load todos.");
    return (await response.json()) as ConstructJsonValue;
  },
};

const actionInvalidations = {
  "todos.create": ["todos.list"],
  "todos.delete": ["todos.list"],
  "todos.update": ["todos.list"],
};

const actionHandlers: NonNullable<ConstructNextProviderProps["actionHandlers"]> = {
  "todos.create": async (input) => {
    const response = await fetch("/api/todos", {
      body: JSON.stringify(input),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to create todo.");
    return (await response.json()) as ConstructJsonValue;
  },
  "todos.delete": async (input) => {
    const id = todoId(input, "todos.delete");
    const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete todo.");
    return null;
  },
  "todos.update": async (input) => {
    const id = todoId(input, "todos.update");
    const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
      body: JSON.stringify(asRecord(input)),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to update todo.");
    return (await response.json()) as ConstructJsonValue;
  },
};

export function TodoConstructProvider({ children }: { children: ReactNode }) {
  return (
    <ConstructNextProvider
      actionHandlers={actionHandlers}
      actionInvalidations={actionInvalidations}
      resourceHandlers={resourceHandlers}
    >
      {children}
    </ConstructNextProvider>
  );
}

function todoId(input: ConstructJsonValue, capabilityId: string): string {
  const body = asRecord(input);
  const value = body.id;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${capabilityId} requires id.`);
  }
  return value;
}

function asRecord(value: ConstructJsonValue): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}
