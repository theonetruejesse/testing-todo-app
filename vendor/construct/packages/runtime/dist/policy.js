export const CONSTRUCT_RUNTIME_APPROVED_IMPORTS = [
    "ConstructActionButton",
    "ConstructField",
    "ConstructForm",
    "ConstructIcon",
    "ConstructLink",
    "ConstructResourceBoundary",
    "constructClassNames",
    "constructRange",
    "createConstructLocalContext",
    "useConstructAction",
    "useConstructActionForm",
    "useConstructFormat",
    "useConstructLocale",
    "useConstructLocalContext",
    "useConstructResource",
    "useConstructSetting",
    "useConstructSurface",
    "useConstructViewport",
];
// Gatekeeper and the host JSX adapter share this list so an approved handler
// always receives the same sanitized event contract at validation and runtime.
export const CONSTRUCT_APPROVED_EVENT_PROPS = [
    "onBlur",
    "onChange",
    "onClick",
    "onFocus",
    "onInput",
    "onKeyDown",
    "onSubmit",
];
//# sourceMappingURL=policy.js.map