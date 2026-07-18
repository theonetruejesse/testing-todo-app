import assert from "node:assert/strict";
import test from "node:test";
import * as JsxDevRuntime from "react/jsx-dev-runtime";
import * as JsxRuntime from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { artifactJsxRuntime } from "./artifact-jsx-runtime.ts";

test("provides both production and development JSX entrypoints to artifact modules", () => {
  assert.notEqual(artifactJsxRuntime.jsx, JsxRuntime.jsx);
  assert.notEqual(artifactJsxRuntime.jsxs, JsxRuntime.jsxs);
  assert.notEqual(artifactJsxRuntime.jsxDEV, JsxDevRuntime.jsxDEV);
  assert.equal(artifactJsxRuntime.Fragment, JsxRuntime.Fragment);
});

test("sanitizes intrinsic React events before artifact handlers receive them", () => {
  let received;
  let prevented = false;
  const element = artifactJsxRuntime.jsx("input", {
    onChange: (event) => {
      received = event;
      event.preventDefault();
    },
  });

  element.props.onChange({
    currentTarget: { value: "hello", checked: true, name: "title" },
    key: "Enter",
    preventDefault() {
      prevented = true;
    },
  });

  assert.deepEqual(
    {
      value: received.value,
      checked: received.checked,
      name: received.name,
      key: received.key,
    },
    { value: "hello", checked: true, name: "title", key: "Enter" },
  );
  assert.equal(prevented, true);
  assert.equal("target" in received, false);
});

test("preserves static-child metadata without false missing-key warnings", () => {
  const errors = [];
  const previousConsoleError = console.error;
  console.error = (...args) => errors.push(args);

  try {
    const children = [
      artifactJsxRuntime.jsxDEV("span", { children: "first" }, undefined, false, {}, undefined),
      artifactJsxRuntime.jsxDEV("span", { children: "second" }, undefined, false, {}, undefined),
    ];
    renderToString(artifactJsxRuntime.jsxDEV("div", { children }, undefined, true, {}, undefined));
  } finally {
    console.error = previousConsoleError;
  }

  assert.deepEqual(errors, []);
});
