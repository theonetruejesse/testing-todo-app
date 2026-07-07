import { ConstructActionButton, ConstructField, ConstructForm, ConstructIcon, ConstructLink, ConstructResourceBoundary, constructClassNames, constructRange, createConstructLocalContext, useConstructAction, useConstructActionForm, useConstructFormat, useConstructLocalContext, useConstructLocale, useConstructResource, useConstructSetting, useConstructSurface, useConstructViewport, } from "./index.js";
const TodoUiContext = createConstructLocalContext("TodoUiContext");
// Compile-only contract sample. It mirrors generated-artifact calls without
// executing hooks during package tests.
export function ContractSample({ children }) {
    const todos = useConstructResource("todos.list", {
        input: { page: 1, search: "" },
        inputDebounceMs: 250,
        refresh: { everyMs: 5000, whenVisible: true },
    });
    const createTodo = useConstructAction("todos.create");
    const form = useConstructActionForm("todos.create");
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
            children: (data) => ConstructActionButton({
                action: createTodo,
                input: { title: `${surface.surfaceId}-${viewport.size}-${locale.locale}` },
                disabled: data.length === 0,
                children: [
                    ConstructIcon({ name: "plus", decorative: true }),
                    ConstructLink({ to: "todos.detail", params: { todoId: data[0]?.id ?? "" }, children }),
                    ConstructField({
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
//# sourceMappingURL=contract-samples.js.map