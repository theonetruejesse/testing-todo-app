"use client";

import { ConstructProvider } from "@construct/sdk/react";
import type { ReactNode } from "react";

type ConstructJsonValue =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: ConstructJsonValue }
  | readonly ConstructJsonValue[];

type JsonRecord = Record<string, ConstructJsonValue>;

export function LocalConstructProvider({ children }: { children: ReactNode }) {
  return (
    <ConstructProvider
      actionInvalidations={{
        "todos.create": ["todos.list"],
        "todos.update": ["todos.list"],
        "todos.delete": ["todos.list"],
      }}
      resolveRuntimeArtifact={async (input) => {
        const response = await fetch("/api/construct/runtime-artifacts/resolve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error(`Construct runtime artifact resolution failed with ${response.status}.`);
        }

        return await response.json();
      }}
      resourceHandlers={{
        "todos.list": async () => {
          const response = await fetch("/api/todos");
          if (!response.ok) throw new Error("Failed to load todos.");
          const body = (await response.json()) as { todos: ConstructJsonValue };
          return body.todos;
        },
      }}
      actionHandlers={{
        "todos.create": async (input) => {
          const response = await fetch("/api/todos", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(input),
          });
          if (!response.ok) throw new Error("Failed to create todo.");
          const body = (await response.json()) as { todo: ConstructJsonValue };
          return body.todo;
        },
        "todos.update": async (input) => {
          const body = asRecord(input);
          const id = stringValue(body.id ?? body.todoId);
          if (!id) throw new Error("todos.update requires id or todoId.");

          const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!response.ok) throw new Error("Failed to update todo.");
          const result = (await response.json()) as { todo: ConstructJsonValue };
          return result.todo;
        },
        "todos.delete": async (input) => {
          const body = asRecord(input);
          const id = stringValue(body.id ?? body.todoId);
          if (!id) throw new Error("todos.delete requires id or todoId.");

          const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Failed to delete todo.");
          return { ok: true };
        },
      }}
    >
      {children}
    </ConstructProvider>
  );
}

function asRecord(value: ConstructJsonValue): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function stringValue(value: ConstructJsonValue | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
