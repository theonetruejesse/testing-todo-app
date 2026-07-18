"use client";

import type { ConstructId } from "@construct/authority-manifest/manifest/primitives/shared";
import type {
  ConstructActionFormHandle,
  ConstructActionHandle,
  ConstructActionStatus,
  ConstructDisplayError,
  ConstructFieldHandle,
  ConstructFormatter,
  ConstructJsonValue,
  ConstructLocalContext,
  ConstructLocaleInfo,
  ConstructResourceHandle,
  ConstructResourceOptions,
  ConstructResourceStatus,
  ConstructSurfaceInfo,
  ConstructViewportInfo,
} from "@construct/runtime";
import { loadConstructArtifactModule } from "@construct/runtime/loader";
import * as ReactRuntime from "react";
import {
  type ComponentType,
  createContext,
  createElement,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useState,
} from "react";
import * as JsxRuntime from "react/jsx-runtime";

export type ConstructRuntimeArtifactScope = {
  runId?: string;
  workspaceTemplateId?: string;
  authorityCompilationId?: string;
};

export type ConstructRuntimeArtifactResolutionInput = ConstructRuntimeArtifactScope & {
  surfaceId: ConstructId;
};

export type ConstructRuntimeArtifactDescriptor = {
  artifactId: string;
  surfaceId: ConstructId;
  artifactRoot: string;
  status: "approved";
  contentHash: string;
  moduleUrl: string | null;
  manifestUrl: string | null;
  proposalBundleUrl: string | null;
  patchUrl: string | null;
  sourceMapUrls: string[];
  styleUrls: string[];
  metadata: Record<string, unknown>;
};

export type ConstructProviderProps = {
  actionInvalidations?: Record<string, string[]>;
  artifactScope?: ConstructRuntimeArtifactScope;
  actionHandlers?: Record<string, (input: ConstructJsonValue) => Promise<unknown>>;
  children?: ReactNode;
  constructRuntime?: Record<string, unknown>;
  enabled?: boolean;
  onSurfaceError?: (error: unknown, surfaceId: ConstructId) => void;
  onSurfaceReady?: (descriptor: ConstructRuntimeArtifactDescriptor, surfaceId: ConstructId) => void;
  resourceHandlers?: Record<string, (input: ConstructJsonValue | undefined) => Promise<unknown>>;
  resolveRuntimeArtifact?: (
    input: ConstructRuntimeArtifactResolutionInput,
  ) => Promise<ConstructRuntimeArtifactDescriptor | null>;
  settings?: Record<string, ConstructJsonValue>;
};

type ConstructProviderValue = {
  actionInvalidations: Record<string, string[]>;
  actionHandlers: Record<string, (input: ConstructJsonValue) => Promise<unknown>>;
  artifactScope: ConstructRuntimeArtifactScope;
  constructRuntime: Record<string, unknown>;
  currentSurface?: ConstructSurfaceInfo;
  enabled: boolean;
  invalidateResources: (resourceIds: string[]) => void;
  onSurfaceError?: (error: unknown, surfaceId: ConstructId) => void;
  onSurfaceReady?: ConstructProviderProps["onSurfaceReady"];
  resourceInvalidationVersion: Record<string, number>;
  resourceHandlers: Record<string, (input: ConstructJsonValue | undefined) => Promise<unknown>>;
  resolveRuntimeArtifact?: ConstructProviderProps["resolveRuntimeArtifact"];
  settings: Record<string, ConstructJsonValue>;
};

export type SurfaceProps = {
  id: ConstructId;
  title: string;
  description?: string;
  children?: ReactNode;
};

export type SurfaceDescriptor = {
  kind: "construct.react.surface";
  id: ConstructId;
  title: string;
  description?: string;
};

const ConstructContext = createContext<ConstructProviderValue | null>(null);
const artifactModuleCache = new Map<string, Promise<ComponentType>>();

