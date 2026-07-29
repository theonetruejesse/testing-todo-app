const LOCAL_CONTROL_PLANE_ORIGIN = "http://localhost:4200";
const PRODUCTION_CONTROL_PLANE_ORIGIN = "https://app.thejesselee.com";

const CONTROL_PLANE_BY_API_ORIGIN = new Map([
  ["http://127.0.0.1:4100", LOCAL_CONTROL_PLANE_ORIGIN],
  ["http://localhost:4100", LOCAL_CONTROL_PLANE_ORIGIN],
  ["https://api-dev.thejesselee.com", LOCAL_CONTROL_PLANE_ORIGIN],
  ["https://api.thejesselee.com", PRODUCTION_CONTROL_PLANE_ORIGIN],
]);

export type ConstructCloudOverride = Readonly<{
  controlPlaneOrigin?: string;
}>;

/**
 * Internal dogfood deployments pair an API endpoint with one exact framing
 * control plane. Unknown endpoints fail closed instead of broadening CSP.
 */
export function constructCloudOverrideForPlatformApi(
  rawPlatformApiUrl: string | undefined,
): ConstructCloudOverride {
  const configured = rawPlatformApiUrl?.trim();
  if (!configured) return {};

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("CONSTRUCT_INTERNAL_PLATFORM_API_URL must be a valid URL.");
  }
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("CONSTRUCT_INTERNAL_PLATFORM_API_URL must be a credential-free origin.");
  }

  const controlPlaneOrigin = CONTROL_PLANE_BY_API_ORIGIN.get(url.origin);
  if (!controlPlaneOrigin) {
    throw new Error(
      "CONSTRUCT_INTERNAL_PLATFORM_API_URL must use a recognized Construct API origin.",
    );
  }
  return { controlPlaneOrigin };
}
