import type { ConstructRuntimeArtifactDescriptor } from "@construct/sdk/react";

type PreviewObjectKind = "module" | `style-${number}`;

export class PreviewBlobUrls {
  private readonly urls = new Set<string>();

  create(body: Blob): string {
    const url = URL.createObjectURL(body);
    this.urls.add(url);
    return url;
  }

  revokeAll(): void {
    for (const url of this.urls) URL.revokeObjectURL(url);
    this.urls.clear();
  }
}

/**
 * Materializes private preview bytes into URLs scoped to this iframe document.
 * The selector remains only in POST bodies and is never embedded in the URLs.
 */
export async function materializePreviewDescriptor(input: {
  blobs: PreviewBlobUrls;
  descriptor: ConstructRuntimeArtifactDescriptor;
  selector: string;
}): Promise<ConstructRuntimeArtifactDescriptor> {
  const modulePromise = input.descriptor.moduleUrl
    ? fetchPreviewBlob(input.descriptor, input.selector, "module")
    : Promise.resolve(null);
  const stylePromises = input.descriptor.styleUrls.map((_, index) =>
    fetchPreviewBlob(input.descriptor, input.selector, `style-${index}`),
  );

  try {
    const [module, styles] = await Promise.all([modulePromise, Promise.all(stylePromises)]);
    return {
      ...input.descriptor,
      moduleUrl: module ? input.blobs.create(module) : null,
      styleUrls: styles.map((style) => input.blobs.create(style)),
    };
  } catch (error) {
    input.blobs.revokeAll();
    throw error;
  }
}

export function postRuntimeReadyFingerprint(input: {
  artifactId: string;
  contentHash: string;
  hostBuildId: string;
  source: "active" | "preview";
  surfaceId: string;
  targetOrigin: string;
}): void {
  if (window.parent === window) return;
  window.parent.postMessage(
    {
      artifactId: input.artifactId,
      contentHash: input.contentHash,
      hostBuildId: input.hostBuildId,
      source: input.source,
      surfaceId: input.surfaceId,
      type: "construct:surface-ready",
      // Surface versions use the artifact identity at the host boundary.
      versionId: input.artifactId,
    },
    input.targetOrigin,
  );
}

async function fetchPreviewBlob(
  descriptor: ConstructRuntimeArtifactDescriptor,
  selector: string,
  kind: PreviewObjectKind,
): Promise<Blob> {
  const response = await fetch("/api/construct/runtime-artifacts/preview-object", {
    body: JSON.stringify({ artifactId: descriptor.artifactId, kind, selector }),
    cache: "no-store",
    credentials: "omit",
    headers: { "content-type": "application/json" },
    method: "POST",
    redirect: "error",
  });
  if (!response.ok) throw new Error(`Construct preview object loading failed (${response.status}).`);

  const expectedType = kind === "module" ? "application/javascript" : "text/css";
  if (!(response.headers.get("content-type") ?? "").startsWith(expectedType)) {
    throw new Error("Construct preview object returned an unsafe content type.");
  }
  return await response.blob();
}
