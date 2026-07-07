export function ConstructResourceBoundary(props) {
    if (props.resource.status === "success" && props.resource.data !== undefined) {
        return props.children(props.resource.data);
    }
    if (props.resource.status === "error")
        return props.error ?? null;
    if (props.resource.status === "loading")
        return props.loading ?? null;
    return props.empty ?? null;
}
export function ConstructActionButton(props) {
    return props.children ?? null;
}
export function ConstructForm(props) {
    return props.children ?? null;
}
export function ConstructField(_props) {
    return null;
}
export function ConstructLink(props) {
    return props.children ?? null;
}
export function ConstructIcon(_props) {
    return null;
}
//# sourceMappingURL=components.js.map