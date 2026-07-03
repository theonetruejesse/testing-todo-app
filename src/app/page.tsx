import { Surface } from "@construct/sdk/react";
import { listTodos } from "./api/todos/store";
import { TodoApp } from "./components/todo-app";

export default function Home() {
  return (
    <main className="shell">
      <Surface
        id="todos.main"
        title="Todo List"
        permission="read-write"
        files={["src/app/page.tsx", "src/app/components/**", "src/app/globals.css"]}
      >
        <TodoApp initialTodos={listTodos()} />
      </Surface>
    </main>
  );
}