export function ConstructProvider(props: ConstructProviderProps): ReactNode {
  const parent = useContext(ConstructContext);
  const [localResourceInvalidationVersion, setLocalResourceInvalidationVersion] = useState<
    Record<string, number>
  >({});
  const invalidateResources = useCallback(
    (resourceIds: string[]) => {
      if (resourceIds.length === 0) return;
      setLocalResourceInvalidationVersion((current) => {
        const next = { ...current };
        for (const resourceId of resourceIds) {
          next[resourceId] = (next[resourceId] ?? 0) + 1;
        }
        return next;
      });
      parent?.invalidateResources(resourceIds);
    },
    [parent],
  );
  const value = useMemo<ConstructProviderValue>(
    () => ({
      actionInvalidations: {
        ...(parent?.actionInvalidations ?? {}),
        ...(props.actionInvalidations ?? {}),
      },
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
      invalidateResources,
      onSurfaceError: props.onSurfaceError ?? parent?.onSurfaceError,
      onSurfaceReady: props.onSurfaceReady ?? parent?.onSurfaceReady,
      resourceInvalidationVersion: {
        ...(parent?.resourceInvalidationVersion ?? {}),
        ...localResourceInvalidationVersion,
      },
      resourceHandlers: {
        ...(parent?.resourceHandlers ?? {}),
        ...(props.resourceHandlers ?? {}),
      },
      resolveRuntimeArtifact: props.resolveRuntimeArtifact ?? parent?.resolveRuntimeArtifact,
      settings: {
        ...(parent?.settings ?? {}),
        ...(props.settings ?? {}),
      },
    }),
    [
      parent,
      props.actionInvalidations,
      props.actionHandlers,
      props.artifactScope,
      props.constructRuntime,
      props.enabled,
      invalidateResources,
      localResourceInvalidationVersion,
      props.onSurfaceError,
      props.onSurfaceReady,
      props.resourceHandlers,
      props.resolveRuntimeArtifact,
      props.settings,
    ],
  );

  return createElement(ConstructContext.Provider, { value }, props.children);
}

// Host-authored annotation and runtime mount. Gatekeeper scans host source for
// literal Surface props; runtime loading remains provider-driven and can be
// disabled or tenant-scoped without changing the marker shape.
export function Surface(props: SurfaceProps): ReactNode {
  const construct = useContext(ConstructContext);
  const [loaded, setLoaded] = useState<{
    descriptor: ConstructRuntimeArtifactDescriptor;
    Component: ComponentType;
  } | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

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
        if (!descriptor?.moduleUrl) return null;
        const Component = await loadSurfaceComponent({
          constructRuntime: construct.constructRuntime,
          moduleUrl: descriptor.moduleUrl,
        });
        return { descriptor, Component };
      })
      .then((nextLoaded) => {
        if (cancelled) return;
        setLoaded(nextLoaded);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
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
    return createElement(
      SurfaceErrorBoundary,
      {
        fallback: props.children ?? null,
        onError: (error) => construct?.onSurfaceError?.(error, props.id),
      },
      createElement(
        ConstructContext.Provider,
        {
          value: {
            ...construct,
            currentSurface: {
              artifactId: loaded.descriptor.artifactId,
              surfaceId: props.id,
              theme: "system",
            },
          },
        },
        createElement(ReadySurface, {
          Component: loaded.Component,
          descriptor: loaded.descriptor,
          onReady: construct.onSurfaceReady,
          surfaceId: props.id,
        }),
      ),
    );
  }

  if (loadError) return props.children ?? null;
  return props.children ?? null;
}

function ReadySurface(input: {
  Component: ComponentType;
  descriptor: ConstructRuntimeArtifactDescriptor;
  onReady?: ConstructProviderProps["onSurfaceReady"];
  surfaceId: ConstructId;
}): ReactNode {
  useEffect(() => {
    // This effect belongs to the generated subtree. It cannot run when module
    // loading fails or the component throws during render, so hosts do not
    // mistake a fallback for a successfully committed artifact.
    input.onReady?.(input.descriptor, input.surfaceId);
  }, [input.descriptor, input.onReady, input.surfaceId]);

  return createElement(input.Component);
}

export function createSurfaceDescriptor(props: SurfaceProps): SurfaceDescriptor {
  return {
    kind: "construct.react.surface",
    id: props.id,
    title: props.title,
    description: props.description,
  };
}

async function loadSurfaceComponent(input: {
  constructRuntime: Record<string, unknown>;
  moduleUrl: string;
}): Promise<ComponentType> {
  const cached =
    artifactModuleCache.get(input.moduleUrl) ??
    loadConstructArtifactModule(input.moduleUrl, {
      React: ReactRuntime,
      jsxRuntime: JsxRuntime,
      ConstructRuntime: input.constructRuntime,
    }).then((module) => module.default);
  artifactModuleCache.set(input.moduleUrl, cached);
  return cached;
}

function useSurfaceStyles(urls: string[]): void {
  useEffect(() => {
    if (urls.length === 0) return;

    const links = urls.map((url) => {
      const link = document.createElement("link");
      link.href = url;
      link.rel = "stylesheet";
      link.setAttribute("data-construct-artifact-style", "true");
      document.head.appendChild(link);
      return link;
    });

    return () => {
      for (const link of links) link.remove();
    };
  }, [urls]);
}

