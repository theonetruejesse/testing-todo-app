import type { ConstructActionFormHandle, ConstructActionHandle, ConstructFormatter, ConstructJsonValue, ConstructLocalContext, ConstructLocaleInfo, ConstructResourceHandle, ConstructResourceOptions, ConstructSurfaceInfo, ConstructViewportInfo } from "./types.js";
export declare function useConstructResource<TData = unknown, TInput = ConstructJsonValue>(_resourceId: string, _options?: ConstructResourceOptions<TInput>): ConstructResourceHandle<TData>;
export declare function useConstructAction<TInput = ConstructJsonValue, TOutput = unknown>(_actionId: string): ConstructActionHandle<TInput, TOutput>;
export declare function useConstructActionForm<TInput = ConstructJsonValue, TOutput = unknown>(_actionId: string): ConstructActionFormHandle<TInput, TOutput>;
export declare function useConstructSetting<TValue = ConstructJsonValue>(_settingId: string, _fallback?: TValue): TValue;
export declare function createConstructLocalContext<TValue>(displayName: string): ConstructLocalContext<TValue>;
export declare function useConstructLocalContext<TValue>(_context: ConstructLocalContext<TValue>): TValue;
export declare function useConstructSurface(): ConstructSurfaceInfo;
export declare function useConstructViewport(): ConstructViewportInfo;
export declare function useConstructLocale(): ConstructLocaleInfo;
export declare function useConstructFormat(): ConstructFormatter;
//# sourceMappingURL=hooks.d.ts.map