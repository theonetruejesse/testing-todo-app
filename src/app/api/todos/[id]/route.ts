import { defineRouteOperations } from "@construct/sdk/next";
import { NextRequest, NextResponse } from "next/server";
import { deleteTodo, updateTodo } from "../store";

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
  },
  DELETE: {
    kind: "action",
    id: "todos.delete",
    title: "Delete todo",
    description: "Delete a todo item.",
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
