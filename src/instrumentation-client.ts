import { captureConstructReleaseSelection } from "@construct/sdk/next/client";

// Published release IDs are public, shareable selectors. Capture the initial
// selection once so client navigation cannot silently change a mounted surface.
captureConstructReleaseSelection({ document, location });
