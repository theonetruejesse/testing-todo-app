import { constructRuntimeHeaders } from "@construct/sdk/next/server";
import type { NextConfig } from "next";
import { constructCloudOverrideForPlatformApi } from "./src/lib/construct-runtime/cloud";

// Internal dogfood endpoints select one exact framing control plane. The
// development flag remains separate because only local Next.js needs eval.
const runtimeHeaders = constructRuntimeHeaders(
  constructCloudOverrideForPlatformApi(process.env.CONSTRUCT_INTERNAL_PLATFORM_API_URL),
  { development: process.env.NODE_ENV === "development" },
);

const nextConfig: NextConfig = {
  ...(runtimeHeaders.length
    ? {
        async headers() {
          return runtimeHeaders;
        },
      }
    : {}),
};

export default nextConfig;