class SurfaceErrorBoundary extends ReactRuntime.Component<
  {
    children?: ReactNode;
    fallback: ReactNode;
    onError?: (error: unknown) => void;
  },
  { error: unknown }
> {
  state = { error: null };

  static getDerivedStateFromError(error: unknown): { error: unknown } {
    return { error };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    this.props.onError?.(error);
  }

  render(): ReactNode {
    if (this.state.error) return this.props.fallback;
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

function useConstructResource<TData = unknown, TInput = ConstructJsonValue>(
  resourceId: string,
  options?: ConstructResourceOptions<TInput>,
): ConstructResourceHandle<TData> {
  const construct = useContext(ConstructContext);
  const handler = construct?.resourceHandlers[resourceId];
  const invalidationVersion = construct?.resourceInvalidationVersion[resourceId] ?? 0;
  const [refreshNonce, refresh] = useReducer((value: number) => value + 1, 0);
  const [state, setState] = useState<{
    status: ConstructResourceStatus;
    data: TData | undefined;
    error: ConstructDisplayError | undefined;
  }>({ status: handler ? "loading" : "error", data: undefined, error: undefined });

  useEffect(() => {
    void invalidationVersion;
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
      handler(options?.input as ConstructJsonValue | undefined)
        .then((data) => {
          if (!cancelled) setState({ status: "success", data: data as TData, error: undefined });
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setState({ status: "error", data: undefined, error: toConstructDisplayError(error) });
          }
        });
    }, options?.inputDebounceMs ?? 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    handler,
    invalidationVersion,
    options?.input,
    options?.inputDebounceMs,
    refreshNonce,
    resourceId,
  ]);

  return {
    ...state,
    refresh: async () => {
      refresh();
    },
  };
}

function useConstructAction<TInput = ConstructJsonValue, TOutput = unknown>(
  actionId: string,
): ConstructActionHandle<TInput, TOutput> {
  const construct = useContext(ConstructContext);
  const handler = construct?.actionHandlers[actionId];
  const invalidatedResourceIds = construct?.actionInvalidations[actionId] ?? [];
  const invalidateResources = construct?.invalidateResources;
  const [status, setStatus] = useState<ConstructActionStatus>("idle");
  const [error, setError] = useState<ConstructDisplayError | undefined>(undefined);

  return useMemo(
    () => ({
      status,
      error,
      reset: () => {
        setStatus("idle");
        setError(undefined);
      },
      run: async (input: TInput) => {
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
          const output = await handler(input as ConstructJsonValue);
          setStatus("success");
          invalidateResources?.(invalidatedResourceIds);
          return output as TOutput;
        } catch (runError) {
          const nextError = toConstructDisplayError(runError);
          setStatus("error");
          setError(nextError);
          throw nextError;
        }
      },
    }),
    [actionId, error, handler, invalidatedResourceIds, invalidateResources, status],
  );
}

function useConstructActionForm<TInput = ConstructJsonValue, TOutput = unknown>(
  actionId: string,
): ConstructActionFormHandle<TInput, TOutput> {
  const action = useConstructAction<TInput, TOutput>(actionId);
  return useMemo(
    () => ({
      action,
      status: action.status,
      error: action.error,
      submit: () => action.run({} as TInput),
      reset: action.reset,
    }),
    [action],
  );
}

function useConstructSetting<TValue = ConstructJsonValue>(
  settingId: string,
  fallback?: TValue,
): TValue {
  const construct = useContext(ConstructContext);
  return ((construct?.settings[settingId] as TValue | undefined) ?? fallback) as TValue;
}

function createConstructLocalContext<TValue>(displayName: string): ConstructLocalContext<TValue> {
  const Context = createContext<TValue | undefined>(undefined);
  return {
    displayName,
    Provider: ({ value, children }) => createElement(Context.Provider, { value }, children),
    _context: Context,
  } as ConstructLocalContext<TValue> & { _context: ReactRuntime.Context<TValue | undefined> };
}

function useConstructLocalContext<TValue>(context: ConstructLocalContext<TValue>): TValue {
  const backingContext = (
    context as ConstructLocalContext<TValue> & {
      _context?: ReactRuntime.Context<TValue | undefined>;
    }
  )._context;
  if (!backingContext) {
    throw new Error(`Construct local context "${context.displayName}" is not host-readable.`);
  }

  const value = useContext(backingContext);
  if (value === undefined) {
    throw new Error(`Construct local context "${context.displayName}" is missing a provider.`);
  }
  return value;
}

function useConstructSurface(): ConstructSurfaceInfo {
  const construct = useContext(ConstructContext);
  return construct?.currentSurface ?? { surfaceId: "unknown", theme: "system" };
}

