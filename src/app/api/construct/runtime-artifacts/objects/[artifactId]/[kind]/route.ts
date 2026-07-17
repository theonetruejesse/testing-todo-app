import { fetchPublishedObject } from "@/lib/construct-runtime/server";

interface ArtifactObjectRouteProps {
  params: Promise<{ artifactId: string; kind: string }>;
}

export async function GET(_request: Request, { params }: ArtifactObjectRouteProps) {
  const { artifactId, kind } = await params;
  try {
    const object = await fetchPublishedObject(artifactId, kind);
    if (!object) return new Response("Artifact object not found.", { status: 404 });
    return new Response(Uint8Array.from(object.body).buffer, {
      headers: {
        "cache-control": "private, no-store",
        "content-type": object.contentType,
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Artifact proxy failed.", {
      status: 502,
    });
  }
}
