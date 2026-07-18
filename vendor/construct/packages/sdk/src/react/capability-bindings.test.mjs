import assert from "node:assert/strict";
import test from "node:test";
import {
  ConstructCapabilityBindingError,
  requireConstructCapabilityHandler,
} from "./capability-bindings.ts";

test("returns an explicitly registered capability handler", () => {
  const handler = async () => ["todo"];

  assert.equal(requireConstructCapabilityHandler(handler, "resource", "todos.list"), handler);
});

test("rejects an unbound resource before a surface can report ready", () => {
  assert.throws(
    () => requireConstructCapabilityHandler(undefined, "resource", "todos.list"),
    (error) => {
      assert.ok(error instanceof ConstructCapabilityBindingError);
      assert.equal(error.code, "construct.capability.missing-handler");
      assert.equal(error.message, "No Construct resource handler is registered for todos.list.");
      return true;
    },
  );
});

test("rejects an unbound action before interaction", () => {
  assert.throws(
    () => requireConstructCapabilityHandler(undefined, "action", "todos.create"),
    /No Construct action handler is registered for todos\.create\./,
  );
});
