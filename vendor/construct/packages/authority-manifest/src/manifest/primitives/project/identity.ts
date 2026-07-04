import type { ConstructId } from "../shared.js";

// Host-authored or SDK-supplied. Identity names the app whose authority is being
// described. This is the human/product anchor, not a service-owned record.
export type ConstructAppIdentity = {
  id: ConstructId;
  name: string;
  description?: string;
};
