import type { ConstructRuntimeArtifactDescriptor } from "@construct/sdk/react";

const SURFACE_ID = "todos.main";
const PREVIEW_SELECTOR_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_DESCRIPTOR_BYTES = 256 * 1024;
const MAX_MODULE_BYTES = 2 * 1024 * 1024;
const MAX_STYLE_BYTES = 512 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

type ArtifactObjectKind = "module" | `style-${number}`;

interface PreviewServerDependencies {
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
}

export function previewRuntimeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CONSTRUCT_RUNTIME_PREVIEWS_ENABLED === "true";
}

/**
 * Resolves a short-lived preview selector through the same authenticated target
 * boundary as production. The selector never becomes part of a browser-visible URL.
 */
export async function resolvePreviewArtifact(
  selector: string,
  dependencies: PreviewServerDependencies = {},
): Promise<ConstructRuntimeArtifactDescriptor | null> {
  const env = dependencies.env ?? process.env;
  if (!previewRuntimeEnabled(env)) throw new PreviewDisabledError();
  assertSelector(selector);

  const platformApiUrl = requiredUrl(env, "CONSTRUCT_PLATFORM_API_URL");
  const targetId = requiredValue(env, "CONSTRUCT_RUNTIME_TARGET_ID");
  const targetSecret = requiredValue(env, "CONSTRUCT_RUNTIME_TARGET_SECRET");
  const response = await (dependencies.fetch ?? fetch)(
    new URL("/runtime-artifacts/resolve", platformApiUrl),
    {
      body: JSON.stringify({ previewSelector: selector, surfaceId: SURFACE_ID }),
      cache: "no-store",
      credentials: "omit",
      headers: {
        authorization: `Bearer ${targetSecret}`,
        "content-type": "application/json",
        "x-construct-target-id": targetId,
      },
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    },
  );
  rejectRedirect(response, "Platform preview artifact resolution");
  if (!response.ok) {
    throw new Error(`Platform preview artifact resolution failed (${response.status}).`);
  }
  if (!/^application\/json(?:;|$)/i.test((response.headers.get("content-type") ?? "").trim())) {
    throw new Error("Platform preview artifact resolution returned an unsafe content type.");
  }

  const bytes = await readBoundedBody(response, MAX_DESCRIPTOR_BYTES, "Preview artifact descriptor");
  const value = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  if (value === null) return null;
  return parseDescriptor(value, env);
}

/**
 * Re-resolves the selector for every object request so expiry, revocation, or
 * tampering fails closed instead of borrowing the active production assignment.
 */
