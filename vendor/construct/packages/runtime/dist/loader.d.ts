import type * as React from "react";
import type { ComponentType } from "react";
import type * as JsxRuntime from "react/jsx-runtime";
export declare const CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL: unique symbol;
export type ConstructArtifactRuntimeSlot = {
    React: typeof React;
    jsxRuntime: typeof JsxRuntime;
    ConstructRuntime: Record<string, unknown>;
};
export type ConstructArtifactModule = {
    default: ComponentType;
};
export declare function loadConstructArtifactModule(moduleUrl: string, runtime: ConstructArtifactRuntimeSlot): Promise<ConstructArtifactModule>;
//# sourceMappingURL=loader.d.ts.map