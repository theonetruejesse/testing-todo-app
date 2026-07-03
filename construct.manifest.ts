import { defineConstructApp, type ConstructAppManifestInput } from "@construct/sdk/core";
import manifest from "./construct.manifest.json";

export default defineConstructApp(manifest as ConstructAppManifestInput);
