import {
  fetchPreviewObject,
  parsePreviewObjectInput,
  PreviewDisabledError,
} from "@/lib/construct-runtime/preview-server";

export async function POST(request: Request) {
  const input = parsePreviewObjectInput(await request.json().catch(() => null));
  if (!input) return new Response("Invalid preview artifact object request.", { status: 400 });

  try {
    const object = await fetchPreviewObject(input);
    if (!object) return new Response("Preview artifact object not found.", { status: 404 });
    return new Response(Uint8Array.from(object.body).buffer, {
      headers: {
        "cache-control": "private, no-store",
        "content-type": object.contentType,
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof PreviewDisabledError) {
      return new Response("Preview artifact loading is disabled.", { status: 404 });
    }
    return new Response(
      error instanceof Error ? error.message : "Preview artifact proxy failed.",
      { status: 502 },
    );
  }
}
