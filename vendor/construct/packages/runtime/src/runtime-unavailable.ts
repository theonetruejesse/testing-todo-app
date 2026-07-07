export function constructRuntimeUnavailable(name: string): never {
  throw new Error(
    `${name} is a Construct runtime facade placeholder. The host artifact loader must provide the real implementation.`,
  );
}
