import { NextResponse } from "next/server";
import {
  resolvePublishedArtifact,
  toSameOriginDescriptor,
} from "@/lib/construct-runtime/server";

export async function POST(request: Request) {
  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || !("surfaceId" in input)) {
    return NextResponse.json({ error: "surfaceId is required." }, { status: 400 });
  }
  if (input.surfaceId !== "todos.main") {
    return NextResponse.json(null, { headers: { "cache-control": "no-store" } });
  }

  try {
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
