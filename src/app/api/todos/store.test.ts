import assert from "node:assert/strict";
import test from "node:test";
import { todoSchema } from "../../../lib/todo-contract.ts";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./store.ts";

test("starts with exactly three deterministic application-owned todos", () => {
  const todos = listTodos();

  assert.equal(todos.length, 3);
  assert.deepEqual(
    todos.map((todo) => todo.id),
    [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000003",
    ],
  );
  assert.equal(todoSchema.array().safeParse(todos).success, true);
});

test("persists priority through create and update capability paths", () => {
  const todo = createTodo("priority contract probe", true);

  assert.equal(todo.priority, true);
  assert.equal(updateTodo(todo.id, { priority: false })?.priority, false);
  assert.equal(deleteTodo(todo.id), true);
});
