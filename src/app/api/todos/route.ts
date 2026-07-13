import { defineRouteOperations } from "@construct/sdk/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTodo, listTodos } from "./store";

const todoSchema = z.object({
  id: z.string().uuid().describe("Stable todo identifier"),
  title: z.string().min(1).max(120).describe("Short description of the work item"),
  completed: z.boolean().describe("Whether the work item is complete"),
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
    input: z.object({
      title: z.string().min(1).max(120).describe("Title of the new work item"),
    }),
    output: todoSchema,
    invalidates: ["todos.list"],
  },
});

export async function GET() {
  return NextResponse.json({ todos: listTodos() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { title?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  return NextResponse.json({ todo: createTodo(title) }, { status: 201 });
}
