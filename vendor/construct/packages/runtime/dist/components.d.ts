import type { ReactNode } from "react";
import type { ConstructActionFormHandle, ConstructActionHandle, ConstructFieldHandle, ConstructJsonValue, ConstructResourceHandle } from "./types.js";
export type ConstructResourceBoundaryProps<TData = unknown> = {
    resource: ConstructResourceHandle<TData>;
    loading?: ReactNode;
    empty?: ReactNode;
    error?: ReactNode;
    children: (data: TData) => ReactNode;
};
export declare function ConstructResourceBoundary<TData = unknown>(props: ConstructResourceBoundaryProps<TData>): ReactNode;
export type ConstructActionButtonProps<TInput = ConstructJsonValue, TOutput = unknown> = {
    action: ConstructActionHandle<TInput, TOutput> | ConstructActionFormHandle<TInput, TOutput>;
    input?: TInput;
    disabled?: boolean;
    children?: ReactNode;
};
export declare function ConstructActionButton<TInput = ConstructJsonValue, TOutput = unknown>(props: ConstructActionButtonProps<TInput, TOutput>): ReactNode;
export type ConstructFormProps<TInput = ConstructJsonValue, TOutput = unknown> = {
    form?: ConstructActionFormHandle<TInput, TOutput>;
    action?: ConstructActionHandle<TInput, TOutput>;
    input?: TInput;
    children?: ReactNode;
};
export declare function ConstructForm<TInput = ConstructJsonValue, TOutput = unknown>(props: ConstructFormProps<TInput, TOutput>): ReactNode;
export type ConstructFieldProps<TValue = unknown> = {
    form?: ConstructActionFormHandle<never, unknown>;
    name: string;
    label?: ReactNode;
    description?: ReactNode;
    children: (field: ConstructFieldHandle<TValue>) => ReactNode;
};
export declare function ConstructField<TValue = unknown>(_props: ConstructFieldProps<TValue>): ReactNode;
export type ConstructLinkProps = {
    to?: string;
    params?: Record<string, ConstructJsonValue>;
    external?: boolean;
    href?: string;
    children?: ReactNode;
};
export declare function ConstructLink(props: ConstructLinkProps): ReactNode;
export type ConstructIconProps = {
    name: string;
    decorative?: boolean;
    label?: string;
};
export declare function ConstructIcon(_props: ConstructIconProps): ReactNode;
//# sourceMappingURL=components.d.ts.map