import assert from "node:assert/strict";
import test from "node:test";
import { createTodo, deleteTodo, updateTodo } from "./store";

test("persists priority through create and update capability paths", () => {
  const todo = createTodo("priority contract probe", true);

  assert.equal(todo.priority, true);
  assert.equal(updateTodo(todo.id, { priority: false })?.priority, false);
  assert.equal(deleteTodo(todo.id), true);
});
