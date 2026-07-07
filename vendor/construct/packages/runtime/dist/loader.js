export const CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL = Symbol.for("construct.artifactRuntime");
export async function loadConstructArtifactModule(moduleUrl, runtime) {
    const globalRuntime = globalThis;
    const previousRuntime = globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL];
    globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL] = runtime;
    try {
        return (await import(
        /* webpackIgnore: true */
        /* turbopackIgnore: true */
        /* @vite-ignore */
        moduleUrl));
    }
    finally {
        if (previousRuntime) {
            globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL] = previousRuntime;
        }
        else {
            delete globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL];
        }
    }
}
//# sourceMappingURL=loader.js.map