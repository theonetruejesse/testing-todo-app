import { defineRouteOperations } from "@construct/sdk/next";
import { NextRequest, NextResponse } from "next/server.js";
import { z } from "zod";
import {
  todoSchema,
  updateTodoFieldsSchema,
} from "../../../../lib/todo-contract.ts";
import { deleteTodo, persistTodoState, readTodoState, updateTodo } from "../store.ts";

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
    description: "Update a todo item's title, completed state, or priority.",
    input: updateTodoFieldsSchema.extend({ id: z.string().uuid() }),
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
  const input = updateTodoFieldsSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: "invalid todo input" }, { status: 400 });
  }

  const state = readTodoState(request);
  const todo = updateTodo(id, input.data, state);

  if (!todo) {
    return NextResponse.json({ error: "todo not found" }, { status: 404 });
  }

  const response = NextResponse.json(todo);
  persistTodoState(request, response, state);
  return response;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const state = readTodoState(request);
  const deleted = deleteTodo(id, state);

  if (!deleted) {
    return NextResponse.json({ error: "todo not found" }, { status: 404 });
  }

  const response = new NextResponse(null, { status: 204 });
  persistTodoState(request, response, state);
  return response;
}
