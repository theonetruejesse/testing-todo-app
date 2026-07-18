import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "./route";

test("a selector presented to a disabled host never falls back to active resolution", async () => {
  const previousFlag = process.env.CONSTRUCT_RUNTIME_PREVIEWS_ENABLED;
  const previousFetch = globalThis.fetch;
  process.env.CONSTRUCT_RUNTIME_PREVIEWS_ENABLED = "false";
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("The active resolver must not be called.");
  };

  try {
    const response = await POST(
      new Request("http://host.test/api/construct/runtime-artifacts/resolve", {
        body: JSON.stringify({ previewSelector: "A".repeat(43), surfaceId: "todos.main" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
    );
    assert.equal(response.status, 404);
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousFlag === undefined) delete process.env.CONSTRUCT_RUNTIME_PREVIEWS_ENABLED;
    else process.env.CONSTRUCT_RUNTIME_PREVIEWS_ENABLED = previousFlag;
  }
});
