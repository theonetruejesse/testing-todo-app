import type { FilePattern, PackageScriptName } from "../shared.js";
export type ProjectReadScope = {
    allow: FilePattern[];
    deny?: FilePattern[];
};
export type PackageScriptScope = {
    allow?: PackageScriptName[];
    review?: PackageScriptName[];
    deny?: PackageScriptName[];
};
export type ProjectScopeDeclaration = {
    read: ProjectReadScope;
    scripts?: PackageScriptScope;
};
export declare function defaultProjectScope(): ProjectScopeDeclaration;
//# sourceMappingURL=scope.d.ts.map