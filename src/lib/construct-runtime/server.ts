import type { ConstructRuntimeArtifactDescriptor } from "@construct/sdk/react";

const SURFACE_ID = "todos.main";
const MAX_DESCRIPTOR_BYTES = 256 * 1024;
const MAX_MODULE_BYTES = 2 * 1024 * 1024;
const MAX_STYLE_BYTES = 512 * 1024;

export async function resolvePublishedArtifact(): Promise<ConstructRuntimeArtifactDescriptor | null> {
  const platformApiUrl = requiredUrl("CONSTRUCT_PLATFORM_API_URL");
  const targetId = requiredValue("CONSTRUCT_RUNTIME_TARGET_ID");
  const targetSecret = requiredValue("CONSTRUCT_RUNTIME_TARGET_SECRET");
  const response = await fetch(new URL("/runtime-artifacts/resolve", platformApiUrl), {
    body: JSON.stringify({ surfaceId: SURFACE_ID }),
    cache: "no-store",
    headers: {
      authorization: `Bearer ${targetSecret}`,
      "content-type": "application/json",
      "x-construct-target-id": targetId,
    },
    method: "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Platform artifact resolution failed (${response.status}).`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_DESCRIPTOR_BYTES) throw new Error("Artifact descriptor is too large.");

  const value = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  if (value === null) return null;
  return parseDescriptor(value);
}

export function toSameOriginDescriptor(
  descriptor: ConstructRuntimeArtifactDescriptor,
): ConstructRuntimeArtifactDescriptor {
  const objectBase = `/api/construct/runtime-artifacts/objects/${encodeURIComponent(descriptor.artifactId)}`;
  return {
    ...descriptor,
    // Provider-owned object URLs remain server-side; generated modules and
    // styles are served through the authenticated host boundary.
    manifestUrl: null,
    moduleUrl: descriptor.moduleUrl ? `${objectBase}/module` : null,
    patchUrl: null,
    proposalBundleUrl: null,
    sourceMapUrls: [],
    styleUrls: descriptor.styleUrls.map((_, index) => `${objectBase}/style-${index}`),
  };
}

export async function fetchPublishedObject(
  artifactId: string,
  kind: string,
): Promise<{ body: Uint8Array; contentType: string } | null> {
  const descriptor = await resolvePublishedArtifact();
  if (!descriptor || descriptor.artifactId !== artifactId) return null;

  const isModule = kind === "module";
  const styleMatch = /^style-(\d+)$/.exec(kind);
  const upstream = isModule
    ? descriptor.moduleUrl
    : styleMatch
      ? descriptor.styleUrls[Number(styleMatch[1])]
      : null;
  if (!upstream) return null;

  const url = new URL(upstream);
  if (!allowedOrigins().has(url.origin)) throw new Error("Artifact object origin is not allowed.");
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "omit",
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok || (response.status >= 300 && response.status < 400)) {
    throw new Error(`Artifact object fetch failed (${response.status}).`);
  }
  const body = new Uint8Array(await response.arrayBuffer());
  const limit = isModule ? MAX_MODULE_BYTES : MAX_STYLE_BYTES;
  if (body.byteLength > limit) throw new Error("Artifact object is too large.");

  return {
    body,
    contentType: isModule ? "application/javascript; charset=utf-8" : "text/css; charset=utf-8",
  };
}

function parseDescriptor(value: unknown): ConstructRuntimeArtifactDescriptor {
  if (!value || typeof value !== "object") throw new Error("Invalid artifact descriptor.");
  const descriptor = value as Partial<ConstructRuntimeArtifactDescriptor>;
  if (
    typeof descriptor.artifactId !== "string" ||
    descriptor.surfaceId !== SURFACE_ID ||
    descriptor.status !== "approved" ||
    (descriptor.moduleUrl !== null && typeof descriptor.moduleUrl !== "string") ||
    !Array.isArray(descriptor.styleUrls)
  ) {
    throw new Error("Invalid artifact descriptor.");
  }
  for (const objectUrl of [descriptor.moduleUrl, ...descriptor.styleUrls]) {
    if (objectUrl && !allowedOrigins().has(new URL(objectUrl).origin)) {
      throw new Error("Artifact object origin is not allowed.");
    }
  }
  return descriptor as ConstructRuntimeArtifactDescriptor;
}

function allowedOrigins(): ReadonlySet<string> {
  const configured = requiredValue("CONSTRUCT_ARTIFACT_ALLOWED_ORIGINS");
  return new Set(configured.split(",").map((value) => new URL(value.trim()).origin));
}

function requiredValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function requiredUrl(name: string): URL {
  return new URL(requiredValue(name));
}
