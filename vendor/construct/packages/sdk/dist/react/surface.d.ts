import type { ConstructId } from "@construct/authority-manifest/manifest/primitives/shared";
import type { ConstructJsonValue } from "@construct/runtime";
import { type ReactNode } from "react";
export type ConstructRuntimeArtifactScope = {
    runId?: string;
    workspaceTemplateId?: string;
    authorityCompilationId?: string;
};
export type ConstructRuntimeArtifactResolutionInput = ConstructRuntimeArtifactScope & {
    surfaceId: ConstructId;
};
export type ConstructRuntimeArtifactDescriptor = {
    artifactId: string;
    surfaceId: ConstructId;
    artifactRoot: string;
    status: "approved";
    contentHash: string;
    moduleUrl: string | null;
    manifestUrl: string | null;
    proposalBundleUrl: string | null;
    patchUrl: string | null;
    sourceMapUrls: string[];
    styleUrls: string[];
    metadata: Record<string, unknown>;
};
export type ConstructProviderProps = {
    actionInvalidations?: Record<string, string[]>;
    artifactScope?: ConstructRuntimeArtifactScope;
    actionHandlers?: Record<string, (input: ConstructJsonValue) => Promise<unknown>>;
    children?: ReactNode;
    constructRuntime?: Record<string, unknown>;
    enabled?: boolean;
    onSurfaceError?: (error: unknown, surfaceId: ConstructId) => void;
    resourceHandlers?: Record<string, (input: ConstructJsonValue | undefined) => Promise<unknown>>;
    resolveRuntimeArtifact?: (input: ConstructRuntimeArtifactResolutionInput) => Promise<ConstructRuntimeArtifactDescriptor | null>;
    settings?: Record<string, ConstructJsonValue>;
};
export type SurfaceProps = {
    id: ConstructId;
    title: string;
    description?: string;
    children?: ReactNode;
};
export type SurfaceDescriptor = {
    kind: "construct.react.surface";
    id: ConstructId;
    title: string;
    description?: string;
};
export declare function ConstructProvider(props: ConstructProviderProps): ReactNode;
export declare function Surface(props: SurfaceProps): ReactNode;
export declare function createSurfaceDescriptor(props: SurfaceProps): SurfaceDescriptor;
//# sourceMappingURL=surface.d.ts.map