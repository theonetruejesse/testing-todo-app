import { listTodos } from "./api/todos/store";
import { TodoApp } from "./components/todo-app";

export default function Home() {
  return (
    <main className="shell">
      <TodoApp initialTodos={listTodos()} />
    </main>
  );
}
