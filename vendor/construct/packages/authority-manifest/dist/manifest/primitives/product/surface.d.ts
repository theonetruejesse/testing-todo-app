import type { ConstructId, EntrypointPath, FilePattern, RoutePattern } from "../shared.js";
export type SurfaceDeclaration = {
    id: ConstructId;
    title: string;
    description?: string;
};
export type SurfaceMetadata = {
    additiveRoot: FilePattern;
    routes: RoutePattern[];
    entrypoints: EntrypointPath[];
    files: FilePattern[];
};
export type ResolvedSurface = SurfaceDeclaration & {
    metadata: SurfaceMetadata;
};
//# sourceMappingURL=surface.d.ts.map