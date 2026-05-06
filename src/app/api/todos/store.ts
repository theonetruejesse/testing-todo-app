export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

const todos: Todo[] = [
  {
    id: "seed-1",
    title: "Clone this repo into a sandbox",
    completed: false,
  },
  {
    id: "seed-2",
    title: "Run install, lint, and build",
    completed: false,
  },
  {
    id: "seed-3",
    title: "Expose the Next.js dev server",
    completed: false,
  },
];

export function listTodos(): Todo[] {
  return todos;
}

export function createTodo(title: string): Todo {
  const todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
  };
  todos.unshift(todo);
  return todo;
}

export function updateTodo(id: string, updates: Partial<Pick<Todo, "completed" | "title">>): Todo | null {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return null;

  if (typeof updates.completed === "boolean") {
    todo.completed = updates.completed;
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
