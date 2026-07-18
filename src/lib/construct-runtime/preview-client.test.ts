import assert from "node:assert/strict";
import test from "node:test";
import { postRuntimeReadyFingerprint } from "./preview-client";

test("posts the canonical flat ready fingerprint to the exact configured origin", () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let posted: { message: unknown; targetOrigin: string } | undefined;
  const parent = {
    postMessage(message: unknown, targetOrigin: string) {
      posted = { message, targetOrigin };
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { parent },
  });

  try {
    postRuntimeReadyFingerprint({
      artifactId: "version-one",
      contentHash: "a".repeat(64),
      hostBuildId: "host-build-one",
      source: "preview",
      surfaceId: "todos.main",
      targetOrigin: "https://platform.example.test",
    });
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }

  assert.deepEqual(posted, {
    message: {
      artifactId: "version-one",
      contentHash: "a".repeat(64),
      hostBuildId: "host-build-one",
      source: "preview",
      surfaceId: "todos.main",
      type: "construct:surface-ready",
      versionId: "version-one",
    },
    targetOrigin: "https://platform.example.test",
  });
  assert.equal(JSON.stringify(posted).includes("selector"), false);
});
