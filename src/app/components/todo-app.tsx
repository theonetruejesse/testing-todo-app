"use client";

import { FormEvent, useState } from "react";
import type { Todo } from "../api/todos/store";

type TodoAppProps = {
  initialTodos: Todo[];
};

export function TodoApp({ initialTodos }: TodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function createTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;

    setTitle("");
    setError(null);

    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: nextTitle }),
    });

    if (!response.ok) {
      setError("Failed to create todo");
      setTitle(nextTitle);
      return;
    }

    const data = (await response.json()) as { todo: Todo };
    setTodos((current) => [data.todo, ...current]);
  }

  async function toggleTodo(todo: Todo) {
    const response = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (!response.ok) {
      setError("Failed to update todo");
      return;
    }

    const data = (await response.json()) as { todo: Todo };
    setTodos((current) => current.map((item) => (item.id === data.todo.id ? data.todo : item)));
  }

  async function deleteTodo(id: string) {
    const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to delete todo");
      return;
    }
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  const completed = todos.filter((todo) => todo.completed).length;

  return (
    <section className="panel">
      <div className="masthead">
        <p className="eyebrow">Next.js sandbox target</p>
        <h1>Todo Runtime Check</h1>
        <p>
          A deliberately small app with a browser UI and API routes. It is meant to be cloned,
          checked, built, and launched inside a remote sandbox.
        </p>
      </div>

      <form className="composer" onSubmit={createTodo}>
        <input
          aria-label="Todo title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task"
        />
        <button type="submit">Add</button>
      </form>

      {error ? <p className="notice">{error}</p> : null}

      <div className="summary">
        <span>{todos.length} total</span>
        <span>{completed} complete</span>
        <span>api ready</span>
      </div>

      <ul className="todoList">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "done" : ""}>
            <button type="button" className="checkbox" onClick={() => toggleTodo(todo)}>
              {todo.completed ? "Done" : "Open"}
            </button>
            <span>{todo.title}</span>
            <button type="button" className="delete" onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
