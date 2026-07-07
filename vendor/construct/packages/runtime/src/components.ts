import type { ReactNode } from "react";
import type {
  ConstructActionFormHandle,
  ConstructActionHandle,
  ConstructFieldHandle,
  ConstructJsonValue,
  ConstructResourceHandle,
} from "./types.js";

export type ConstructResourceBoundaryProps<TData = unknown> = {
  resource: ConstructResourceHandle<TData>;
  loading?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
  children: (data: TData) => ReactNode;
};

export function ConstructResourceBoundary<TData = unknown>(
  props: ConstructResourceBoundaryProps<TData>,
): ReactNode {
  if (props.resource.status === "success" && props.resource.data !== undefined) {
    return props.children(props.resource.data);
  }
  if (props.resource.status === "error") return props.error ?? null;
  if (props.resource.status === "loading") return props.loading ?? null;
  return props.empty ?? null;
}

export type ConstructActionButtonProps<TInput = ConstructJsonValue, TOutput = unknown> = {
  action: ConstructActionHandle<TInput, TOutput> | ConstructActionFormHandle<TInput, TOutput>;
  input?: TInput;
  disabled?: boolean;
  children?: ReactNode;
};

export function ConstructActionButton<TInput = ConstructJsonValue, TOutput = unknown>(
  props: ConstructActionButtonProps<TInput, TOutput>,
): ReactNode {
  return props.children ?? null;
}

export type ConstructFormProps<TInput = ConstructJsonValue, TOutput = unknown> = {
  form?: ConstructActionFormHandle<TInput, TOutput>;
  action?: ConstructActionHandle<TInput, TOutput>;
  input?: TInput;
  children?: ReactNode;
};

export function ConstructForm<TInput = ConstructJsonValue, TOutput = unknown>(
  props: ConstructFormProps<TInput, TOutput>,
): ReactNode {
  return props.children ?? null;
}

export type ConstructFieldProps<TValue = unknown> = {
  form?: ConstructActionFormHandle<never, unknown>;
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  children: (field: ConstructFieldHandle<TValue>) => ReactNode;
};

export function ConstructField<TValue = unknown>(_props: ConstructFieldProps<TValue>): ReactNode {
  return null;
}

export type ConstructLinkProps = {
  to?: string;
  params?: Record<string, ConstructJsonValue>;
  external?: boolean;
  href?: string;
  children?: ReactNode;
};

export function ConstructLink(props: ConstructLinkProps): ReactNode {
  return props.children ?? null;
}

export type ConstructIconProps = {
  name: string;
  decorative?: boolean;
  label?: string;
};

export function ConstructIcon(_props: ConstructIconProps): ReactNode {
  return null;
}
