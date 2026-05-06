import { NextRequest, NextResponse } from "next/server";
import { createTodo, listTodos } from "./store";

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
