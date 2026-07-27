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
        loadingFallback={<TodoSurfaceSkeleton />}
        useCases={["Plan current work", "Track completion", "Review progress"]}
      >
        <TodoApp initialTodos={listTodos()} />
      </Surface>
    </main>
  );
}

function TodoSurfaceSkeleton() {
  return (
    <section aria-label="Loading published workspace" className="todoApp" role="status">
      <header className="hero">
        <div>
          <p className="eyebrow">Construct runtime</p>
          <h1>Loading workspace…</h1>
          <p>Resolving the selected production release.</p>
        </div>
      </header>
      <div className="composer" aria-hidden="true">
        <span className="skeletonLine" />
      </div>
      <div className="todoList" aria-hidden="true">
        <span className="skeletonCard" />
        <span className="skeletonCard" />
      </div>
    </section>
  );
}
