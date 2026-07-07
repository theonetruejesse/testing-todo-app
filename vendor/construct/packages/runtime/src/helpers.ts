export type ConstructClassValue =
  | string
  | false
  | null
  | undefined
  | readonly ConstructClassValue[]
  | { readonly [className: string]: unknown };

export function constructClassNames(...values: ConstructClassValue[]): string {
  const classNames: string[] = [];
  for (const value of values) {
    appendClassValue(classNames, value);
  }
  return classNames.join(" ");
}

export function constructRange(length: number): number[] {
  const boundedLength = Math.max(0, Math.min(Math.floor(length), 100));
  return Array.from({ length: boundedLength }, (_, index) => index);
}

function appendClassValue(classNames: string[], value: ConstructClassValue): void {
  if (!value) return;
  if (typeof value === "string") {
    classNames.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const child of value) {
      appendClassValue(classNames, child);
    }
    return;
  }
  for (const [className, enabled] of Object.entries(value)) {
    if (enabled) classNames.push(className);
  }
}
