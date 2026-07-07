import { constructRuntimeUnavailable } from "./runtime-unavailable.js";
import type {
  ConstructActionFormHandle,
  ConstructActionHandle,
  ConstructFormatter,
  ConstructJsonValue,
  ConstructLocalContext,
  ConstructLocaleInfo,
  ConstructResourceHandle,
  ConstructResourceOptions,
  ConstructSurfaceInfo,
  ConstructViewportInfo,
} from "./types.js";

export function useConstructResource<TData = unknown, TInput = ConstructJsonValue>(
  _resourceId: string,
  _options?: ConstructResourceOptions<TInput>,
): ConstructResourceHandle<TData> {
  return constructRuntimeUnavailable("useConstructResource");
}

export function useConstructAction<TInput = ConstructJsonValue, TOutput = unknown>(
  _actionId: string,
): ConstructActionHandle<TInput, TOutput> {
  return constructRuntimeUnavailable("useConstructAction");
}

export function useConstructActionForm<TInput = ConstructJsonValue, TOutput = unknown>(
  _actionId: string,
): ConstructActionFormHandle<TInput, TOutput> {
  return constructRuntimeUnavailable("useConstructActionForm");
}

export function useConstructSetting<TValue = ConstructJsonValue>(
  _settingId: string,
  _fallback?: TValue,
): TValue {
  return constructRuntimeUnavailable("useConstructSetting");
}

export function createConstructLocalContext<TValue>(
  displayName: string,
): ConstructLocalContext<TValue> {
  return {
    displayName,
    Provider: (props) => props.children ?? null,
  };
}

export function useConstructLocalContext<TValue>(_context: ConstructLocalContext<TValue>): TValue {
  return constructRuntimeUnavailable("useConstructLocalContext");
}

export function useConstructSurface(): ConstructSurfaceInfo {
  return constructRuntimeUnavailable("useConstructSurface");
}

export function useConstructViewport(): ConstructViewportInfo {
  return constructRuntimeUnavailable("useConstructViewport");
}

export function useConstructLocale(): ConstructLocaleInfo {
  return constructRuntimeUnavailable("useConstructLocale");
}

export function useConstructFormat(): ConstructFormatter {
  return constructRuntimeUnavailable("useConstructFormat");
}
