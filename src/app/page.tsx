import { Surface } from "@construct/sdk/react";
import { listTodos } from "./api/todos/store";
import { TodoApp } from "./components/todo-app";

export default function Home() {
  return (
    <main className="shell">
      <Surface
        id="todos.main"
        title="Todo workspace"
        description="Helps individuals organize, prioritize, and complete their current work."
        audience="Individual contributors"
        useCases={["Plan current work", "Track completion", "Review progress"]}
      >
        <TodoApp initialTodos={listTodos()} />
      </Surface>
    </main>
  );
}
