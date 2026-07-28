import type { Todo } from "../../../lib/todo-contract.ts";

// These are application-owned examples, not generated fixtures. Stable UUIDs
// keep the host demo recognizable while satisfying the public API contract.
const todos: Todo[] = [
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

export function listTodos(): Todo[] {
  return todos;
}

export function createTodo(title: string, priority = false): Todo {
  const todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    priority,
  };
  todos.unshift(todo);
  return todo;
}

export function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "completed" | "priority" | "title">>,
): Todo | null {
  const todo = todos.find((item) => item.id === id);
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

export function deleteTodo(id: string): boolean {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}
