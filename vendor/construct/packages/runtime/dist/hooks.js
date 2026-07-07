import { constructRuntimeUnavailable } from "./runtime-unavailable.js";
export function useConstructResource(_resourceId, _options) {
    return constructRuntimeUnavailable("useConstructResource");
}
export function useConstructAction(_actionId) {
    return constructRuntimeUnavailable("useConstructAction");
}
export function useConstructActionForm(_actionId) {
    return constructRuntimeUnavailable("useConstructActionForm");
}
export function useConstructSetting(_settingId, _fallback) {
    return constructRuntimeUnavailable("useConstructSetting");
}
export function createConstructLocalContext(displayName) {
    return {
        displayName,
        Provider: (props) => props.children ?? null,
    };
}
export function useConstructLocalContext(_context) {
    return constructRuntimeUnavailable("useConstructLocalContext");
}
export function useConstructSurface() {
    return constructRuntimeUnavailable("useConstructSurface");
}
export function useConstructViewport() {
    return constructRuntimeUnavailable("useConstructViewport");
}
export function useConstructLocale() {
    return constructRuntimeUnavailable("useConstructLocale");
}
export function useConstructFormat() {
    return constructRuntimeUnavailable("useConstructFormat");
}
//# sourceMappingURL=hooks.js.map