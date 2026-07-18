import assert from "node:assert/strict";
import test from "node:test";
import { resolvePublishedArtifact } from "./server";
import { fetchPreviewObject, resolvePreviewArtifact } from "./preview-server";

const env = {
  CONSTRUCT_ARTIFACT_ALLOWED_ORIGINS: "https://objects.example.test",
  CONSTRUCT_PLATFORM_API_URL: "https://platform.example.test",
  CONSTRUCT_RUNTIME_TARGET_ID: "todo-production",
  CONSTRUCT_RUNTIME_TARGET_SECRET: "target-secret",
  CONSTRUCT_RUNTIME_PREVIEWS_ENABLED: "true",
  NODE_ENV: "test",
} satisfies NodeJS.ProcessEnv;

const selector = "A".repeat(43);
const expiredSelector = "B".repeat(43);
const tamperedSelector = "C".repeat(43);

test("sends the selector only in the authenticated Platform POST body", async () => {
  let request: { body: unknown; headers: Headers; url: string } | undefined;
  const descriptor = await resolvePreviewArtifact(selector, {
    env,
    fetch: async (url, init) => {
      request = {
        body: JSON.parse(String(init?.body)),
        headers: new Headers(init?.headers),
        url: String(url),
      };
      return descriptorResponse("version-one");
    },
  });

  assert.equal(descriptor?.artifactId, "version-one");
  assert.deepEqual(request?.body, {
    previewSelector: selector,
    surfaceId: "todos.main",
  });
  assert.equal(request?.url, "https://platform.example.test/runtime-artifacts/resolve");
  assert.equal(request?.headers.get("x-construct-target-id"), "todo-production");
  assert.equal(request?.headers.get("authorization"), "Bearer target-secret");
  assert.equal(request?.url.includes(selector), false);
});

test("rejects selectors that are not 256-bit unpadded base64url", async () => {
  let fetchCalls = 0;
  await assert.rejects(
    resolvePreviewArtifact("opaque.selector", {
      env,
      fetch: async () => {
        fetchCalls += 1;
        return descriptorResponse("version-one");
      },
    }),
    /Invalid preview selector/,
  );
  assert.equal(fetchCalls, 0);
});

test("re-resolves the exact selector before returning a bounded object", async () => {
  const requests: Array<{ body: unknown; url: string }> = [];
  const object = await fetchPreviewObject(
    { artifactId: "version-one", kind: "module", selector },
    {
      env,
      fetch: async (url, init) => {
        requests.push({
          body: init?.body ? JSON.parse(String(init.body)) : null,
          url: String(url),
        });
        if (String(url).includes("platform.example.test")) return descriptorResponse("version-one");
        return new Response("export default function Preview() {}", {
          headers: { "content-type": "application/javascript; charset=utf-8" },
        });
      },
    },
  );

  assert.equal(new TextDecoder().decode(object?.body), "export default function Preview() {}");
  assert.deepEqual(requests, [
    {
      body: { previewSelector: selector, surfaceId: "todos.main" },
      url: "https://platform.example.test/runtime-artifacts/resolve",
    },
    { body: null, url: "https://objects.example.test/version-one.js" },
  ]);
});

test("expired and tampered previews fail closed without resolving active assignment", async () => {
  let expiredRequests = 0;
  await assert.rejects(
    fetchPreviewObject(
      { artifactId: "version-one", kind: "module", selector: expiredSelector },
      {
        env,
        fetch: async () => {
          expiredRequests += 1;
          return new Response(null, { status: 401 });
        },
      },
    ),
    /failed \(401\)/,
  );
  assert.equal(expiredRequests, 1);

  let tamperedRequests = 0;
  const tampered = await fetchPreviewObject(
    { artifactId: "version-one", kind: "module", selector: tamperedSelector },
    {
      env,
      fetch: async () => {
        tamperedRequests += 1;
        return descriptorResponse("other-version");
      },
    },
  );
  assert.equal(tampered, null);
  assert.equal(tamperedRequests, 1);
});

test("rejects unsafe object MIME types and redirects", async () => {
  await assert.rejects(
    fetchPreviewObject(
      { artifactId: "version-one", kind: "module", selector },
      {
        env,
        fetch: sequenceFetch(
          descriptorResponse("version-one"),
          new Response("html", { headers: { "content-type": "text/html" } }),
        ),
      },
    ),
    /unsafe content type/,
  );

  await assert.rejects(
    resolvePreviewArtifact(selector, {
      env,
      fetch: async () => new Response(null, { status: 302 }),
    }),
    /redirects are not allowed/,
  );
});

test("keeps the pre-existing active assignment resolver working", { concurrency: false }, async () => {
  const previous = {
    fetch: globalThis.fetch,
    values: Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]])),
  };
  Object.assign(process.env, env);
  let body: unknown;
  globalThis.fetch = async (_url, init) => {
    body = JSON.parse(String(init?.body));
    return descriptorResponse("active-version");
  };

  try {
    const descriptor = await resolvePublishedArtifact();
    assert.equal(descriptor?.artifactId, "active-version");
    assert.deepEqual(body, { surfaceId: "todos.main" });
  } finally {
    globalThis.fetch = previous.fetch;
    for (const [key, value] of Object.entries(previous.values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

function descriptorResponse(artifactId: string): Response {
  return Response.json({
    artifactId,
    artifactRoot: "src/app",
    contentHash: "a".repeat(64),
    manifestUrl: null,
    metadata: {},
    moduleUrl: `https://objects.example.test/${artifactId}.js`,
    patchUrl: null,
    proposalBundleUrl: null,
    sourceMapUrls: [],
    status: "approved",
    styleUrls: [`https://objects.example.test/${artifactId}.css`],
    surfaceId: "todos.main",
  });
}

function sequenceFetch(...responses: Response[]): typeof fetch {
  let index = 0;
  return async () => responses[index++] as Response;
}
