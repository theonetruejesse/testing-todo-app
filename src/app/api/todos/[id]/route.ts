import { defineRouteOperations } from "@construct/sdk/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteTodo, updateTodo } from "../store";

const todoSchema = z.object({
  id: z.string().uuid().describe("Stable todo identifier"),
  title: z.string().min(1).max(120).describe("Short description of the work item"),
  completed: z.boolean().describe("Whether the work item is complete"),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const operations = defineRouteOperations({
  PATCH: {
    kind: "action",
    id: "todos.update",
    title: "Update todo",
    description: "Update a todo item's title or completed state.",
    input: z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(120).optional(),
      completed: z.boolean().optional(),
    }),
    output: todoSchema,
    invalidates: ["todos.list"],
  },
  DELETE: {
    kind: "action",
    id: "todos.delete",
    title: "Delete todo",
    description: "Delete a todo item.",
    input: z.object({ id: z.string().uuid() }),
    output: z.null(),
    invalidates: ["todos.list"],
  },
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { completed?: unknown; title?: unknown }
    | null;

  const todo = updateTodo(id, {
    completed: typeof body?.completed === "boolean" ? body.completed : undefined,
    title: typeof body?.title === "string" ? body.title : undefined,
  });

  if (!todo) {
    return NextResponse.json({ error: "todo not found" }, { status: 404 });
  }

  return NextResponse.json({ todo });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteTodo(id);

  if (!deleted) {
    return NextResponse.json({ error: "todo not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
