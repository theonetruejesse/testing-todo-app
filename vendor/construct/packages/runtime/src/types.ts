import type { ReactNode } from "react";

export type ConstructPrimitive = string | number | boolean | null;

export type ConstructJsonValue =
  | ConstructPrimitive
  | { readonly [key: string]: ConstructJsonValue }
  | readonly ConstructJsonValue[];

export type ConstructDisplayError = {
  code: string;
  message: string;
  details?: ConstructJsonValue;
};

export type ConstructPageInfo = {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  previousCursor?: string | null;
};

export type ConstructResourceStatus = "idle" | "loading" | "success" | "error";

export type ConstructResourceRefreshOptions = {
  everyMs: number;
  whenVisible?: boolean;
};

export type ConstructResourceOptions<TInput = ConstructJsonValue> = {
  input?: TInput;
  inputDebounceMs?: number;
  refresh?: ConstructResourceRefreshOptions;
};

export type ConstructResourceHandle<TData = unknown> = {
  status: ConstructResourceStatus;
  data: TData | undefined;
  error: ConstructDisplayError | undefined;
  pageInfo?: ConstructPageInfo;
  refresh: () => Promise<void>;
};

export type ConstructActionStatus = "idle" | "pending" | "success" | "error";

export type ConstructActionHandle<TInput = ConstructJsonValue, TOutput = unknown> = {
  status: ConstructActionStatus;
  error: ConstructDisplayError | undefined;
  run: (input: TInput) => Promise<TOutput>;
  reset: () => void;
};

export type ConstructActionFormHandle<TInput = ConstructJsonValue, TOutput = unknown> = {
  action: ConstructActionHandle<TInput, TOutput>;
  status: ConstructActionStatus;
  error: ConstructDisplayError | undefined;
  submit: () => Promise<TOutput>;
  reset: () => void;
};

export type ConstructFieldHandle<TValue = unknown> = {
  id: string;
  name: string;
  value: TValue;
  error: ConstructDisplayError | undefined;
  setValue: (value: TValue) => void;
};

export type ConstructLocalContext<TValue> = {
  displayName: string;
  Provider: (props: { value: TValue; children?: ReactNode }) => ReactNode;
};

export type ConstructSurfaceInfo = {
  surfaceId: string;
  artifactId?: string;
  theme: "light" | "dark" | "system";
};

export type ConstructViewportInfo = {
  size: "mobile" | "tablet" | "desktop";
};

export type ConstructLocaleInfo = {
  locale: string;
  direction: "ltr" | "rtl";
  timeZone?: string;
};

export type ConstructFormatter = {
  date: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  number: (value: number, options?: Intl.NumberFormatOptions) => string;
  currency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string;
  relativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ) => string;
};

export type ConstructEventFacade = {
  value: string;
  checked: boolean;
  name: string;
  key: string;
  preventDefault: () => void;
  stopPropagation: () => void;
};

export type ConstructRenderable = ReactNode;
