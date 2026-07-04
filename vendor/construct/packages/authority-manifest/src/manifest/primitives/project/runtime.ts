import type { PackageManager, RepoRelativePath, RuntimeFramework } from "../shared.js";

// Host-authored or compiler-detected. Runtime describes the host app's framework
// shape so later compiler passes can interpret project structure consistently.
export type ConstructRuntimeIdentity = {
  framework: RuntimeFramework;
  packageManager?: PackageManager;
  appPath?: RepoRelativePath;
};
