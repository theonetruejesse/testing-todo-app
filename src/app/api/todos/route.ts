import { defineRouteOperations } from "@construct/sdk/next";
import { NextRequest, NextResponse } from "next/server.js";
import { z } from "zod";
import {
  createTodoInputSchema,
  todoSchema,
} from "../../../lib/todo-contract.ts";
import { createTodo, listTodos, persistTodoState, readTodoState } from "./store.ts";

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

export async function GET(request: NextRequest) {
  // The wire shape intentionally matches the declared operation output. This
  // keeps generated fixtures interchangeable with responses from the real API.
  return NextResponse.json(listTodos(readTodoState(request)));
}

export async function POST(request: NextRequest) {
  const input = createTodoInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: "invalid todo input" }, { status: 400 });
  }

  const state = readTodoState(request);
  const response = NextResponse.json(
    createTodo(input.data.title, input.data.priority, state),
    { status: 201 },
  );
  persistTodoState(request, response, state);
  return response;
}
