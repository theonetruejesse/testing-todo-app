import { NextResponse } from "next/server";
import {
  resolvePublishedArtifact,
  toSameOriginDescriptor,
} from "@/lib/construct-runtime/server";
import {
  previewRuntimeEnabled,
  resolvePreviewArtifact,
  toPreviewClientDescriptor,
} from "@/lib/construct-runtime/preview-server";

export async function POST(request: Request) {
  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || !("surfaceId" in input)) {
    return NextResponse.json({ error: "surfaceId is required." }, { status: 400 });
  }
  if (input.surfaceId !== "todos.main") {
    return NextResponse.json(null, { headers: { "cache-control": "no-store" } });
  }

  try {
    if ("previewSelector" in input) {
      if (!previewRuntimeEnabled()) {
        return NextResponse.json(
          { error: "Preview artifact loading is disabled." },
          { status: 404 },
        );
      }
      if (typeof input.previewSelector !== "string") {
        return NextResponse.json({ error: "previewSelector is invalid." }, { status: 400 });
      }
      const descriptor = await resolvePreviewArtifact(input.previewSelector);
      return NextResponse.json(descriptor ? toPreviewClientDescriptor(descriptor) : null, {
        headers: { "cache-control": "private, no-store" },
      });
    }

    const descriptor = await resolvePublishedArtifact();
    return NextResponse.json(descriptor ? toSameOriginDescriptor(descriptor) : null, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Artifact resolution failed." },
      { status: 502 },
    );
  }
}
