import type { Todo } from "../../../lib/todo-contract.ts";
import { todoSchema } from "../../../lib/todo-contract.ts";
import type { NextRequest, NextResponse } from "next/server.js";

// These are application-owned examples, not generated fixtures. Stable UUIDs
// keep the host demo recognizable while satisfying the public API contract.
const defaultTodos: Todo[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Clone this repo into a sandbox",
    completed: false,
    priority: false,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "Run install, lint, and build",
    completed: false,
    priority: false,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    title: "Expose the Next.js dev server",
    completed: false,
    priority: false,
  },
];

const todoStateCookie = "construct-todo-state-v1";
const todos = cloneTodos(defaultTodos);

export function listTodos(state: Todo[] = todos): Todo[] {
  return state;
}

export function createTodo(title: string, priority = false, state: Todo[] = todos): Todo {
  const todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    priority,
  };
  state.unshift(todo);
  return todo;
}

export function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "completed" | "priority" | "title">>,
  state: Todo[] = todos,
): Todo | null {
  const todo = state.find((item) => item.id === id);
  if (!todo) return null;

  if (typeof updates.completed === "boolean") {
    todo.completed = updates.completed;
  }
  // Variant artifacts can add priority controls without losing the canonical
  // todo fields already owned by this fixture capability.
  if (typeof updates.priority === "boolean") {
    todo.priority = updates.priority;
  }
  if (typeof updates.title === "string" && updates.title.trim()) {
    todo.title = updates.title.trim();
  }

  return todo;
}

export function deleteTodo(id: string, state: Todo[] = todos): boolean {
  const index = state.findIndex((todo) => todo.id === id);
  if (index === -1) return false;
  state.splice(index, 1);
  return true;
}

/**
 * The canary runs on serverless hosts, where module memory is not a persistence
 * boundary. A small HTTP-only cookie makes each browser journey portable across
 * function instances while keeping the fixture dependency-free.
 */
export function readTodoState(request: NextRequest): Todo[] {
  const encoded = request.cookies.get(todoStateCookie)?.value;
  if (!encoded) return cloneTodos(defaultTodos);

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    const result = todoSchema.array().safeParse(parsed);
    return result.success ? result.data : cloneTodos(defaultTodos);
  } catch {
    return cloneTodos(defaultTodos);
  }
}

export function persistTodoState(
  request: NextRequest,
  response: NextResponse,
  state: Todo[],
): void {
  response.cookies.set(todoStateCookie, Buffer.from(JSON.stringify(state)).toString("base64url"), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
}

function cloneTodos(state: Todo[]): Todo[] {
  return state.map((todo) => ({ ...todo }));
}
