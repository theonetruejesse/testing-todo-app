// Host-authored annotation. At runtime this wrapper is transparent; Gatekeeper
// scans the source props and turns them into manifest surfaces.
export function Surface(props) {
    return props.children ?? null;
}
export function createSurfaceDescriptor(props) {
    return {
        kind: "construct.react.surface",
        id: props.id,
        title: props.title,
        description: props.description,
    };
}
//# sourceMappingURL=surface.js.map