function useConstructViewport(): ConstructViewportInfo {
  const [size, setSize] = useState<ConstructViewportInfo["size"]>("desktop");

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setSize("mobile");
      else if (window.innerWidth < 1024) setSize("tablet");
      else setSize("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return { size };
}

function useConstructLocale(): ConstructLocaleInfo {
  return { locale: navigator.language || "en-US", direction: "ltr" };
}

function useConstructFormat(): ConstructFormatter {
  const locale = useConstructLocale();
  return useMemo(
    () => ({
      date: (value, options) =>
        new Intl.DateTimeFormat(locale.locale, options).format(new Date(value)),
      number: (value, options) => new Intl.NumberFormat(locale.locale, options).format(value),
      currency: (value, currency, options) =>
        new Intl.NumberFormat(locale.locale, { ...options, style: "currency", currency }).format(
          value,
        ),
      relativeTime: (value, unit, options) =>
        new Intl.RelativeTimeFormat(locale.locale, options).format(value, unit),
    }),
    [locale.locale],
  );
}

function ConstructResourceBoundary<TData = unknown>(props: {
  resource: ConstructResourceHandle<TData>;
  loading?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
  children: (data: TData) => ReactNode;
}): ReactNode {
  if (props.resource.status === "success" && props.resource.data !== undefined) {
    return props.children(props.resource.data);
  }
  if (props.resource.status === "error") return props.error ?? null;
  if (props.resource.status === "loading") return props.loading ?? null;
  return props.empty ?? null;
}

function ConstructActionButton<TInput = ConstructJsonValue, TOutput = unknown>(props: {
  action: ConstructActionHandle<TInput, TOutput> | ConstructActionFormHandle<TInput, TOutput>;
  input?: TInput;
  disabled?: boolean;
  children?: ReactNode;
}): ReactNode {
  const action = "run" in props.action ? props.action : props.action.action;
  return createElement(
    "button",
    {
      disabled: props.disabled || action.status === "pending",
      onClick: () => action.run((props.input ?? {}) as TInput).catch(() => undefined),
      type: "button",
    },
    props.children,
  );
}

function ConstructForm<TInput = ConstructJsonValue, TOutput = unknown>(props: {
  form?: ConstructActionFormHandle<TInput, TOutput>;
  action?: ConstructActionHandle<TInput, TOutput>;
  input?: TInput;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "form",
    {
      onSubmit: (event: Event) => {
        event.preventDefault();
        if (props.form) props.form.submit().catch(() => undefined);
        else if (props.action)
          props.action.run((props.input ?? {}) as TInput).catch(() => undefined);
      },
    },
    props.children,
  );
}

function ConstructField<TValue = unknown>(props: {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  children: (field: ConstructFieldHandle<TValue>) => ReactNode;
}): ReactNode {
  const id = useId();
  const [value, setValue] = useState<TValue>("" as TValue);
  return props.children({
    id,
    name: props.name,
    value,
    error: undefined,
    setValue,
  });
}

function ConstructLink(props: {
  to?: string;
  params?: Record<string, ConstructJsonValue>;
  external?: boolean;
  href?: string;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "a",
    {
      href: props.external ? props.href : "#",
      rel: props.external ? "noreferrer" : undefined,
      target: props.external ? "_blank" : undefined,
    },
    props.children,
  );
}

function ConstructIcon(props: { name: string; decorative?: boolean; label?: string }): ReactNode {
  return createElement(
    "span",
    {
      "aria-hidden": props.decorative ? true : undefined,
      "aria-label": props.decorative ? undefined : props.label || props.name,
    },
    props.decorative ? "" : props.label || props.name,
  );
}

function constructClassNames(
  ...values: Array<string | false | null | undefined | readonly unknown[] | Record<string, unknown>>
): string {
  return values
    .flatMap((value): string[] => {
      if (!value) return [];
      if (typeof value === "string") return [value];
      if (Array.isArray(value)) {
        return [constructClassNames(...(value as Parameters<typeof constructClassNames>))];
      }
      return Object.entries(value)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([className]) => className);
    })
    .filter(Boolean)
    .join(" ");
}

function constructRange(length: number): number[] {
  return Array.from(
    { length: Math.max(0, Math.min(Math.floor(length), 100)) },
    (_, index) => index,
  );
}

function toConstructDisplayError(error: unknown): ConstructDisplayError {
  if (typeof error === "object" && error && "message" in error) {
    return {
      code: "construct.runtime.error",
      message: String((error as { message: unknown }).message),
    };
  }
  return {
    code: "construct.runtime.error",
    message: String(error),
  };
}
