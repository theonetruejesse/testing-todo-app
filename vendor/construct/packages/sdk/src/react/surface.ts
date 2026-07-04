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

// Host-authored annotation. At runtime this wrapper is transparent; Gatekeeper
// scans the source props and turns them into manifest surfaces.
export function Surface<Children = unknown>(props: SurfaceProps<Children>): Children | null {
  return props.children ?? null;
}

export function createSurfaceDescriptor(props: SurfaceProps): SurfaceDescriptor {
  return {
    kind: "construct.react.surface",
    id: props.id,
    title: props.title,
    description: props.description,
  };
}
