import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { DELETE, PATCH } from "./[id]/route.ts";
import { GET, POST } from "./route.ts";

test("todo routes expose the exact declared CRUD wire shapes", async () => {
  const initialResponse = await GET();
  assert.equal(initialResponse.status, 200);
  const initialTodos = (await initialResponse.json()) as Array<{
    completed: boolean;
    id: string;
    priority: boolean;
    title: string;
  }>;
  assert.equal(initialTodos.length, 3);
  assert.deepEqual(
    initialTodos.map((todo) => todo.title),
    [
      "Clone this repo into a sandbox",
      "Run install, lint, and build",
      "Expose the Next.js dev server",
    ],
  );
  for (const todo of initialTodos) {
    assert.match(todo.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
  }

  const createResponse = await POST(
    jsonRequest("/api/todos", "POST", {
      priority: true,
      title: "Ship the fixture contract",
    }),
  );
  assert.equal(createResponse.status, 201);

  const createdTodo = (await createResponse.json()) as {
    completed: boolean;
    id: string;
    priority: boolean;
    title: string;
  };
  assert.match(createdTodo.id, /^[0-9a-f-]{36}$/);
  assert.deepEqual(
    {
      completed: createdTodo.completed,
      priority: createdTodo.priority,
      title: createdTodo.title,
    },
    {
      completed: false,
      priority: true,
      title: "Ship the fixture contract",
    },
  );
  assert.equal("todo" in createdTodo, false);

  const listResponse = await GET();
  assert.deepEqual(await listResponse.json(), [createdTodo, ...initialTodos]);

  const updateResponse = await PATCH(
    jsonRequest(`/api/todos/${createdTodo.id}`, "PATCH", {
      completed: true,
      title: "Verify the fixture contract",
    }),
    routeContext(createdTodo.id),
  );
  assert.equal(updateResponse.status, 200);
  assert.deepEqual(await updateResponse.json(), {
    ...createdTodo,
    completed: true,
    title: "Verify the fixture contract",
  });

  const deleteResponse = await DELETE(
    new NextRequest(`http://localhost/api/todos/${createdTodo.id}`, {
      method: "DELETE",
    }),
    routeContext(createdTodo.id),
  );
  assert.equal(deleteResponse.status, 204);
  assert.equal(await deleteResponse.text(), "");

  const finalResponse = await GET();
  assert.deepEqual(await finalResponse.json(), initialTodos);

  const invalidCreateResponse = await POST(
    jsonRequest("/api/todos", "POST", { title: " ".repeat(3) }),
  );
  assert.equal(invalidCreateResponse.status, 400);
});

function jsonRequest(path: string, method: "PATCH" | "POST", body: object): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method,
  });
}

function routeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}
