import { Surface } from "@construct/sdk/react";
import { TodoApp } from "./components/todo-app";

export default function Home() {
  return (
    <main className="shell">
      <section className="panel">
        <header className="masthead">
          <h1>Todo Runtime Check</h1>
          <p>
            A deliberately small app with a browser UI and API routes. It is meant to be cloned,
            checked, built, and launched inside a remote sandbox.
          </p>
        </header>

        {/** biome-ignore lint/nursery/useUniqueElementIds: cleanup in-progress  */}
        <Surface
          id="todos.main"
          title="Todo workspace"
          description="Helps individuals organize, prioritize, and complete their current work."
          audience="Individual contributors"
          useCases={["Plan current work", "Track completion", "Review progress"]}
          loadingFallback={<TodoSurfaceSkeleton />}
        >
          <TodoApp />
        </Surface>
      </section>
    </main>
  );
}

function TodoSurfaceSkeleton() {
  return (
    <div aria-label="Loading published workspace" className="todoWorkspace" role="status">
      <div className="composer" aria-hidden="true">
        <span className="skeletonLine" />
      </div>
      <div className="todoList" aria-hidden="true">
        <span className="skeletonCard" />
        <span className="skeletonCard" />
      </div>
    </div>
  );
}
