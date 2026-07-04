import { defaultProjectScope } from "./primitives/product/scope.js";
import { CONSTRUCT_MANIFEST_VERSION, } from "./primitives/shared.js";
// This is a construction helper, not a trust boundary. Validation should be a
// separate compiler step so we can keep "fill defaults" and "reject bad links"
// legible as different phases.
export function defineConstructManifest(input) {
    return {
        manifestVersion: input.manifestVersion ?? CONSTRUCT_MANIFEST_VERSION,
        identity: input.identity,
        runtime: {
            framework: input.runtime?.framework ?? "unknown",
            packageManager: input.runtime?.packageManager,
            appPath: input.runtime?.appPath,
        },
        scope: input.scope ?? defaultProjectScope(),
        surfaces: input.surfaces ?? [],
        operations: input.operations ?? [],
        metadata: input.metadata,
    };
}
//# sourceMappingURL=document.js.map