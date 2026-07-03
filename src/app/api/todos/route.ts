import { defineRouteOperations } from "@construct/sdk/next";
import { NextRequest, NextResponse } from "next/server";
import { createTodo, listTodos } from "./store";

export const operations = defineRouteOperations({
  GET: {
    kind: "resource",
    id: "todos.list",
    title: "List todos",
    description: "Read the visible todo list.",
  },
  POST: {
    kind: "action",
    id: "todos.create",
    title: "Create todo",
    description: "Create a todo item.",
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
