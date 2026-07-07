import type { ReactNode } from "react";
import {
  ConstructActionButton,
  ConstructField,
  ConstructForm,
  ConstructIcon,
  ConstructLink,
  ConstructResourceBoundary,
  constructClassNames,
  constructRange,
  createConstructLocalContext,
  useConstructAction,
  useConstructActionForm,
  useConstructFormat,
  useConstructLocalContext,
  useConstructLocale,
  useConstructResource,
  useConstructSetting,
  useConstructSurface,
  useConstructViewport,
} from "./index.js";

type Todo = {
  id: string;
  title: string;
};

const TodoUiContext = createConstructLocalContext<{ selectedId: string | null }>("TodoUiContext");

// Compile-only contract sample. It mirrors generated-artifact calls without
// executing hooks during package tests.
export function ContractSample({ children }: { children?: ReactNode }): ReactNode {
  const todos = useConstructResource<Todo[]>("todos.list", {
    input: { page: 1, search: "" },
    inputDebounceMs: 250,
    refresh: { everyMs: 5000, whenVisible: true },
  });
  const createTodo = useConstructAction<{ title: string }, Todo>("todos.create");
  const form = useConstructActionForm<{ title: string }, Todo>("todos.create");
  const pageSize = useConstructSetting("todos.pageSize", 20);
  const context = useConstructLocalContext(TodoUiContext);
  const surface = useConstructSurface();
  const viewport = useConstructViewport();
  const locale = useConstructLocale();
  const formatter = useConstructFormat();
  const className = constructClassNames("rounded-md", pageSize > 10 && "p-4", {
    "opacity-80": context.selectedId === null,
  });
  const pages = constructRange(3);

  return ConstructForm({
    form,
    children: ConstructResourceBoundary({
      resource: todos,
      empty: "No todos",
      children: (data) =>
        ConstructActionButton({
          action: createTodo,
          input: { title: `${surface.surfaceId}-${viewport.size}-${locale.locale}` },
          disabled: data.length === 0,
          children: [
            ConstructIcon({ name: "plus", decorative: true }),
            ConstructLink({ to: "todos.detail", params: { todoId: data[0]?.id ?? "" }, children }),
            ConstructField<string>({
              form,
              name: "title",
              label: "Title",
              children: (field) => field.value,
            }),
            formatter.number(pages.length),
            className,
          ],
        }),
    }),
  });
}
