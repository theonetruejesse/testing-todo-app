import type * as React from "react";
import type { ComponentType } from "react";
import type * as JsxRuntime from "react/jsx-runtime";

export const CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL = Symbol.for("construct.artifactRuntime");

export type ConstructArtifactRuntimeSlot = {
  React: typeof React;
  jsxRuntime: typeof JsxRuntime;
  ConstructRuntime: Record<string, unknown>;
};

export type ConstructArtifactModule = {
  default: ComponentType;
};

export async function loadConstructArtifactModule(
  moduleUrl: string,
  runtime: ConstructArtifactRuntimeSlot,
): Promise<ConstructArtifactModule> {
  const globalRuntime = globalThis as typeof globalThis &
    Record<symbol, ConstructArtifactRuntimeSlot | undefined>;
  const previousRuntime = globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL];
  globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL] = runtime;

  try {
    return (await import(
      /* webpackIgnore: true */
      /* turbopackIgnore: true */
      /* @vite-ignore */
      moduleUrl
    )) as ConstructArtifactModule;
  } finally {
    if (previousRuntime) {
      globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL] = previousRuntime;
    } else {
      delete globalRuntime[CONSTRUCT_ARTIFACT_RUNTIME_SYMBOL];
    }
  }
}
