import { captureConstructRuntimeSelection } from "@construct/sdk/next/client";

// Runtime selectors are captured once so client navigation cannot silently
// change the version rendered by an already-mounted surface.
captureConstructRuntimeSelection({ document, location });
