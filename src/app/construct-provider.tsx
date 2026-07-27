"use client";

import {
  ConstructNextProvider,
  type ConstructNextProviderProps,
} from "@construct/sdk/next/client";
import type { ConstructJsonValue } from "@construct/sdk/react";
import type { ReactNode } from "react";

type JsonRecord = Record<string, ConstructJsonValue>;

interface LocalConstructProviderProps {
  children: ReactNode;
  hostBuildId: string;
  platformWebOrigin: string;
  previewEnabled: boolean;
}

const resourceHandlers: NonNullable<ConstructNextProviderProps["resourceHandlers"]> = {
  "todos.list": async () => {
    const response = await fetch("/api/todos");
    if (!response.ok) throw new Error("Failed to load todos.");
    const body = (await response.json()) as { todos: ConstructJsonValue };
    return body.todos;
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
    const body = (await response.json()) as { todo: ConstructJsonValue };
    return body.todo;
  },
  "todos.delete": async (input) => {
    const id = todoId(input, "todos.delete");
    const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete todo.");
    return { ok: true };
  },
  "todos.update": async (input) => {
    const id = todoId(input, "todos.update");
    const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
      body: JSON.stringify(asRecord(input)),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to update todo.");
    const body = (await response.json()) as { todo: ConstructJsonValue };
    return body.todo;
  },
};

export function LocalConstructProvider({
  children,
  hostBuildId,
  platformWebOrigin,
  previewEnabled,
}: LocalConstructProviderProps) {
  return (
    <ConstructNextProvider
      actionHandlers={actionHandlers}
      actionInvalidations={actionInvalidations}
      hostBuildId={hostBuildId}
      platformWebOrigin={platformWebOrigin}
      previewEnabled={previewEnabled}
      resourceHandlers={resourceHandlers}
    >
      {children}
    </ConstructNextProvider>
  );
}

function todoId(input: ConstructJsonValue, capabilityId: string): string {
  const body = asRecord(input);
  const value = body.id ?? body.todoId;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${capabilityId} requires id or todoId.`);
  }
  return value;
}

function asRecord(value: ConstructJsonValue): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}
