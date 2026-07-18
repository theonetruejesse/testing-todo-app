import assert from "node:assert/strict";
import test from "node:test";
import {
  captureConstructPreviewSelector,
  getConstructPreviewSelection,
} from "./preview-selector";

const leftSelector = "A".repeat(43);
const rightSelector = "B".repeat(43);

test("keeps selectors isolated to each document and removes them from visible hashes", () => {
  const leftDocument = {};
  const rightDocument = {};
  const replacements: string[] = [];

  const left = captureConstructPreviewSelector({
    document: leftDocument,
    history: historyStub(replacements),
    location: { hash: `#construct-preview=${leftSelector}`, pathname: "/", search: "?view=one" },
  });
  const right = captureConstructPreviewSelector({
    document: rightDocument,
    history: historyStub(replacements),
    location: { hash: `#construct-preview=${rightSelector}`, pathname: "/", search: "" },
  });

  assert.deepEqual(left, { present: true, selector: leftSelector });
  assert.deepEqual(right, { present: true, selector: rightSelector });
  assert.deepEqual(getConstructPreviewSelection(leftDocument), left);
  assert.deepEqual(getConstructPreviewSelection(rightDocument), right);
  assert.deepEqual(replacements, ["/?view=one", "/"]);
});

test("does not disturb unrelated fragments", () => {
  const document = {};
  let replaced = false;
  const selection = captureConstructPreviewSelector({
    document,
    history: {
      replaceState() {
        replaced = true;
      },
      state: null,
    },
    location: { hash: "#todo-1", pathname: "/", search: "" },
  });

  assert.deepEqual(selection, { present: false });
  assert.equal(replaced, false);
});

function historyStub(replacements: string[]) {
  return {
    replaceState(_data: unknown, _unused: string, url?: string | URL | null) {
      replacements.push(String(url));
    },
    state: null,
  };
}
