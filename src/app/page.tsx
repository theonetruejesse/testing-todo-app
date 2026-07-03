import { Surface } from "@construct/sdk/react";
import { listTodos } from "./api/todos/store";
import { TodoApp } from "./components/todo-app";

export default function Home() {
  return (
    <main className="shell">
      <Surface id="todos.main" title="Todo List">
        <TodoApp initialTodos={listTodos()} />
      </Surface>
    </main>
  );
}
