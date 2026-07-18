import { CONSTRUCT_APPROVED_EVENT_PROPS } from "@construct/runtime/policy";
import * as JsxDevRuntime from "react/jsx-dev-runtime";
import * as JsxRuntime from "react/jsx-runtime";

// Gatekeeper may compile approved artifacts in development mode. Preserve
// jsxDEV's static-children metadata so React does not misclassify ordinary JSX
// sibling arrays as unkeyed dynamic lists when the module runs in the host.
export const artifactJsxRuntime = {
  ...JsxRuntime,
  jsx: ((type, props, key) =>
    JsxRuntime.jsx(
      type,
      sanitizeIntrinsicEventHandlers(type, props),
      key,
    )) satisfies typeof JsxRuntime.jsx,
  jsxs: ((type, props, key) =>
    JsxRuntime.jsxs(
      type,
      sanitizeIntrinsicEventHandlers(type, props),
      key,
    )) satisfies typeof JsxRuntime.jsxs,
  jsxDEV: ((type, props, key, isStaticChildren, source, self) =>
    JsxDevRuntime.jsxDEV(
      type,
      sanitizeIntrinsicEventHandlers(type, props),
      key,
      isStaticChildren,
      source,
      self,
    )) satisfies typeof JsxDevRuntime.jsxDEV,
};

function sanitizeIntrinsicEventHandlers(type: unknown, props: unknown): unknown {
  if (typeof type !== "string" || !isRecord(props)) return props;

  let nextProps: Record<string, unknown> | undefined;
  for (const propName of CONSTRUCT_APPROVED_EVENT_PROPS) {
    const handler = props[propName];
    if (typeof handler !== "function") continue;
    nextProps ??= { ...props };
    nextProps[propName] = (event: unknown) => handler(createConstructEventFacade(event));
  }
  return nextProps ?? props;
}

function createConstructEventFacade(event: unknown) {
  const source = isRecord(event) ? event : {};
  const target = isRecord(source.currentTarget)
    ? source.currentTarget
    : isRecord(source.target)
      ? source.target
      : {};

  return {
    value: typeof target.value === "string" ? target.value : "",
    checked: target.checked === true,
    name: typeof target.name === "string" ? target.name : "",
    key: typeof source.key === "string" ? source.key : "",
    preventDefault: () => callEventMethod(source, "preventDefault"),
    stopPropagation: () => callEventMethod(source, "stopPropagation"),
  };
}

function callEventMethod(event: Record<string, unknown>, methodName: string): void {
  const method = event[methodName];
  if (typeof method === "function") method.call(event);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
