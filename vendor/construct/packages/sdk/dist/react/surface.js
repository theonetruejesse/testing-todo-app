"use client";
import { loadConstructArtifactModule } from "@construct/runtime/loader";
import * as ReactRuntime from "react";
import { createContext, createElement, useContext, useEffect, useId, useMemo, useReducer, useState, } from "react";
import * as JsxRuntime from "react/jsx-runtime";
const ConstructContext = createContext(null);
const artifactModuleCache = new Map();
export function ConstructProvider(props) {
    const parent = useContext(ConstructContext);
    const value = useMemo(() => ({
        actionHandlers: {
            ...(parent?.actionHandlers ?? {}),
            ...(props.actionHandlers ?? {}),
        },
        artifactScope: {
            ...(parent?.artifactScope ?? {}),
            ...(props.artifactScope ?? {}),
        },
        constructRuntime: props.constructRuntime ?? parent?.constructRuntime ?? constructHostRuntime,
        currentSurface: parent?.currentSurface,
        enabled: props.enabled ?? parent?.enabled ?? true,
        onSurfaceError: props.onSurfaceError ?? parent?.onSurfaceError,
        resourceHandlers: {
            ...(parent?.resourceHandlers ?? {}),
            ...(props.resourceHandlers ?? {}),
        },
        resolveRuntimeArtifact: props.resolveRuntimeArtifact ?? parent?.resolveRuntimeArtifact,
        settings: {
            ...(parent?.settings ?? {}),
            ...(props.settings ?? {}),
        },
    }), [
        parent,
        props.actionHandlers,
        props.artifactScope,
        props.constructRuntime,
        props.enabled,
        props.onSurfaceError,
        props.resourceHandlers,
        props.resolveRuntimeArtifact,
        props.settings,
    ]);
    return createElement(ConstructContext.Provider, { value }, props.children);
}
// Host-authored annotation and runtime mount. Gatekeeper scans host source for
// literal Surface props; runtime loading remains provider-driven and can be
// disabled or tenant-scoped without changing the marker shape.
export function Surface(props) {
    const construct = useContext(ConstructContext);
    const [loaded, setLoaded] = useState(null);
    const [loadError, setLoadError] = useState(null);
    useEffect(() => {
        if (!construct?.enabled || !construct.resolveRuntimeArtifact) {
            setLoaded(null);
            setLoadError(null);
            return;
        }
        let cancelled = false;
        const resolutionInput = {
            ...construct.artifactScope,
            surfaceId: props.id,
        };
        construct
            .resolveRuntimeArtifact(resolutionInput)
            .then(async (descriptor) => {
            if (!descriptor?.moduleUrl)
                return null;
            const Component = await loadSurfaceComponent({
                constructRuntime: construct.constructRuntime,
                moduleUrl: descriptor.moduleUrl,
            });
            return { descriptor, Component };
        })
            .then((nextLoaded) => {
            if (cancelled)
                return;
            setLoaded(nextLoaded);
            setLoadError(null);
        })
            .catch((error) => {
            if (cancelled)
                return;
            setLoaded(null);
            setLoadError(error);
            construct.onSurfaceError?.(error, props.id);
        });
        return () => {
            cancelled = true;
        };
    }, [construct, props.id]);
    useSurfaceStyles(loaded?.descriptor.styleUrls ?? []);
    if (loaded && construct) {
        return createElement(SurfaceErrorBoundary, {
            fallback: props.children ?? null,
            onError: (error) => construct?.onSurfaceError?.(error, props.id),
        }, createElement(ConstructContext.Provider, {
            value: {
                ...construct,
                currentSurface: {
                    artifactId: loaded.descriptor.artifactId,
                    surfaceId: props.id,
                    theme: "system",
                },
            },
        }, createElement(loaded.Component)));
    }
    if (loadError)
        return props.children ?? null;
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
async function loadSurfaceComponent(input) {
    const cached = artifactModuleCache.get(input.moduleUrl) ??
        loadConstructArtifactModule(input.moduleUrl, {
            React: ReactRuntime,
            jsxRuntime: JsxRuntime,
            ConstructRuntime: input.constructRuntime,
        }).then((module) => module.default);
    artifactModuleCache.set(input.moduleUrl, cached);
    return cached;
}
function useSurfaceStyles(urls) {
    useEffect(() => {
        if (urls.length === 0)
            return;
        const links = urls.map((url) => {
            const link = document.createElement("link");
            link.href = url;
            link.rel = "stylesheet";
            link.setAttribute("data-construct-artifact-style", "true");
            document.head.appendChild(link);
            return link;
        });
        return () => {
            for (const link of links)
                link.remove();
        };
    }, [urls]);
}
class SurfaceErrorBoundary extends ReactRuntime.Component {
    state = { error: null };
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, _errorInfo) {
        this.props.onError?.(error);
    }
    render() {
        if (this.state.error)
            return this.props.fallback;
        return this.props.children ?? null;
    }
}
const constructHostRuntime = {
    ConstructActionButton,
    ConstructField,
    ConstructForm,
    ConstructIcon,
    ConstructLink,
    ConstructResourceBoundary,
    constructClassNames,
    constructRange,
    createConstructLocalContext,
    useConstructAction,
    useConstructActionForm,
    useConstructFormat,
    useConstructLocale,
    useConstructLocalContext,
    useConstructResource,
    useConstructSetting,
    useConstructSurface,
    useConstructViewport,
};
function useConstructResource(resourceId, options) {
    const construct = useContext(ConstructContext);
    const handler = construct?.resourceHandlers[resourceId];
    const [refreshNonce, refresh] = useReducer((value) => value + 1, 0);
    const [state, setState] = useState({ status: handler ? "loading" : "error", data: undefined, error: undefined });
    useEffect(() => {
        void refreshNonce;
        if (!handler) {
            setState({
                status: "error",
                data: undefined,
                error: {
                    code: "construct.resource.missing-handler",
                    message: `No Construct resource handler is registered for ${resourceId}.`,
                },
            });
            return;
        }
        let cancelled = false;
        const timeout = window.setTimeout(() => {
            setState((current) => ({ ...current, status: "loading", error: undefined }));
            handler(options?.input)
                .then((data) => {
                if (!cancelled)
                    setState({ status: "success", data: data, error: undefined });
            })
                .catch((error) => {
                if (!cancelled) {
                    setState({ status: "error", data: undefined, error: toConstructDisplayError(error) });
                }
            });
        }, options?.inputDebounceMs ?? 0);
        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, [handler, options?.input, options?.inputDebounceMs, refreshNonce, resourceId]);
    return {
        ...state,
        refresh: async () => {
            refresh();
        },
    };
}
function useConstructAction(actionId) {
    const construct = useContext(ConstructContext);
    const handler = construct?.actionHandlers[actionId];
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(undefined);
    return useMemo(() => ({
        status,
        error,
        reset: () => {
            setStatus("idle");
            setError(undefined);
        },
        run: async (input) => {
            if (!handler) {
                const nextError = {
                    code: "construct.action.missing-handler",
                    message: `No Construct action handler is registered for ${actionId}.`,
                };
                setStatus("error");
                setError(nextError);
                throw nextError;
            }
            setStatus("pending");
            setError(undefined);
            try {
                const output = await handler(input);
                setStatus("success");
                return output;
            }
            catch (runError) {
                const nextError = toConstructDisplayError(runError);
                setStatus("error");
                setError(nextError);
                throw nextError;
            }
        },
    }), [actionId, error, handler, status]);
}
function useConstructActionForm(actionId) {
    const action = useConstructAction(actionId);
    return useMemo(() => ({
        action,
        status: action.status,
        error: action.error,
        submit: () => action.run({}),
        reset: action.reset,
    }), [action]);
}
function useConstructSetting(settingId, fallback) {
    const construct = useContext(ConstructContext);
    return (construct?.settings[settingId] ?? fallback);
}
function createConstructLocalContext(displayName) {
    const Context = createContext(undefined);
    return {
        displayName,
        Provider: ({ value, children }) => createElement(Context.Provider, { value }, children),
        _context: Context,
    };
}
function useConstructLocalContext(context) {
    const backingContext = context._context;
    if (!backingContext) {
        throw new Error(`Construct local context "${context.displayName}" is not host-readable.`);
    }
    const value = useContext(backingContext);
    if (value === undefined) {
        throw new Error(`Construct local context "${context.displayName}" is missing a provider.`);
    }
    return value;
}
function useConstructSurface() {
    const construct = useContext(ConstructContext);
    return construct?.currentSurface ?? { surfaceId: "unknown", theme: "system" };
}
function useConstructViewport() {
    const [size, setSize] = useState("desktop");
    useEffect(() => {
        const update = () => {
            if (window.innerWidth < 640)
                setSize("mobile");
            else if (window.innerWidth < 1024)
                setSize("tablet");
            else
                setSize("desktop");
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    return { size };
}
function useConstructLocale() {
    return { locale: navigator.language || "en-US", direction: "ltr" };
}
function useConstructFormat() {
    const locale = useConstructLocale();
    return useMemo(() => ({
        date: (value, options) => new Intl.DateTimeFormat(locale.locale, options).format(new Date(value)),
        number: (value, options) => new Intl.NumberFormat(locale.locale, options).format(value),
        currency: (value, currency, options) => new Intl.NumberFormat(locale.locale, { ...options, style: "currency", currency }).format(value),
        relativeTime: (value, unit, options) => new Intl.RelativeTimeFormat(locale.locale, options).format(value, unit),
    }), [locale.locale]);
}
function ConstructResourceBoundary(props) {
    if (props.resource.status === "success" && props.resource.data !== undefined) {
        return props.children(props.resource.data);
    }
    if (props.resource.status === "error")
        return props.error ?? null;
    if (props.resource.status === "loading")
        return props.loading ?? null;
    return props.empty ?? null;
}
function ConstructActionButton(props) {
    const action = "run" in props.action ? props.action : props.action.action;
    return createElement("button", {
        disabled: props.disabled || action.status === "pending",
        onClick: () => action.run((props.input ?? {})).catch(() => undefined),
        type: "button",
    }, props.children);
}
function ConstructForm(props) {
    return createElement("form", {
        onSubmit: (event) => {
            event.preventDefault();
            if (props.form)
                props.form.submit().catch(() => undefined);
            else if (props.action)
                props.action.run((props.input ?? {})).catch(() => undefined);
        },
    }, props.children);
}
function ConstructField(props) {
    const id = useId();
    const [value, setValue] = useState("");
    return props.children({
        id,
        name: props.name,
        value,
        error: undefined,
        setValue,
    });
}
function ConstructLink(props) {
    return createElement("a", {
        href: props.external ? props.href : "#",
        rel: props.external ? "noreferrer" : undefined,
        target: props.external ? "_blank" : undefined,
    }, props.children);
}
function ConstructIcon(props) {
    return createElement("span", {
        "aria-hidden": props.decorative ? true : undefined,
        "aria-label": props.decorative ? undefined : props.label || props.name,
    }, props.decorative ? "" : props.label || props.name);
}
function constructClassNames(...values) {
    return values
        .flatMap((value) => {
        if (!value)
            return [];
        if (typeof value === "string")
            return [value];
        if (Array.isArray(value)) {
            return [constructClassNames(...value)];
        }
        return Object.entries(value)
            .filter(([, enabled]) => Boolean(enabled))
            .map(([className]) => className);
    })
        .filter(Boolean)
        .join(" ");
}
function constructRange(length) {
    return Array.from({ length: Math.max(0, Math.min(Math.floor(length), 100)) }, (_, index) => index);
}
function toConstructDisplayError(error) {
    if (typeof error === "object" && error && "message" in error) {
        return {
            code: "construct.runtime.error",
            message: String(error.message),
        };
    }
    return {
        code: "construct.runtime.error",
        message: String(error),
    };
}
//# sourceMappingURL=surface.js.map