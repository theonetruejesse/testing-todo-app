import type { ConstructId } from "@construct/authority-manifest/manifest/primitives/shared";
export type SurfaceProps<Children = unknown> = {
    id: ConstructId;
    title: string;
    description?: string;
    children?: Children;
};
export type SurfaceDescriptor = {
    kind: "construct.react.surface";
    id: ConstructId;
    title: string;
    description?: string;
};
export declare function Surface<Children = unknown>(props: SurfaceProps<Children>): Children | null;
export declare function createSurfaceDescriptor(props: SurfaceProps): SurfaceDescriptor;
//# sourceMappingURL=surface.d.ts.map