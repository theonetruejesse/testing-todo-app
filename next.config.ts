import { constructRuntimeHeaders } from "@construct/sdk/next/server";
import type { NextConfig } from "next";

// Construct owns the stable cloud origins; the host only opts into the
// development script policy needed by the local Next.js compiler.
const runtimeHeaders = constructRuntimeHeaders(
  {},
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
