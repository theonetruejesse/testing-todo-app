import { defineRouteOperations } from "@construct/sdk/next";
import { NextRequest, NextResponse } from "next/server.js";
import { z } from "zod";
import { createTodo, listTodos } from "./store.ts";

const todoSchema = z.object({
  id: z.string().uuid().describe("Stable todo identifier"),
  title: z.string().min(1).max(120).describe("Short description of the work item"),
  completed: z.boolean().describe("Whether the work item is complete"),
  priority: z.boolean().describe("Whether the work item is marked as a priority"),
});

const createTodoInputSchema = z.object({
  title: z.string().trim().min(1).max(120).describe("Title of the new work item"),
  priority: z.boolean().optional().describe("Whether the new work item is a priority"),
});

export const operations = defineRouteOperations({
  GET: {
    kind: "resource",
    id: "todos.list",
    title: "List todos",
    description: "Returns todo items visible to the current user.",
    semantics: {
      audience: "Individual contributors",
      useCases: ["Plan current work", "Review completed work"],
      dataSensitivity: "internal",
    },
    input: z.object({}),
    output: z.array(todoSchema),
  },
  POST: {
    kind: "action",
    id: "todos.create",
    title: "Create todo",
    description: "Creates a new incomplete todo item.",
    semantics: {
      audience: "Individual contributors",
      useCases: ["Capture a new work item"],
      dataSensitivity: "internal",
    },
    input: createTodoInputSchema,
    output: todoSchema,
    invalidates: ["todos.list"],
  },
});

export async function GET() {
  // The wire shape intentionally matches the declared operation output. This
  // keeps generated fixtures interchangeable with responses from the real API.
  return NextResponse.json(listTodos());
}

export async function POST(request: NextRequest) {
  const input = createTodoInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: "invalid todo input" }, { status: 400 });
  }

  return NextResponse.json(createTodo(input.data.title, input.data.priority), { status: 201 });
}
