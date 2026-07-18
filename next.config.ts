import type { NextConfig } from "next";

const previewEnabled = process.env.CONSTRUCT_RUNTIME_PREVIEWS_ENABLED === "true";
const platformWebOrigin = previewEnabled
  ? exactOrigin(process.env.CONSTRUCT_PLATFORM_WEB_ORIGIN)
  : null;

const nextConfig: NextConfig = {
  // Blob-backed code and styles are needed only by selected-version preview
  // documents. Production assignment mode keeps its pre-preview CSP behavior.
  ...(previewEnabled
    ? {
        async headers() {
          return [
            {
              headers: [
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "base-uri 'self'",
                    "connect-src 'self'",
                    "font-src 'self' data:",
                    `frame-ancestors ${platformWebOrigin}`,
                    "img-src 'self' data: blob:",
                    "object-src 'none'",
                    "form-action 'self'",
                    "script-src 'self' 'unsafe-inline' blob:",
                    "style-src 'self' 'unsafe-inline' blob:",
                  ].join("; "),
                },
                { key: "Referrer-Policy", value: "no-referrer" },
              ],
              source: "/:path*",
            },
          ];
        },
      }
    : {}),
};

function exactOrigin(value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error("Preview-enabled builds require CONSTRUCT_PLATFORM_WEB_ORIGIN.");
  }
  const url = new URL(value.trim());
  if (url.href !== `${url.origin}/`) {
    throw new Error("CONSTRUCT_PLATFORM_WEB_ORIGIN must be an exact origin without a path.");
  }
  return url.origin;
}

export default nextConfig;
