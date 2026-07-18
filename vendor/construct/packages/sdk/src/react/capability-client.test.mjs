import assert from "node:assert/strict";
import test from "node:test";
import {
  createHandlerCapabilityBinding,
  createMockCapabilityBinding,
} from "./capability-client.ts";

test("handler binding preserves existing host handlers and invalidations", async () => {
  const binding = createHandlerCapabilityBinding({
    actionHandlers: { "todos.create": async (input) => ({ id: "todo-2", ...input }) },
    actionInvalidations: { "todos.create": ["todos.list"] },
  });

  assert.deepEqual(
    await binding.invoke({
      capabilityId: "todos.create",
      kind: "action",
      input: { title: "Ship fixtures" },
    }),
    {
      data: { id: "todo-2", title: "Ship fixtures" },
      invalidates: ["todos.list"],
    },
  );
});

test("mock binding selects a scenario and surfaces synthetic failures", async () => {
  const operation = {
    operationId: "todos.list",
    scenarios: [
      { id: "default", outcome: "success", data: [{ id: "todo-1" }] },
      {
        id: "failure",
        outcome: "error",
        error: { code: "fixture.failed", message: "Unable to list todos." },
      },
    ],
  };
  const ready = createMockCapabilityBinding({ operations: [operation], scenarioId: "default" });
  assert.deepEqual(await ready.invoke({ capabilityId: "todos.list", kind: "resource" }), {
    data: [{ id: "todo-1" }],
    invalidates: [],
  });

  const failed = createMockCapabilityBinding({ operations: [operation], scenarioId: "failure" });
  await assert.rejects(
    () => failed.invoke({ capabilityId: "todos.list", kind: "resource" }),
    /Unable to list todos/,
  );
});
