import { captureConstructPreviewSelector } from "@/lib/construct-runtime/preview-selector";

// Capture regardless of the server feature flag. A selector presented to a
// disabled consumer must still be scrubbed and must never reach the active path.
captureConstructPreviewSelector({ document, history, location });
