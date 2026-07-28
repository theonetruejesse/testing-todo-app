"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Todo } from "../../lib/todo-contract";

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingTodoId, setPendingTodoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTodos() {
      const response = await fetch("/api/todos", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load todos");
      const data = (await response.json()) as Todo[];
      if (!cancelled) setTodos(data);
    }

    loadTodos()
      .catch(() => {
        if (!cancelled) setError("Could not load your todos. Try refreshing the page.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function createTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || isCreating) return;

    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });

      if (!response.ok) throw new Error("Failed to create todo");
      const todo = (await response.json()) as Todo;
      setTodos((current) => [todo, ...current]);
      setTitle("");
    } catch {
      setError("Could not add that todo. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    if (pendingTodoId) return;
    setError(null);
    setPendingTodoId(todo.id);

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) throw new Error("Failed to update todo");
      const updatedTodo = (await response.json()) as Todo;
      setTodos((current) =>
        current.map((item) => (item.id === updatedTodo.id ? updatedTodo : item)),
      );
    } catch {
      setError("Could not update that todo. Please try again.");
    } finally {
      setPendingTodoId(null);
    }
  }

  async function deleteTodo(id: string) {
    if (pendingTodoId) return;
    setError(null);
    setPendingTodoId(id);

    try {
      const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete todo");
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch {
      setError("Could not delete that todo. Please try again.");
    } finally {
      setPendingTodoId(null);
    }
  }

  const completed = todos.filter((todo) => todo.completed).length;

  return (
    <div className="todoWorkspace">
      <form className="composer" onSubmit={createTodo}>
        <input
          aria-label="Todo title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          disabled={isCreating}
        />
        <button type="submit" disabled={isCreating || !title.trim()}>
          {isCreating ? "Adding…" : "Add todo"}
        </button>
      </form>

      {error ? (
        <p className="notice" role="alert">
          {error}
        </p>
      ) : null}

      <div className="summary">
        <span>{todos.length} total</span>
        <span>{completed} complete</span>
        <span>{todos.length - completed} open</span>
      </div>

      {isLoading ? (
        <div className="loadingState" role="status">
          Loading your todos…
        </div>
      ) : todos.length === 0 ? (
        <div className="emptyState">
          <span aria-hidden="true">✓</span>
          <h2>Your page is clear.</h2>
          <p>Add a todo above when inspiration—or obligation—strikes.</p>
        </div>
      ) : (
        <ul className="todoList">
          {todos.map((todo) => {
            const isPending = pendingTodoId === todo.id;
            return (
              <li key={todo.id} className={todo.completed ? "done" : ""}>
                <button
                  type="button"
                  className="checkbox"
                  onClick={() => toggleTodo(todo)}
                  disabled={Boolean(pendingTodoId)}
                  aria-label={
                    todo.completed ? `Mark ${todo.title} incomplete` : `Mark ${todo.title} complete`
                  }
                >
                  {todo.completed ? "Done" : "Open"}
                </button>
                <span>{todo.title}</span>
                <button
                  type="button"
                  className="delete"
                  onClick={() => deleteTodo(todo.id)}
                  disabled={Boolean(pendingTodoId)}
                >
                  {isPending ? "Working…" : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