export async function fetchPreviewObject(
  input: { artifactId: string; kind: ArtifactObjectKind; selector: string },
  dependencies: PreviewServerDependencies = {},
): Promise<{ body: Uint8Array; contentType: string } | null> {
  const env = dependencies.env ?? process.env;
  const descriptor = await resolvePreviewArtifact(input.selector, dependencies);
  if (!descriptor || descriptor.artifactId !== input.artifactId) return null;

  const objectUrl = selectObjectUrl(descriptor, input.kind);
  if (!objectUrl) return null;

  const isModule = input.kind === "module";
  const url = new URL(objectUrl);
  if (!allowedOrigins(env).has(url.origin)) {
    throw new Error("Preview artifact object origin is not allowed.");
  }

  const response = await (dependencies.fetch ?? fetch)(url, {
    cache: "no-store",
    credentials: "omit",
    redirect: "manual",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  rejectRedirect(response, "Preview artifact object fetch");
  if (!response.ok) throw new Error(`Preview artifact object fetch failed (${response.status}).`);

  const contentType = response.headers.get("content-type") ?? "";
  if (!(isModule ? isJavaScript(contentType) : isCss(contentType))) {
    throw new Error("Preview artifact object returned an unsafe content type.");
  }

  const body = await readBoundedBody(
    response,
    isModule ? MAX_MODULE_BYTES : MAX_STYLE_BYTES,
    "Preview artifact object",
  );
  return {
    body,
    contentType: isModule ? "application/javascript; charset=utf-8" : "text/css; charset=utf-8",
  };
}

/**
 * Provider-owned object URLs must remain server-side. Marker URLs communicate
 * object shape to the client until it replaces them with document-local Blobs.
 */
export function toPreviewClientDescriptor(
  descriptor: ConstructRuntimeArtifactDescriptor,
): ConstructRuntimeArtifactDescriptor {
  return {
    ...descriptor,
    manifestUrl: null,
    // Preview metadata is not needed by the host runtime and is deliberately
    // omitted so a provider cannot accidentally reflect selector material.
    metadata: {},
    moduleUrl: descriptor.moduleUrl ? "construct-preview:module" : null,
    patchUrl: null,
    proposalBundleUrl: null,
    sourceMapUrls: [],
    styleUrls: descriptor.styleUrls.map((_, index) => `construct-preview:style-${index}`),
  };
}

export function parsePreviewObjectInput(value: unknown): {
  artifactId: string;
  kind: ArtifactObjectKind;
  selector: string;
} | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const kind = input.kind;
  if (
    typeof input.artifactId !== "string" ||
    !input.artifactId ||
    typeof input.selector !== "string" ||
    !input.selector ||
    (kind !== "module" && !(typeof kind === "string" && /^style-(\d+)$/.test(kind)))
  ) {
    return null;
  }
  try {
    assertSelector(input.selector);
  } catch {
    return null;
  }
  return { artifactId: input.artifactId, kind: kind as ArtifactObjectKind, selector: input.selector };
}

export class PreviewDisabledError extends Error {
  constructor() {
    super("Construct preview runtime is disabled.");
    this.name = "PreviewDisabledError";
  }
}

function parseDescriptor(
  value: unknown,
  env: NodeJS.ProcessEnv,
): ConstructRuntimeArtifactDescriptor {
  if (!value || typeof value !== "object") throw new Error("Invalid preview artifact descriptor.");
  const descriptor = value as Partial<ConstructRuntimeArtifactDescriptor>;
  if (
    typeof descriptor.artifactId !== "string" ||
    typeof descriptor.artifactRoot !== "string" ||
    typeof descriptor.contentHash !== "string" ||
    descriptor.surfaceId !== SURFACE_ID ||
    descriptor.status !== "approved" ||
    (descriptor.moduleUrl !== null && typeof descriptor.moduleUrl !== "string") ||
    !Array.isArray(descriptor.styleUrls) ||
    !descriptor.styleUrls.every((url) => typeof url === "string") ||
    !descriptor.metadata ||
    typeof descriptor.metadata !== "object"
  ) {
    throw new Error("Invalid preview artifact descriptor.");
  }
  for (const objectUrl of [descriptor.moduleUrl, ...descriptor.styleUrls]) {
    if (objectUrl && !allowedOrigins(env).has(new URL(objectUrl).origin)) {
      throw new Error("Preview artifact object origin is not allowed.");
    }
  }
  return descriptor as ConstructRuntimeArtifactDescriptor;
}

function selectObjectUrl(
  descriptor: ConstructRuntimeArtifactDescriptor,
  kind: ArtifactObjectKind,
): string | null {
  if (kind === "module") return descriptor.moduleUrl;
  const index = Number(kind.slice("style-".length));
  return descriptor.styleUrls[index] ?? null;
}

async function readBoundedBody(
  response: Response,
  maxBytes: number,
  label: string,
): Promise<Uint8Array> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0 || parsedLength > maxBytes) {
      throw new Error(`${label} exceeds its size limit.`);
    }
  }

  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      byteLength += result.value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel("Preview artifact size limit exceeded.").catch(() => undefined);
        throw new Error(`${label} exceeds its size limit.`);
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  const output = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

function rejectRedirect(response: Response, label: string): void {
  if (response.status >= 300 && response.status < 400) {
    throw new Error(`${label} redirects are not allowed.`);
  }
}

function isJavaScript(contentType: string): boolean {
  return /^(application|text)\/(javascript|ecmascript)(?:;|$)/i.test(contentType.trim());
}

function isCss(contentType: string): boolean {
  return /^text\/css(?:;|$)/i.test(contentType.trim());
}

function assertSelector(selector: string): void {
  // Selectors are 256 random bits encoded as unpadded base64url (32 bytes ->
  // 43 characters). Rejecting every other shape keeps the bearer surface tiny.
  if (!PREVIEW_SELECTOR_PATTERN.test(selector)) {
    throw new Error("Invalid preview selector.");
  }
}

function allowedOrigins(env: NodeJS.ProcessEnv): ReadonlySet<string> {
  const configured = requiredValue(env, "CONSTRUCT_ARTIFACT_ALLOWED_ORIGINS");
  return new Set(configured.split(",").map((value) => new URL(value.trim()).origin));
}

function requiredValue(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function requiredUrl(env: NodeJS.ProcessEnv, name: string): URL {
  return new URL(requiredValue(env, name));
}
